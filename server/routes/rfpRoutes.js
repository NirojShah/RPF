const express = require('express');
const router = express.Router();
const rfpController = require('../controllers/rfpController');

// POST /api/rfp/generate - Generate RFP from text
router.post('/generate', rfpController.generateRFP);

// POST /api/rfp - Create new RFP
router.post('/', rfpController.createRFP);

// GET /api/rfp - Get all RFPs
router.get('/', rfpController.getAllRFPs);

// GET /api/rfp/:id - Get single RFP
router.get('/:id', rfpController.getRFPById);

// POST /api/rfp/:id/send - Send RFP to vendors
router.post('/:id/send', rfpController.sendRFP);

module.exports = router;
