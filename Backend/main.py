import os
import shutil
import io  # <-- Add this import
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import UnstructuredFileLoader
from langchain_community.vectorstores import Qdrant
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

app = FastAPI()

# Your origins list. It's a good practice to add trailing slashes.
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://nyay-saarthi-sable.vercel.app",
    "https://nyay-saarthi-sable.vercel.app/", # Add this line
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vectorstore = None

class Query(BaseModel):
    question: str

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    global vectorstore
    
    # --- MODIFICATION START: Process file in memory ---
    # Instead of saving to disk, read the file content into a bytes buffer.
    file_content = await file.read()
    file_buffer = io.BytesIO(file_content)
    file_buffer.name = file.filename  # Unstructured needs a file name
    
    # Load the document directly from the in-memory buffer
    # NOTE: The loader might need just the buffer. If this fails, try loader(file=file_buffer)
    loader = UnstructuredFileLoader(file_path=file_buffer.name, file=file_buffer, languages=["hin", "eng"])
    # --- MODIFICATION END ---
    
    documents = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    texts = text_splitter.split_documents(documents)
    
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    vectorstore = Qdrant.from_documents(
        texts,
        embeddings,
        location=":memory:",
        collection_name="legal_docs",
    )
    
    return {"message": "File uploaded and processed successfully"}

@app.post("/ask/")
async def ask_question(query: Query):
    global vectorstore
    if not vectorstore:
        return {"error": "Please upload a document first"}
            
    prompt_template = """
    दिए गए संदर्भ का उपयोग करके निम्नलिखित प्रश्न का उत्तर सरल हिंदी में दें।
    यदि आप उत्तर नहीं जानते हैं, तो बस कहें कि आप नहीं जानते, उत्तर बनाने की कोशिश न करें।

    संदर्भ: {context}

    प्रश्न: {question}
    
    उत्तर:
    """
    
    PROMPT = PromptTemplate(
        template=prompt_template, input_variables=["context", "question"]
    )
    
    chain_type_kwargs = {"prompt": PROMPT}
    
    qa = RetrievalQA.from_chain_type(
        llm=ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0),
        chain_type="stuff",
        retriever=vectorstore.as_retriever(),
        return_source_documents=True,
        chain_type_kwargs=chain_type_kwargs
    )
    
    result = qa.invoke({"query": query.question})
    
    return {
        "answer": result["result"],
        "sources": [
            {"content": doc.page_content, "page": doc.metadata.get("page_number", 1)}
            for doc in result["source_documents"]
        ],
    }

@app.get("/verify/")
async def verify_document():
    # This is a placeholder for the verification feature
    return {
        "report": {
            "missing_signatures": ["Placeholder: Signature not found for Jane Doe"],
            "inconsistent_dates": ["Placeholder: The end date is before the start date."],
            "clause_mismatches": ["Placeholder: The liability clause seems weaker than the standard template."],
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
