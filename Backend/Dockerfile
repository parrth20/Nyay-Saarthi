# Dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system deps required by unstructured, poppler, tesseract, libmagic
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    tesseract-ocr-hin \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libmagic1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY ./requirements.txt /app/requirements.txt

# Install Python packages
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy code
COPY . /app/

# Make an app tmp dir and ensure it's writable at runtime (sticky bit)
RUN mkdir -p /app/tmp && chmod 1777 /app/tmp

# Set NLTK data location inside image and pre-download common packages
ENV NLTK_DATA=/app/nltk_data
RUN mkdir -p /app/nltk_data && python -m nltk.downloader punkt averaged_perceptron_tagger -d /app/nltk_data

# Expose HF default port; HF spaces maps 7860 typically
EXPOSE 7860

# Use uvicorn entrypoint; main:app must match your main.py
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
