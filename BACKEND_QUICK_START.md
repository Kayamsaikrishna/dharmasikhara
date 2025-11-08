# Backend Quick Start Guide

## Prerequisites
- Node.js installed
- Docker installed (for MongoDB)

## Quick Setup

1. **Start MongoDB** (required for user authentication):
   ```
   # Run the MongoDB startup script
   start-mongodb.bat
   ```

2. **Install backend dependencies**:
   ```
   cd backend
   npm install
   ```

3. **Create a test user** (optional but recommended):
   ```
   npm run create-test-user
   ```
   This creates a test user with:
   - Email: demo@example.com
   - Password: demo123

4. **Start the backend server**:
   ```
   npm start
   ```

## Without MongoDB (Limited Functionality)

If you don't want to use MongoDB, the backend will still start but with limited functionality:
- User registration will be disabled
- User login will work with the demo account only:
  - Email: demo@example.com
  - Password: demo123

## Troubleshooting

1. **MongoDB connection errors**:
   - Make sure Docker is running
   - Run `stop-mongodb.bat` and then `start-mongodb.bat` again
   - Check that port 27017 is not being used by another service

2. **Port conflicts**:
   - The backend runs on port 5000 by default
   - Change the PORT in `.env` file if needed

3. **Check database connection**:
   ```
   node check-db-connection.js
   ```