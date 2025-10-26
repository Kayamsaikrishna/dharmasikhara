# DharmaSikhara AI Integration

This repository contains the complete integration of the AI backend functionality with the existing frontend for the DharmaSikhara legal practice simulator.

## System Architecture

The system consists of three main components:

1. **Frontend**: React application (port 3000)
2. **AI Backend**: Node.js service (port 5000)
3. **Python AI Model**: InCaseLawBERT model integration

## Directory Structure

```
law/
├── backend/              # AI backend service
│   ├── ai_controller.js  # Node.js AI controller
│   ├── legal_ai.py       # Python AI model interface
│   ├── server.js         # Node.js server
│   ├── package.json      # Backend dependencies
│   ├── Dockerfile        # Backend Docker configuration
│   └── README.md         # Backend documentation
├── frontend/             # Main frontend application
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   └── ...
│   ├── package.json      # Frontend dependencies
│   ├── Dockerfile        # Frontend Docker configuration
│   └── ...
├── dharmasikhara-website/ # Original website (unchanged)
└── docker-compose.yml     # Multi-container orchestration
```

## Prerequisites

- Node.js (version 14 or higher)
- Python (version 3.7 or higher)
- Docker (optional, for containerized deployment)

## Installation

### Method 1: Manual Installation

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Install Python dependencies:
   ```bash
   pip install torch transformers numpy
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Method 2: Docker Installation

1. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

## Running the Application

### Manual Execution

1. Start the AI backend service:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend application:
   ```bash
   cd ../frontend
   npm start
   ```

### Docker Execution

1. Start all services with Docker Compose:
   ```bash
   docker-compose up
   ```

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Features

### Legal Document Analysis

1. Navigate to the "Legal Analysis" page via the main navigation
2. Paste a legal document in the text area
3. Click "Analyze Document"
4. View the AI analysis results including:
   - Document overview (length, token count, type)
   - Key legal terms identified
   - Document summary

### Integration Points

- **Frontend Navigation**: Legal Analysis link added to main navigation
- **API Endpoints**: RESTful endpoints for AI services
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive Design**: Mobile-friendly interface

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/ai-status` - Check AI model status
- `POST /api/analyze-document` - Analyze a legal document

## Configuration

### Environment Variables

The backend service can be configured using environment variables:

- `PORT`: Backend port (default: 5000)
- `PYTHON_PATH`: Path to Python executable (default: python)

### Model Configuration

The AI model expects the InCaseLawBERT model to be located at:
`C:\Users\ASUS\.cache\huggingface\hub\models--law-ai--InCaseLawBERT`

## Troubleshooting

### Common Issues

1. **Backend not responding**:
   - Check that the backend service is running
   - Verify the port is not blocked by firewall
   - Restart the backend service

2. **Frontend not connecting to backend**:
   - Check browser console for CORS errors
   - Verify both services are running on correct ports
   - Check network tab for failed API requests

3. **Python dependencies missing**:
   - Install required Python packages:
     ```bash
     pip install torch transformers numpy
     ```

4. **Model not found**:
   - Verify the model path exists
   - Download the InCaseLawBERT model if needed

### Logs

Check the terminal output for both services to diagnose issues:
- Backend logs: Terminal where `npm start` was run in the backend directory
- Frontend logs: Terminal where `npm start` was run in the frontend directory

## Development

### Backend Development

1. Install development dependencies:
   ```bash
   cd backend
   npm install --save-dev nodemon
   ```

2. Run in development mode with auto-restart:
   ```bash
   npm run dev
   ```

### Frontend Development

1. Install development dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Run in development mode with hot reload:
   ```bash
   npm start
   ```

## Deployment

### Netlify Deployment (Frontend)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `build` directory to Netlify

### Docker Deployment

1. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

2. Access the application at http://localhost:3000

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For support, please contact the DharmaSikhara development team.