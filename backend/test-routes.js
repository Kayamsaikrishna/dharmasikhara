const express = require('express');
const app = express();
// Legal news routes removed
// const legalNewsRoutes = require('./src/routes/legalNews');

// app.use('/api/legal-news', legalNewsRoutes);

app.listen(3005, () => {
  console.log('Test server running on port 3005');
});