# syntax=docker/dockerfile:1
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# ---- System deps (for unstructured, OCR, pdf, magic, etc.) ----
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-hin \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    libmagic1 \
    git \
    && rm -rf /var/lib/apt/lists/*

# ---- Python deps ----
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# ---- App code ----
COPY . /app/

# ---- Writable dirs (fixes prior permission errors) ----
# World-writable sticky temp dir, suitable for HF Spaces runtime
RUN mkdir -p /app/tmp && chmod 1777 /app/tmp

# ---- NLTK data baked in image (fixes punkt_tab error) ----
ENV NLTK_DATA=/app/nltk_data
RUN mkdir -p /app/nltk_data && \
    python -m nltk.downloader -d /app/nltk_data punkt punkt_tab averaged_perceptron_tagger

# ---- Expose & run ----
EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
