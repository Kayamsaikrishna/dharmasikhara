# CPanel Deployment Instructions for law.infernomach.in

## Overview
This guide provides step-by-step instructions for deploying the DharmaSikhara Legal AI application on cPanel hosting (Hostinger) for the domain law.infernomach.in.

## Prerequisites
1. cPanel account with Node.js application support
2. SSH access to your cPanel account (if needed)
3. Files uploaded to: `/home/infernom/Law_Students`

## Deployment Steps

### 1. Upload Files
Upload all project files to `/home/infernom/Law_Students` directory on your cPanel account.

### 2. Update Dependencies
We've already modified the package.json to use cPanel-friendly dependencies:
- Replaced `bcrypt` with `bcryptjs` (pure JavaScript implementation)
- Removed `python-shell` (not compatible with cPanel shared hosting)
- Replaced `sqlite3` with `better-sqlite3` (more reliable installation)

### 3. Build the Frontend Application
First, you need to build the React frontend application:

```bash
cd /home/infernom/Law_Students
npm run build --prefix frontend
```

### 4. Copy Frontend Build to Backend
Copy the built frontend files to the backend public directory:

```bash
cp -r /home/infernom/Law_Students/frontend/build/* /home/infernom/Law_Students/backend/public/
```

### 5. Install Backend Dependencies
Navigate to the backend directory and install dependencies:

```bash
cd /home/infernom/Law_Students/backend
npm install --production
```

Note: Using `--production` flag to avoid installing development dependencies that may cause issues.

### 6. Set Up Environment Variables
Create a `.env` file in the backend directory with the following content:

```env
PORT=5000
NODE_ENV=production
GEMINI_API_KEY=AIzaSyA91kgL0SfLuj0MfuO1heAgES4HBgHQ1Hs
JWT_SECRET=your_jwt_secret_here
```

### 7. Configure cPanel Node.js Application
1. Log in to your cPanel
2. Navigate to the "Setup Node.js App" section
3. Create a new Node.js application with the following settings:
   - Application root: `/home/infernom/Law_Students/backend`
   - Application URL: `law.infernomach.in`
   - Application startup file: `server.js`
   - Node.js version: Select version 16 or higher

### 8. Run NPM Install
After configuring the application in cPanel:
1. Click "Create" to set up the application
2. Once created, click "Run NPM Install" to install dependencies
3. If you encounter any issues, try running npm install from SSH:
   ```bash
   cd /home/infernom/Law_Students/backend
   npm install --production
   ```

### 9. Start the Application
Click "Start" to start the application in cPanel.

### 10. Verify Deployment
1. Visit `http://law.infernomach.in` to see the application
2. Test the API by visiting `http://law.infernomach.in/api/health`

## Troubleshooting Common Issues

### Issue 1: NPM Install Fails
If npm install fails in cPanel:
1. Try running it via SSH instead:
   ```bash
   cd /home/infernom/Law_Students/backend
   npm install --production --verbose
   ```
2. Check if there's enough disk space and inodes available
3. Ensure you're using Node.js version 16 or higher

### Issue 2: Application Won't Start
1. Check cPanel error logs for details
2. Verify environment variables are correctly set
3. Ensure the PORT in .env matches what's configured in cPanel

### Issue 3: Frontend Not Loading
1. Ensure the frontend build files are correctly copied to the backend public directory
2. Check that the static file serving middleware is working in server.js

### Issue 4: Database Connection Issues
1. The application uses SQLite by default which should work without additional setup
2. Check file permissions on the database file

## Updating the Application
To update the application:

1. Upload new files to `/home/infernom/Law_Students`
2. Rebuild the frontend: `npm run build --prefix frontend`
3. Copy frontend build: `cp -r /home/infernom/Law_Students/frontend/build/* /home/infernom/Law_Students/backend/public/`
4. If dependencies changed, run: `cd /home/infernom/Law_Students/backend && npm install --production`
5. Restart the Node.js application in cPanel

## Support
If you continue to experience issues, please contact support with:
1. Error messages from cPanel logs
2. Output from npm install command
3. Screenshots of cPanel Node.js application configuration