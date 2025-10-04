# Nyay-Saarthi

Nyay-Saarthi is an AI-powered legal assistant designed to simplify complex legal documents for users in both *Hindi* and *English*.  
This application allows users to upload legal documents and receive simplified summaries, ask questions about the content, and even book consultations with legal experts.

---

## 🚀 Key Features

- *Document Upload and Simplification*: Securely upload legal documents (PDF, DOCX, TXT, PNG, JPG, JPEG) and receive a simplified summary in plain language.  
- *AI-Powered Q&A*: Ask questions about your uploaded documents and get instant, context-aware answers from our AI assistant.  
- *Consultation Booking*: Schedule consultations with legal experts through the platform.  
- *User Authentication*: Secure user registration and login functionality.  
- *Dashboard*: An overview of your documents and analysis.  
- *Bilingual Support: The entire user interface and AI responses are available in both **Hindi* and *English*.  
- *Responsive Design*: A mobile-friendly interface ensures a seamless experience across all devices.  

---

## 🛠 Tech Stack

### Frontend
- *Framework*: Next.js  
- *Language*: TypeScript  
- *Styling*: Tailwind CSS with shadcn/ui components  
- *Authentication*: Supabase  

### Backend
- *Framework*: FastAPI  
- *Language*: Python  
- *AI/ML*: LangChain, Google Generative AI, Hugging Face Embeddings  
- *Vector Store*: Qdrant  
- *Deployment*: Docker  

---

## ⚙ Getting Started

### Prerequisites
- Node.js and npm (or yarn/pnpm)  
- Python 3.11  
- Docker  

---

### 🔧 Installation

1. Clone the repository:
   bash
   git clone https://github.com/parrth20/nyay-saarthi.git
   cd nyay-saarthi
   

2. *Frontend Setup*:
   bash
   # Navigate to the frontend directory (assuming it's the root of this project)
   npm install
   

3. *Backend Setup*:
   bash
   cd Backend
   pip install -r requirements.txt
   

4. *Environment Variables*:  
   Create a .env file in the root of the frontend and backend directories.  
   Add the necessary environment variables (e.g., Supabase URL and keys, Google Generative AI API key).  

---

### ▶ Running the Application

*Start the Frontend*:
bash
npm run dev


*Start the Backend*:
bash
cd Backend
uvicorn main:app --host 0.0.0.0 --port 8000


*Alternatively, run the backend using Docker*:
bash
cd Backend
docker build -t nyay-saarthi-backend .
docker run -p 8000:8000 nyay-saarthi-backend


---

## 🤝 Contributing

Contributions are welcome!  
Please feel free to open an issue or submit a pull request.

---
