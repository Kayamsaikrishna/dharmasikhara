// This file is used by cPanel to start the application
// It sets memory limits and starts the actual server

// Set memory limits for Node.js to prevent out of memory errors
// This is especially important in cPanel environments with resource limits

// Start the main application with memory limits
require('./src/server.js');