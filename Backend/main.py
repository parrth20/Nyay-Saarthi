import os
import uuid
import pathlib
import logging
import re
import difflib # For comparison
import shutil # For file operations like copyfileobj
import aiofiles # For async file writing
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import nltk

# Langchain and related imports
from langchain_unstructured import UnstructuredLoader # Use the newer loader
from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_community.document_loaders import UnstructuredFileLoader
# --- Loaders based on requirements.txt ---
from langchain.document_loaders import PyPDFLoader # requires pypdf
from langchain.document_loaders import PDFMinerLoader # requires pdfminer.six
# --- Vector Store and Embeddings ---
from langchain_community.vectorstores import Qdrant
from langchain_community.embeddings import HuggingFaceEmbeddings
# --- LLM and Chains ---
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain.output_parsers import PydanticOutputParser
from langchain_core.pydantic_v1 import BaseModel as LangchainBaseModel, Field
# --- OCR Imports ---
from pdf2image import convert_from_path # requires pdf2image
import pytesseract # requires pytesseract

# ---------------- CONFIG ----------------
load_dotenv()
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE_BYTES", 8 * 1024 * 1024))
TMP_DIR = "/tmp"  # Spaces-safe temporary directory
NLTK_DATA_DIR = os.path.join(TMP_DIR, "nltk_data")
os.makedirs(TMP_DIR, exist_ok=True)
os.makedirs(NLTK_DATA_DIR, exist_ok=True)

# NLTK setup (Ensure punkt and averaged_perceptron_tagger are downloaded)
nltk.data.path.append(NLTK_DATA_DIR)
try:
    # Attempt to download NLTK data if not present (quiet mode)
    nltk.download("punkt", download_dir=NLTK_DATA_DIR, quiet=True)
    nltk.download("averaged_perceptron_tagger", download_dir=NLTK_DATA_DIR, quiet=True)
except Exception as e:
    # Log warning if download fails (might work if already present)
    print(f"NLTK download warning: {e}")

# Logging Configuration
logger = logging.getLogger("uvicorn.error") # Use uvicorn's logger for consistency
logging.basicConfig(level=logging.INFO)

# -------------- FastAPI App Setup --------------
app = FastAPI(title="Nyay-Saarthi (Hindi Legal QA)")

# CORS Middleware Configuration (Allow all for development, restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Be more specific in production, e.g., ["https://yourfrontend.com"]
    allow_credentials=True,
    allow_methods=["*"], # Allows all standard methods
    allow_headers=["*"], # Allows all headers
)

# -------------- Globals --------------
vectorstore: Optional[Qdrant] = None # Global variable to hold the vector store
# Initialize embeddings (using a popular sentence transformer model)
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# --- Initialize text splitter (BEST POSSIBLE CHANGE APPLIED HERE) ---
# Using smaller chunks and more overlap to potentially isolate facts better
splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
logger.info(f"Initialized splitter with chunk_size={splitter._chunk_size} and chunk_overlap={splitter._chunk_overlap}")
# --- END SPLITTER CHANGE ---

# Stats for monitoring/debugging
INDEX_STATS = {"files": 0, "chunks": 0}

# -------------- Pydantic Models --------------
class Query(BaseModel):
    """Request model for asking questions."""
    question: str

