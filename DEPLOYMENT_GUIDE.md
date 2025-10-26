# DharmaSikhara Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Docker Deployment](#docker-deployment)
4. [Manual Deployment](#manual-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Hugging Face Model Setup](#hugging-face-model-setup)
8. [Verification](#verification)

## Prerequisites

Before deploying DharmaSikhara, ensure you have:

1. **Docker** (v20.10 or higher) and **Docker Compose** installed
2. At least **8GB RAM** and **20GB free disk space**
3. **Node.js** (v14 or higher) and **npm** for manual deployment
4. **Python** (v3.9 or higher) with **pip**
5. Access to the **InCaseLawBERT** Hugging Face model

## Deployment Options

DharmaSikhara can be deployed in two ways:

1. **Docker Deployment** (Recommended) - Uses Docker Compose for easy setup
2. **Manual Deployment** - Requires manual installation of dependencies

## Docker Deployment

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dharmasikhara
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
POSTGRES_DB=dharmasikhara
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# MongoDB Configuration
MONGODB_URI=mongodb://mongodb:27017/dharmasikhara

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Elasticsearch Configuration
ELASTICSEARCH_NODE=http://elasticsearch:9200

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Application Configuration
NODE_ENV=production
PORT=5000
```

### 3. Start the Application

```bash
docker-compose up -d
```

This will start all services:
- Frontend (port 3000)
- Backend (port 5000)
- PostgreSQL database
- MongoDB database
- Redis cache
- Elasticsearch

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 5. Stopping the Application

```bash
docker-compose down
```

To stop and remove all data volumes:

```bash
docker-compose down -v
```

## Manual Deployment

### 1. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
pip install torch transformers numpy
```

#### Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
POSTGRES_DB=dharmasikhara
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/dharmasikhara

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Elasticsearch Configuration
ELASTICSEARCH_NODE=http://localhost:9200

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Application Configuration
NODE_ENV=production
PORT=5000
```

#### Start Backend Services

First, start the required databases and services:

```bash
# Start PostgreSQL, MongoDB, Redis, and Elasticsearch using your preferred method
# For example, using Docker:
docker run -d --name postgres -e POSTGRES_DB=dharmasikhara -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=your_secure_password -p 5432:5432 postgres:13
docker run -d --name mongodb -p 27017:27017 mongo:5
docker run -d --name redis -p 6379:6379 redis:7
docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" -e "ES_JAVA_OPTS=-Xms1g -Xmx1g" docker.elastic.co/elasticsearch/elasticsearch:7.17.0
```

Then start the backend:

```bash
npm start
```

### 2. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Build the Application

```bash
npm run build
```

#### Serve the Application

```bash
npx serve -s build -l 3000
```

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port for the backend server | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `POSTGRES_HOST` | PostgreSQL host | localhost |
| `POSTGRES_PORT` | PostgreSQL port | 5432 |
| `POSTGRES_DB` | PostgreSQL database name | dharmasikhara |
| `POSTGRES_USER` | PostgreSQL username | postgres |
| `POSTGRES_PASSWORD` | PostgreSQL password | postgres |
| `MONGODB_URI` | MongoDB connection URI | mongodb://localhost:27017/dharmasikhara |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `ELASTICSEARCH_NODE` | Elasticsearch node | http://localhost:9200 |
| `JWT_SECRET` | Secret for JWT token signing | dharmasikhara_secret |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | URL for the backend API | http://localhost:5000 |

## Database Setup

### PostgreSQL

The application uses PostgreSQL for relational data storage including:
- User accounts
- Authentication tokens
- Scenario metadata
- User progress tracking
- Transactions and subscriptions

### MongoDB

MongoDB is used for:
- User sessions
- Scenario content
- Multiplayer session data
- Analytics data

### Redis

Redis is used for:
- Caching frequently accessed data
- Session storage
- Real-time multiplayer communication

### Elasticsearch

Elasticsearch is used for:
- Content search
- Scenario indexing
- User analytics aggregation

## Hugging Face Model Setup

### Downloading the Model

The application uses the InCaseLawBERT model for legal document analysis. To set it up:

1. Download the model from Hugging Face:
   ```bash
   # This is handled automatically by the Python script
   ```

2. The model will be cached in:
   ```
   ~/.cache/huggingface/hub/models--law-ai--InCaseLawBERT
   ```

### Model Caching in Docker

When using Docker deployment, the model cache is mounted as a volume:

```yaml
volumes:
  - /C/Users/ASUS/.cache/huggingface:/root/.cache/huggingface
```

Make sure this path exists on your host machine and contains the downloaded model.

## Verification

### Check Services

After deployment, verify that all services are running:

1. **Backend Health Check**:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Frontend Access**:
   Open http://localhost:3000 in your browser

3. **Database Connections**:
   Check the backend logs for successful database connections

### Test API Endpoints

1. **Authentication**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
   ```

2. **AI Service**:
   ```bash
   curl http://localhost:5000/api/ai/status
   ```

3. **Scenario Access**:
   ```bash
   curl http://localhost:5000/api/scenarios
   ```

### Common Issues

1. **Model Not Found**: Ensure the Hugging Face model is downloaded and accessible
2. **Database Connection Failed**: Check database credentials and network connectivity
3. **Port Conflicts**: Ensure ports 3000 and 5000 are available
4. **Insufficient Resources**: Ensure at least 8GB RAM is available

## Maintenance

### Backup

Regular backups should be performed for:

1. **PostgreSQL Database**:
   ```bash
   pg_dump -h localhost -U postgres dharmasikhara > backup.sql
   ```

2. **MongoDB Database**:
   ```bash
   mongodump --db dharmasikhara --out /backup/mongodb
   ```

### Updates

To update the application:

1. Pull the latest code:
   ```bash
   git pull origin main
   ```

2. Update dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Restart services:
   ```bash
   docker-compose down && docker-compose up -d
   ```

### Monitoring

Monitor the application using:

1. **Docker Logs**:
   ```bash
   docker-compose logs -f
   ```

2. **Application Metrics**:
   Access `/api/analytics/system` for system metrics

3. **Health Checks**:
   Regularly check `/api/health` endpoint