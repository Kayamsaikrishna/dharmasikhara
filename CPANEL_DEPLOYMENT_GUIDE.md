# cPanel Deployment Guide for DharmaSikhara Legal AI Application

This guide will help you deploy the DharmaSikhara Legal AI application on cPanel using Node.js.

## Prerequisites

1. cPanel account with Node.js application support
2. Domain: law.infernomach.in
3. Files uploaded to: /home/infernom/Law_Students

## Deployment Steps

### 1. Build the Frontend Application

First, you need to build the React frontend application:

```bash
cd /home/infernom/Law_Students
npm run build --prefix frontend
```

### 2. Copy Frontend Build to Backend

Copy the built frontend files to the backend public directory:

```bash
cp -r /home/infernom/Law_Students/frontend/build/* /home/infernom/Law_Students/backend/public/
```

### 3. Install Backend Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd /home/infernom/Law_Students/backend
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the backend directory with the following content:

```env
PORT=5000
NODE_ENV=production
GEMINI_API_KEY=AIzaSyA91kgL0SfLuj0MfuO1heAgES4HBgHQ1Hs
```

### 5. Configure cPanel Node.js Application

1. Log in to your cPanel
2. Navigate to the "Setup Node.js App" section
3. Create a new Node.js application with the following settings:
   - Application root: `/home/infernom/Law_Students/backend`
   - Application URL: `law.infernomach.in`
   - Application startup file: `src/server.js`
   - Node.js version: (select the latest available)

### 6. Start the Application

1. After configuring the application, click "Create"
2. Once created, click "Run NPM Install" to install dependencies
3. Click "Start" to start the application

### 7. Verify Deployment

1. Visit `http://law.infernomach.in` to see the application
2. Test the API by visiting `http://law.infernomach.in/api/health`

## Troubleshooting

### Common Issues

1. **Application not starting**: Check the cPanel error logs for details
2. **Frontend not loading**: Ensure the frontend build files are correctly copied to the backend public directory
3. **API errors**: Verify environment variables are correctly set

### Logs

You can check application logs in cPanel under the Node.js application section or by running:

```bash
tail -f /home/infernom/Law_Students/backend/logs/app.log
```

## Updating the Application

To update the application:

1. Upload new files to `/home/infernom/Law_Students`
2. Rebuild the frontend: `npm run build --prefix frontend`
3. Copy frontend build: `cp -r /home/infernom/Law_Students/frontend/build/* /home/infernom/Law_Students/backend/public/`
4. Restart the Node.js application in cPanel