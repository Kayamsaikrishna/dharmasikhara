const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');

// Import database service
const databaseService = require('./src/services/database');

// Import controllers
const aiController = require('./src/controllers/aiController');

// Import courtroom controller
const CourtroomController = require('./src/controllers/courtroomController');
const courtroomController = new CourtroomController();

// Import routes
const aiRoutes = require('./src/routes/ai');
const progressRoutes = require('./src/routes/progress');
const accountRoutes = require('./src/routes/account');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database connections
databaseService.connectAll().then(() => {
  console.log('Database connections initialized');
}).catch((error) => {
  console.error('Failed to initialize database connections:', error);
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the React app build directory with no cache
app.use(express.static(path.join(__dirname, '../frontend/build'), {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/account', accountRoutes);

// Legal News API endpoint
app.get('/api/legal-news', (req, res) => {
  // For now, return mock data
  // In a real implementation, this would fetch from a news source
  const legalNews = [
    {
      id: '1',
      title: 'Supreme Court Rules on Digital Evidence Admissibility',
      summary: 'The Supreme Court has issued new guidelines on the admissibility of digital evidence in criminal proceedings, emphasizing the need for proper chain of custody.',
      content: 'In a landmark judgment delivered today, the Supreme Court of India has laid down comprehensive guidelines regarding the admissibility of digital evidence in criminal proceedings. The court emphasized the critical importance of maintaining a proper chain of custody for digital evidence to ensure its integrity and authenticity. The judgment comes at a time when digital evidence is increasingly becoming crucial in criminal investigations. The court noted that with the proliferation of digital devices and the ease with which digital data can be manipulated, stringent safeguards are necessary to prevent misuse. The guidelines require law enforcement agencies to maintain detailed logs of digital evidence handling, including timestamps of access and details of personnel involved. The judgment also mandates that digital evidence be stored in secure environments with restricted access. Legal experts have hailed the judgment as a significant step towards ensuring fair trials in the digital age.',
      source: 'Supreme Court of India',
      date: new Date().toISOString().split('T')[0],
      url: 'https://supremecourtofindia.nic.in',
      category: 'Supreme Court',
      importance: 'high'
    },
    {
      id: '2',
      title: 'New Cybersecurity Regulations for Legal Firms',
      summary: 'The Ministry of Electronics and Information Technology has released new cybersecurity guidelines specifically for legal practitioners handling sensitive client data.',
      content: 'The Ministry of Electronics and Information Technology (MeitY) has announced new cybersecurity regulations that will come into effect from January 2024. These regulations are specifically designed for legal firms and practitioners who handle sensitive client data. The new guidelines mandate that all legal firms implement multi-factor authentication for accessing client data, encrypt all stored data, and conduct regular security audits. The regulations also require firms to appoint a dedicated Data Protection Officer (DPO) who will be responsible for ensuring compliance. Legal firms with more than 50 employees must undergo annual third-party security assessments. The regulations also introduce strict penalties for data breaches, with fines of up to 2% of annual turnover or INR 5 crores, whichever is higher. The Bar Council of India has welcomed these regulations, stating that they will significantly enhance client data protection in the legal profession.',
      source: 'MeitY',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
      url: 'https://meity.gov.in',
      category: 'Regulations',
      importance: 'medium'
    },
    {
      id: '3',
      title: 'Landmark Judgment on Environmental Law',
      summary: 'The National Green Tribunal has delivered a significant judgment on industrial pollution control, setting new precedents for environmental litigation.',
      content: 'The National Green Tribunal (NGT) has delivered a groundbreaking judgment in a case related to industrial pollution control in the National Capital Region. The judgment establishes new precedents for determining liability in environmental damage cases and introduces a comprehensive framework for calculating compensation. The tribunal has mandated that all industries within a 10-kilometer radius of ecologically sensitive areas must conduct quarterly environmental impact assessments. The judgment also introduces the concept of "extended producer responsibility" for industries, requiring them to take responsibility for the entire lifecycle of their products. The tribunal has imposed strict penalties on industries found violating environmental norms, with compensation calculated based on the extent of environmental damage caused. Environmental law experts have described the judgment as a turning point in India\'s approach to environmental protection and corporate accountability.',
      source: 'NGT',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
      url: 'https://ngt.nic.in',
      category: 'Environmental Law',
      importance: 'high'
    },
    {
      id: '4',
      title: 'Amendments to the Arbitration and Conciliation Act',
      summary: 'The Parliament has passed amendments to the Arbitration and Conciliation Act to expedite dispute resolution and reduce court backlog.',
      content: 'The Parliament has passed significant amendments to the Arbitration and Conciliation Act, 1996, aimed at further expediting dispute resolution and reducing the backlog of cases in Indian courts. The amendments introduce a new provision for emergency arbitrators, allowing parties to seek urgent interim measures even before the constitution of the arbitral tribunal. The amendments also mandate that courts must dispose of applications under Section 11 (appointment of arbitrators) within 60 days. A new provision has been introduced to limit the grounds for challenging arbitral awards, with challenges now restricted to cases involving patent illegality. The amendments also introduce provisions for fast-track arbitration for disputes below INR 1 crore. The Bar Council of India has welcomed these amendments, stating that they will further strengthen India\'s position as a hub for international commercial arbitration.',
      source: 'Ministry of Law',
      date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
      url: 'https://lawmin.gov.in',
      category: 'Legislation',
      importance: 'high'
    },
    {
      id: '5',
      title: 'New Guidelines for Bail Applications',
      summary: 'The Supreme Court has issued comprehensive guidelines for bail applications in cases involving economic offenses, emphasizing proportionality.',
      content: 'The Supreme Court has issued comprehensive new guidelines for bail applications in cases involving economic offenses, with a strong emphasis on the principle of proportionality. The guidelines state that economic offenses should not automatically be treated as more serious than other offenses when considering bail applications. The court emphasized that the nature and gravity of the offense, the likelihood of the accused fleeing, and the possibility of tampering with evidence should be the primary considerations. The guidelines also mandate that courts must consider the accused\'s health, age, and family circumstances when deciding bail applications. For first-time offenders in economic cases, the guidelines suggest a presumption in favor of bail unless there are compelling reasons to the contrary. The guidelines also require detailed reasoning in bail orders, with courts expected to specifically address each ground for and against bail. Legal experts have praised these guidelines for bringing much-needed clarity and consistency to bail jurisprudence.',
      source: 'Supreme Court of India',
      date: new Date(Date.now() - 345600000).toISOString().split('T')[0], // 4 days ago
      url: 'https://supremecourtofindia.nic.in',
      category: 'Criminal Law',
      importance: 'medium'
    }
  ];

  res.json({
    success: true,
    data: legalNews
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'AI Backend is running',
        timestamp: new Date().toISOString()
    });
});

// AI Model Status Endpoint
app.get('/api/ai/status', aiController.getAIStatus);

// Courtroom Endpoints
app.get('/api/courtroom/documents', (req, res) => {
    courtroomController.getCourtroomDocuments(req, res);
});

app.get('/api/courtroom/messages', (req, res) => {
    courtroomController.getCourtroomMessages(req, res);
});

app.post('/api/courtroom/respond', (req, res) => {
    courtroomController.getCourtroomResponse(req, res);
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`DharmaSikhara AI Backend running on http://0.0.0.0:${PORT}`);
});

module.exports = app;