const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/scenarios', require('./routes/scenarios'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/certification', require('./routes/certification'));
app.use('/api/content', require('./routes/content'));
app.use('/api/courtroom', require('./routes/courtroom'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/expert-support', require('./routes/expertSupport'));
app.use('/api/evidence', require('./routes/evidence'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/account', require('./routes/account'));
app.use('/api/multiplayer', require('./routes/multiplayer'));
app.use('/api/language', require('./routes/language'));
app.use('/api/voice', require('./routes/voice'));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

module.exports = app;