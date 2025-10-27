const express = require('express');
const router = express.Router();
const path = require('path');

// Import controllers
const EvidenceController = require('../controllers/evidenceController');
const evidenceController = new EvidenceController();

// Multer for file uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Evidence Endpoints
router.get('/', evidenceController.getEvidence.bind(evidenceController));
router.get('/:id', evidenceController.getEvidenceItem.bind(evidenceController));
router.post('/upload', upload.single('file'), evidenceController.uploadEvidence.bind(evidenceController));
router.post('/:id/analyze', evidenceController.analyzeEvidence.bind(evidenceController));

// Paperwork Endpoints
router.get('/paperwork/templates', evidenceController.getPaperworkTemplates.bind(evidenceController));
router.post('/paperwork/generate', evidenceController.generatePaperwork.bind(evidenceController));

// Evidence image serving endpoint
router.get('/images/:filename', evidenceController.getEvidenceImage.bind(evidenceController));

module.exports = router;