FROM python:3.11-slim

WORKDIR /app

# Install dependencies and curl for downloading Ookla CLI
RUN apt-get update && apt-get install -y curl tar ca-certificates && rm -rf /var/lib/apt/lists/*

# Download Official Ookla Speedtest CLI (Linux x86_64)
RUN curl -sL https://install.speedtest.net/app/cli/ookla-speedtest-1.2.0-linux-x86_64.tgz | tar -xz -C /usr/local/bin speedtest && \
    chmod +x /usr/local/bin/speedtest && \
    speedtest --accept-license --accept-gdpr || true

# Copy python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY backend /app/backend
COPY frontend /app/frontend

WORKDIR /app/backend

# Create a dummy results.db if it doesn't exist so permissions are correct for volume mounting
RUN touch results.db

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