# --- Clause Library and Pydantic Models for Clause Identification ---
CLAUSE_LIBRARY = {
    "Termination": {
        "en": "Specifies how and when the agreement can be ended by either party.",
        "hi": "निर्दिष्ट करता है कि समझौता किसी भी पक्ष द्वारा कैसे और कब समाप्त किया जा सकता है।"
    },
    "Liability": {
        "en": "Defines the responsibilities and extent of legal obligations if something goes wrong.",
        "hi": "कुछ गलत होने पर जिम्मेदारियों और कानूनी दायित्वों की सीमा को परिभाषित करता है।"
    },
    "Governing Law": {
        "en": "Specifies which jurisdiction's laws will be used to interpret the agreement.",
        "hi": "निर्दिष्ट करता है कि समझौते की व्याख्या के लिए किस क्षेत्राधिकार के कानूनों का उपयोग किया जाएगा।"
    },
    "Confidentiality": {
        "en": "Outlines obligations regarding the non-disclosure of sensitive information.",
        "hi": "संवेदनशील जानकारी का खुलासा न करने संबंधी दायित्वों की रूपरेखा बताता है।"
    },
    "Payment Terms": {
        "en": "Details the amount, timing, and method of payments.",
        "hi": "भुगतान की राशि, समय और तरीके का विवरण देता है।"
    },
    "Force Majeure": {
        "en": "Addresses unforeseeable circumstances that prevent someone from fulfilling a contract.",
        "hi": "अप्रत्याशित परिस्थितियों को संबोधित करता है जो किसी को अनुबंध पूरा करने से रोकती हैं।"
    },
    "Indemnification": {
        "en": "One party agrees to pay for potential losses or damages caused by another party.",
        "hi": "एक पक्ष दूसरे पक्ष के कारण होने वाले संभावित नुकसान या क्षति के लिए भुगतान करने पर सहमत होता है।"
    },
     "Dispute Resolution": {
        "en": "Specifies how disagreements related to the contract will be handled (e.g., arbitration, court).",
        "hi": "निर्दिष्ट करता है कि अनुबंध से संबंधित असहमतियों को कैसे संभाला जाएगा (जैसे, मध्यस्थता, अदालत)।"
    },
}

# Pydantic model for a single identified clause (using langchain's BaseModel)
class IdentifiedClauseInfo(LangchainBaseModel):
    clause_type: str = Field(description="The type of clause identified (e.g., Termination, Liability). Must be one of the predefined types.")
    extracted_text: str = Field(description="The exact sentence(s) or short paragraph representing the clause.")

# Pydantic model for the list of clauses expected from the LLM (using langchain's BaseModel)
class ClauseList(LangchainBaseModel):
    clauses: List[IdentifiedClauseInfo] = Field(description="A list of identified clauses found in the text.")

# Pydantic model for the final /upload response structure (using standard BaseModel)
class UploadResponse(BaseModel):
    message: str
    chunks_added: int
    identified_clauses: List[Dict[str, Any]] = [] # Holds final clause info + explanation

# Output parser for structured clause identification
clause_parser = PydanticOutputParser(pydantic_object=ClauseList)
# --- END Clause Library and Pydantic Models ---


# -------------- Utility Functions --------------
def safe_filename(name: Optional[str]) -> str:
    """Gets a safe filename from an optional full path."""
    return pathlib.Path(name or "upload").name

# Regex to find common non-printable characters
_NON_PRINTABLE_RE = re.compile(r"[\x00-\x08\x0B-\x0C\x0E-\x1F]")

