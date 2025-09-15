from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import UnstructuredFileLoader
from langchain_community.vectorstores import Qdrant
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
# --- NEW: Import PromptTemplate ---
from langchain.prompts import PromptTemplate
import shutil

load_dotenv()

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)

    loader = UnstructuredFileLoader(file_location, languages=["hin", "eng"])
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
    
    os.remove(file_location)
    
    return {"message": "File uploaded and processed successfully"}

@app.post("/ask/")
async def ask_question(query: Query):
    global vectorstore
    if not vectorstore:
        return {"error": "Please upload a document first"}
            
    # --- MODIFICATION START: Create a custom prompt for Hindi ---
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
    # --- MODIFICATION END ---
    
    qa = RetrievalQA.from_chain_type(
        llm=ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0),
        chain_type="stuff",
        retriever=vectorstore.as_retriever(),
        return_source_documents=True,
        # --- MODIFICATION START: Add the custom prompt to the chain ---
        chain_type_kwargs=chain_type_kwargs
        # --- MODIFICATION END ---
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
