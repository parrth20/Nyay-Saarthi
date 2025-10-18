# main.py
import os
import uuid
import pathlib
import logging
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import nltk
import aiofiles
import tempfile
import shutil

# LangChain & other dependencies
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import UnstructuredFileLoader
from langchain_community.vectorstores import Qdrant
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# -------- CONFIG --------
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE_BYTES", 8 * 1024 * 1024))  # 8 MB default
# Use APP_TMP env if set, otherwise prefer /app/tmp (created in Dockerfile), fallback to /tmp
TMP_DIR = os.getenv("APP_TMP", "/app/tmp" if os.path.isdir("/app") else "/tmp")
NLTK_DATA_DIR = os.getenv("NLTK_DATA", os.path.join(os.getcwd(), "nltk_data"))
# ------------------------

# Setup logging
logger = logging.getLogger("uvicorn.error")
logging.basicConfig(level=logging.INFO)

# Ensure tmp & nltk dirs exist and are writable
os.makedirs(TMP_DIR, exist_ok=True)
os.makedirs(NLTK_DATA_DIR, exist_ok=True)

# Configure NLTK so it writes to a writable directory (avoid /nltk_data permission errors)
nltk.data.path.append(NLTK_DATA_DIR)
try:
    nltk.download("punkt", download_dir=NLTK_DATA_DIR, quiet=True)
    nltk.download("averaged_perceptron_tagger", download_dir=NLTK_DATA_DIR, quiet=True)
except Exception as e:
    # non-fatal: log but continue (Unstructured may still work without these)
    logger.warning("NLTK download warning (this may be okay if data already present): %s", e)

# Load env
load_dotenv()

app = FastAPI()

# CORS (you can restrict origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vectorstore = None  # global in-memory vectorstore

class Query(BaseModel):
    question: str


@app.get("/health")
def health_check():
    return {
        "cwd": os.getcwd(),
        "tmp_dir": TMP_DIR,
        "tmp_writable": os.access(TMP_DIR, os.W_OK),
        "nltk_data_dir": NLTK_DATA_DIR,
        "nltk_data_exists": os.path.isdir(NLTK_DATA_DIR) and len(os.listdir(NLTK_DATA_DIR)) > 0,
        "chunk_size_bytes": CHUNK_SIZE,
    }


def safe_filename(filename: Optional[str]) -> str:
    """Return base filename (avoid path traversal)."""
    if not filename:
        return "upload"
    return pathlib.Path(filename).name


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """
    Safely save uploaded file to a writable tmp dir and process it into Qdrant in-memory vectorstore.
    """
    global vectorstore

    # Sanitize and build unique temp filename
    original_name = safe_filename(file.filename)
    unique_suffix = uuid.uuid4().hex
    tmp_filename = f"upload_{unique_suffix}_{original_name}"
    tmp_path = os.path.join(TMP_DIR, tmp_filename)

    logger.info("Attempting to save uploaded file to %s", tmp_path)

    # Ensure TMP_DIR is writable
    if not os.access(TMP_DIR, os.W_OK):
        raise HTTPException(status_code=500, detail=f"Temporary directory not writable: {TMP_DIR}")

    # Write file in chunks (async) to avoid memory blowups
    try:
        async with aiofiles.open(tmp_path, "wb") as out_file:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                await out_file.write(chunk)
        # Close the incoming file to free resources
        await file.close()
    except PermissionError as e:
        logger.exception("Permission error while saving upload")
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                logger.debug("Failed to cleanup %s", tmp_path)
        raise HTTPException(status_code=500, detail=f"Permission denied when saving file: {e}")
    except Exception as e:
        logger.exception("Failed to save uploaded file")
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                logger.debug("Failed to cleanup %s", tmp_path)
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    # Now process the saved file
    try:
        # UnstructuredFileLoader expects a path on disk
        loader = UnstructuredFileLoader(tmp_path, languages=["hin", "eng"])
        documents = loader.load()

        # Basic safety: if no text extracted, return error
        if not documents:
            logger.warning("No documents extracted from %s", tmp_path)
            # cleanup
            os.remove(tmp_path)
            raise HTTPException(status_code=400, detail="No text could be extracted from the file.")

        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        texts = text_splitter.split_documents(documents)

        # Create embeddings
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

        # Store in Qdrant in-memory
        vectorstore = Qdrant.from_documents(
            texts,
            embeddings,
            location=":memory:",
            collection_name="legal_docs",
        )

    except Exception as e:
        logger.exception("Error processing file %s", tmp_path)
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                logger.debug("Failed to cleanup %s", tmp_path)
        raise HTTPException(status_code=500, detail=f"Failed to process file: {e}")

    # Remove temporary file now that it's processed
    try:
        os.remove(tmp_path)
    except Exception:
        logger.debug("Non-fatal: failed to delete tmp file %s", tmp_path)

    return {"message": "File uploaded and processed successfully"}


@app.post("/ask/")
async def ask_question(query: Query):
    """
    Ask questions to the uploaded document using Gemini model (Hindi-friendly).
    Requires GOOGLE_API_KEY env if you use ChatGoogleGenerativeAI.
    """
    global vectorstore
    if not vectorstore:
        raise HTTPException(status_code=400, detail="Please upload and process a document first.")

    prompt_template = """
    दिए गए संदर्भ का उपयोग करके निम्नलिखित प्रश्न का उत्तर सरल हिंदी में दें।
    यदि आप उत्तर नहीं जानते हैं, तो बस कहें कि आप नहीं जानते, उत्तर बनाने की कोशिश न करें।

    संदर्भ: {context}

    प्रश्न: {question}
    
    उत्तर:
    """

    PROMPT = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
    )

    chain_type_kwargs = {"prompt": PROMPT}

    qa = RetrievalQA.from_chain_type(
        llm=ChatGoogleGenerativeAI(
            model="gemini-flash-latest",
            temperature=0,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        ),
        chain_type="stuff",
        retriever=vectorstore.as_retriever(),
        return_source_documents=True,
        chain_type_kwargs=chain_type_kwargs
    )

    # Note: RetrievalQA.from_chain_type returns a chain with .run or .invoke depending on version.
    # We call .invoke(...) like in your original code; if your LangChain version expects .run,
    # change to result = qa.run(query.question)
    try:
        result = qa.invoke({"query": query.question})
    except AttributeError:
        # fallback if invoke is not available
        result = {"result": qa.run(query.question), "source_documents": []}

    # Format sources
    sources = []
    for doc in result.get("source_documents", []):
        sources.append({
            "content": getattr(doc, "page_content", None),
            "page": doc.metadata.get("page_number", 1) if getattr(doc, "metadata", None) else 1
        })

    return {
        "answer": result.get("result"),
        "sources": sources,
    }


@app.get("/verify/")
def verify_document():
    """
    Dummy verification route for placeholder report
    """
    return {
        "report": {
            "missing_signatures": ["Signature not found for Jane Doe"],
            "inconsistent_dates": ["The end date is before the start date."],
            "clause_mismatches": ["Liability clause weaker than standard template."],
        }
    }


if __name__ == "__main__":
    # Run locally with: python main.py
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