def _looks_binary(s: str) -> bool:
    """Heuristic check for binary content."""
    if "\x00" in s: return True
    if "%PDF-" in s and "stream" in s and "endstream" in s: return True
    if len(_NON_PRINTABLE_RE.findall(s)) > max(5, len(s) // 50): return True
    return False

def _clean_text(s: str) -> str:
    """Removes non-printable characters and collapses excessive whitespace."""
    s = _NON_PRINTABLE_RE.sub(" ", s)
    return re.sub(r"\s+", " ", s).strip()

async def _extract_docs(tmp_path: str, source_name: str) -> List[Document]:
    """
    Robustly extracts text from a file using multiple strategies:
    1. UnstructuredLoader
    2. PyPDFLoader
    3. PDFMinerLoader
    4. OCR
    """
    docs: List[Document] = []
    error_log = []

    # 1) Try UnstructuredLoader
    try:
        loader = UnstructuredLoader(file_path=tmp_path, languages=["hin", "eng"])
        docs = await loader.aload()
        if docs: logger.info(f"Extracted content using UnstructuredLoader for {source_name}")
    except Exception as e:
        logger.warning(f"UnstructuredLoader failed for {source_name}: {e}")
        error_log.append(f"Unstructured: {e}")
        docs = []

    # 2) Fallback to PyPDFLoader
    if not docs:
        try:
            pdf_loader = PyPDFLoader(tmp_path)
            if hasattr(pdf_loader, 'aload'): docs = await pdf_loader.aload()
            else: docs = pdf_loader.load()
            if docs: logger.info(f"Extracted content using PyPDFLoader for {source_name}")
        except Exception as e:
            logger.warning(f"PyPDFLoader failed for {source_name}: {e}")
            error_log.append(f"PyPDF: {e}")
            docs = []

    # 3) Fallback to PDFMinerLoader
    if not docs:
        try:
            pdfm_loader = PDFMinerLoader(tmp_path)
            docs = pdfm_loader.load()
            if docs: logger.info(f"Extracted content using PDFMinerLoader for {source_name}")
        except Exception as e:
            logger.warning(f"PDFMinerLoader failed for {source_name}: {e}")
            error_log.append(f"PDFMiner: {e}")
            docs = []

    # 4) Fallback to OCR for PDFs
    is_pdf = False
    try:
        is_pdf = source_name.lower().endswith(".pdf")
        if not is_pdf:
             async with aiofiles.open(tmp_path, 'rb') as f:
                 header = await f.read(5)
                 if header == b'%PDF-': is_pdf = True
    except Exception as read_err:
        logger.warning(f"Could not read header to check if PDF: {read_err}")

    if not docs and is_pdf:
        logger.info(f"Attempting OCR for PDF: {source_name}...")
        try:
            images = convert_from_path(tmp_path)
            ocr_docs = []
            for i, img in enumerate(images):
                try:
                    text = pytesseract.image_to_string(img, lang="hin+eng")
                    text = _clean_text(text)
                    if text: ocr_docs.append(Document(page_content=text, metadata={"source": source_name, "page_number": i + 1}))
                except pytesseract.TesseractError as ocr_err:
                     logger.warning(f"Tesseract error on page {i+1} of {source_name}: {ocr_err}")
                     error_log.append(f"OCR Page {i+1}: {ocr_err}")
                     continue
            if ocr_docs:
                docs = ocr_docs
                logger.info(f"Extracted content using OCR for {source_name}")
        except Exception as e:
            logger.warning(f"PDF OCR processing failed entirely for {source_name}: {e}")
            error_log.append(f"OCR General: {e}")
            docs = []

    if not docs:
        logger.error(f"Failed to extract readable text from {source_name}. Errors: {error_log}")
        raise HTTPException(status_code=400, detail=f"No readable text extracted from {source_name}. Extraction attempts failed.")

    # Clean and filter
    cleaned: List[Document] = []
    total_len = 0
    for d in docs:
        txt = getattr(d, 'page_content', '') or ""
        if not txt or not isinstance(txt, str) or _looks_binary(txt): continue
        cleaned_content = _clean_text(txt)
        if cleaned_content:
             metadata = {"source": source_name}
             if hasattr(d, 'metadata') and d.metadata: metadata["page_number"] = d.metadata.get("page_number", 1)
             else: metadata["page_number"] = 1
             cleaned.append(Document(page_content=cleaned_content, metadata=metadata))
             total_len += len(cleaned_content)

    if not cleaned:
        logger.error(f"Content extracted from {source_name} was empty or binary after cleaning. Errors: {error_log}")
        raise HTTPException(status_code=400, detail=f"Extracted content from {source_name} was empty or unreadable after cleaning.")

    logger.info(f"Successfully cleaned {len(cleaned)} document pages/sections, total chars: {total_len} from {source_name}")
    return cleaned


# --- Clause Identification Function ---
async def identify_clauses_llm(documents: List[Document]) -> List[Dict[str, Any]]:
    """Identifies predefined clauses in the document text using an LLM."""
    if not documents:
        return []

    full_text = "\n\n".join([doc.page_content for doc in documents])
    MAX_TEXT_LENGTH = 100000 # Limit text sent to LLM for clause identification
    if len(full_text) > MAX_TEXT_LENGTH:
        logger.warning(f"Document text too long ({len(full_text)} chars), truncating for clause analysis.")
        full_text = full_text[:MAX_TEXT_LENGTH] + "\n[...TRUNCATED...]"

    if not full_text.strip():
        logger.info("No text content provided for clause identification.")
        return []

    target_clauses = list(CLAUSE_LIBRARY.keys())

    prompt_template = """
    Analyze the following legal document text. Identify and extract the exact sentences or short paragraphs corresponding to these specific clause types: {clause_list}.
    Do not identify any other clause types. If a clause type is not found, do not include it in the output.
    Return ONLY a JSON object formatted according to the following instructions, with no preamble or explanation:
    {format_instructions}
    Document Text:
    ---
    {document_text}
    ---
    """
    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["document_text", "clause_list"],
        partial_variables={"format_instructions": clause_parser.get_format_instructions()}
    )

    llm = ChatGoogleGenerativeAI(
            model="gemini-flash-latest",
            temperature=0.1, # Low temp for extraction
            google_api_key=os.getenv("GOOGLE_API_KEY"),
        )

    chain = prompt | llm | clause_parser

    identified_clauses_details = []
    try:
        logger.info(f"Invoking LLM for clause identification on text (length {len(full_text)})...")
        result: ClauseList = await chain.ainvoke({
            "document_text": full_text,
            "clause_list": ", ".join(target_clauses)
        })

        if result and result.clauses:
            logger.info(f"LLM identified {len(result.clauses)} potential clauses.")
            for clause_info in result.clauses:
                 page_num = 1
                 for doc in documents:
                     if clause_info.extracted_text[:50] in doc.page_content:
                          page_num = doc.metadata.get("page_number", 1)
                          break

                 explanation = CLAUSE_LIBRARY.get(clause_info.clause_type, {"hi": "स्पष्टीकरण उपलब्ध नहीं है।", "en": "Explanation not available."})

                 identified_clauses_details.append({
                     "type": clause_info.clause_type,
                     "text": clause_info.extracted_text,
                     "page": page_num,
                     "explanation_hi": explanation.get("hi"),
                     "explanation_en": explanation.get("en"),
                 })
        else:
             logger.info("LLM did not identify any of the target clauses.")

    except Exception as e:
        logger.exception("Error during clause identification LLM call.")
        return [] # Return empty on error, don't fail the upload

    return identified_clauses_details
