# Use Python 3.9 as the base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install Python dependencies
RUN pip install torch transformers numpy

# Copy the rest of the application code
COPY . .

# Create directory for Hugging Face cache
RUN mkdir -p /root/.cache/huggingface

# Expose the port the app runs on
EXPOSE 5000

# Create a non-root user
RUN useradd -m -u 1001 nodeuser
USER nodeuser

# Command to run the application
CMD ["npm", "start"]