# --- END Clause Identification Function ---


# -------------- API Routes --------------
@app.get("/health")
def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "tmp_dir": TMP_DIR,
        "tmp_writable": os.access(TMP_DIR, os.W_OK),
        "nltk_dir": NLTK_DATA_DIR,
        "index_stats": INDEX_STATS,
    }

@app.get("/stats")
def stats():
    """Returns basic indexing stats."""
    return INDEX_STATS

# --- MODIFIED /upload/ Endpoint ---
@app.post("/upload/", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Uploads, extracts, identifies clauses, splits, and indexes a document.
    Returns identified clauses along with success message.
    Resets the vector store for each new upload (single-document context).
    """
    global vectorstore, splitter # Ensure splitter is accessible
    original_filename = safe_filename(file.filename)
    tmp_path = os.path.join(TMP_DIR, f"{uuid.uuid4().hex}_{original_filename}")
    logger.info(f"Processing upload: {original_filename}")

    # --- Save file ---
    try:
        async with aiofiles.open(tmp_path, "wb") as out_file:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk: break
                await out_file.write(chunk)
        await file.close()
        logger.info(f"File saved temporarily to: {tmp_path}")
    except Exception as e:
        logger.exception(f"Failed to save uploaded file '{original_filename}'")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    extracted_docs = []
    chunks = []
    identified_clauses = []
    try:
        # --- Extract text ---
        extracted_docs = await _extract_docs(tmp_path, original_filename)

        # --- Identify Clauses ---
        if extracted_docs:
            logger.info("Starting clause identification...")
            identified_clauses = await identify_clauses_llm(extracted_docs)
            logger.info(f"Finished clause identification. Found {len(identified_clauses)} clauses.")
        else:
             logger.warning("No documents extracted, skipping clause identification.")

        # --- Split documents into chunks ---
        if extracted_docs:
            chunks = splitter.split_documents(extracted_docs)
            logger.info(f"Split '{original_filename}' into {len(chunks)} chunks using size={splitter._chunk_size}, overlap={splitter._chunk_overlap}.")
        else:
            chunks = []

    except HTTPException as http_exc:
         if os.path.exists(tmp_path): os.remove(tmp_path)
         raise http_exc
    except Exception as e:
        logger.exception(f"Failed to extract, identify clauses, or split document '{original_filename}'")
        raise HTTPException(status_code=500, detail=f"Failed to process document: {e}")
    finally:
        # --- Clean up temporary file ---
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                logger.info(f"Removed temporary file: {tmp_path}")
        except Exception as e:
            logger.warning(f"Could not remove temp file {tmp_path}: {e}")

    if not chunks:
         logger.warning(f"No chunks generated for {original_filename} after processing.")
         return UploadResponse(
             message=f"File processed. No indexable content found, but clauses identified.",
             chunks_added=0,
             identified_clauses=identified_clauses
            )

    # --- Index chunks ---
    try:
        # --- QDRANT RESET LOGIC ---
        # Clear existing store to ensure context is only from the latest upload
        logger.warning("Clearing existing in-memory vector store before indexing new document.")
        vectorstore = None # Reset the global variable
        INDEX_STATS["files"] = 0 # Reset stats
        INDEX_STATS["chunks"] = 0
        # --- END RESET LOGIC ---

        logger.info("Initializing in-memory Qdrant vector store with new document...")
        vectorstore = Qdrant.from_documents(chunks, embeddings, location=":memory:", collection_name="legal_docs")

        INDEX_STATS["files"] = 1 # Set to 1 for the new document
        INDEX_STATS["chunks"] = len(chunks)
        logger.info(f"Successfully indexed {len(chunks)} chunks. Total chunks: {INDEX_STATS['chunks']}")

    except Exception as e:
        logger.exception("Failed to index chunks into Qdrant")
        raise HTTPException(status_code=500, detail=f"Failed to index document chunks: {e}")

    # --- Return success response including clauses ---
    return UploadResponse(
        message="File uploaded, processed, and indexed successfully",
        chunks_added=len(chunks),
        identified_clauses=identified_clauses
    )
# --- END MODIFIED /upload/ Endpoint ---

@app.post("/ask/")
async def ask_question(query: Query):
    """
    Performs Retrieval-Augmented Generation (RAG) QA in Hindi
    using the indexed documents and a Google Generative AI model.
    Applies accuracy improvements (retriever k=6, refined prompt).
    """
    global vectorstore
    if vectorstore is None:
        logger.warning("Attempted /ask before uploading documents.")
        raise HTTPException(status_code=400, detail="Please upload and process a document first via the /upload endpoint.")

    # Define the refined prompt template for Hindi QA
    prompt_template = """
    दिए गए संदर्भ का उपयोग करके निम्नलिखित प्रश्न का उत्तर सरल हिंदी में दें।
    यदि उत्तर ज्ञात न हो, तो स्पष्ट रूप से कहें कि पर्याप्त जानकारी उपलब्ध नहीं है, उत्तर बनाने का प्रयास न करें।
    उत्तर बिंदुवार (bullet points) और संक्षेप में दें।
    **यदि प्रश्न किसी सूची या विशिष्ट संख्या में आइटम के लिए पूछता है (उदाहरण के लिए, "दो कारण बताएं"), तो सुनिश्चित करें कि आप उन सभी आइटम को निकालने और सूचीबद्ध करने का प्रयास करें जो संदर्भ में दिए गए हैं।**

    संदर्भ:
    {context}

    प्रश्न:
    {question}

    उत्तर (सरल हिंदी में):
    """

    PROMPT = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    chain_kwargs = {"prompt": PROMPT}

    # Initialize the QA chain
    try:
        # --- ACCURACY IMPROVEMENT: Increased retriever results ---
        retriever = vectorstore.as_retriever(search_kwargs={"k": 10}) # Fetch top 6 chunks
        # --- END ACCURACY IMPROVEMENT ---

        qa_chain = RetrievalQA.from_chain_type(
            llm=ChatGoogleGenerativeAI(
                model="gemini-flash-latest",
                temperature=0.2, # Keep temperature low for factuality
                google_api_key=os.getenv("GOOGLE_API_KEY"),
            ),
            chain_type="stuff", # Assumes combined chunks fit context window
            retriever=retriever, # Use the modified retriever
            return_source_documents=True,
            chain_type_kwargs=chain_kwargs,
        )
    except Exception as e:
         logger.exception("Failed to initialize QA chain")
         raise HTTPException(status_code=500, detail=f"Could not initialize QA system: {e}")

    # Invoke the QA chain
    try:
        logger.info(f"Invoking QA chain with question: {query.question}")
        result: Dict[str, Any] = await qa_chain.ainvoke({"query": query.question})
    except Exception as e:
        logger.exception("Error during QA chain invocation")
        raise HTTPException(status_code=500, detail=f"Error processing question: {e}")

    # Process source documents
    sources = []
    if "source_documents" in result:
        for doc in result["source_documents"]:
            content = _clean_text(getattr(doc, "page_content", "") or "")
            if content:
                page = 1
                if hasattr(doc, 'metadata') and doc.metadata:
                    page = doc.metadata.get("page_number", 1)
                sources.append({"content": content, "page": page})

    final_answer = result.get("result", "क्षमा करें, मुझे उत्तर नहीं मिल सका।")
    logger.info(f"QA chain result: Answer length={len(final_answer)}, Sources found={len(sources)}")

    return {"answer": final_answer, "sources": sources}


# --- COMPARE ENDPOINT ---
@app.post("/compare/")
async def compare_documents(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    """Compares the text content of two uploaded documents using robust extraction."""
    original1 = safe_filename(file1.filename)
    tmp_path1 = os.path.join(TMP_DIR, f"{uuid.uuid4().hex}_cmp1_{original1}")
    original2 = safe_filename(file2.filename)
    tmp_path2 = os.path.join(TMP_DIR, f"{uuid.uuid4().hex}_cmp2_{original2}")
    text1, text2 = "", ""
    diff_lines = []
    try:
        # Save files
        logger.info(f"Saving file1 ('{original1}') to {tmp_path1}")
        async with aiofiles.open(tmp_path1, "wb") as out:
            while True:
                chunk = await file1.read(CHUNK_SIZE)
                if not chunk: break
                await out.write(chunk)
        await file1.close()
        logger.info(f"Saving file2 ('{original2}') to {tmp_path2}")
        async with aiofiles.open(tmp_path2, "wb") as out:
            while True:
                chunk = await file2.read(CHUNK_SIZE)
                if not chunk: break
                await out.write(chunk)
        await file2.close()

        # Extract text
        logger.info(f"Extracting text from {original1}...")
        docs1 = await _extract_docs(tmp_path1, original1)
        logger.info(f"Extracting text from {original2}...")
        docs2 = await _extract_docs(tmp_path2, original2)

        text1 = "\n".join([doc.page_content for doc in docs1])
        text2 = "\n".join([doc.page_content for doc in docs2])
        logger.info(f"Text lengths - File1: {len(text1)}, File2: {len(text2)}")

        # Perform comparison
        logger.info("Performing comparison using difflib...")
        diff_lines = list(difflib.unified_diff(
            text1.splitlines(keepends=True),
            text2.splitlines(keepends=True),
            fromfile=original1,
            tofile=original2,
            n=3
        ))
        logger.info(f"Comparison complete. Found {len(diff_lines)} difference lines.")

    except HTTPException as http_exc:
        logger.error(f"HTTPException during extraction: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        logger.exception("Error during file saving, text extraction, or comparison in /compare")
        raise HTTPException(status_code=500, detail=f"Server error during comparison processing: {type(e).__name__}")
    finally:
        # Clean up temporary files
        for p in [tmp_path1, tmp_path2]:
             try:
                 if p and os.path.exists(p):
                      os.remove(p)
                      logger.info(f"Removed temporary comparison file: {p}")
             except Exception as e:
                 logger.warning(f"Could not remove temp file {p}: {e}")

    return {"comparison_lines": diff_lines}


# --- Dummy /verify Endpoint ---
@app.get("/verify/")
def verify_document():
    """Dummy endpoint for verification report."""
    return {
        "report": {
            "missing_signatures": ["Signature not found for Jane Doe"],
            "inconsistent_dates": ["The end date is before the start date."],
            "clause_mismatches": ["Liability clause weaker than standard template."],
        }
    }

# --- Main execution block ---
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
