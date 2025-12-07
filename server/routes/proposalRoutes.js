const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');

// POST /api/proposals/receive - Receive and parse proposal
router.post('/receive', proposalController.receiveProposal);

// GET /api/rfp/:id/proposals - Get proposals for RFP with comparison
router.get('/rfp/:id/proposals', proposalController.getProposalsForRFP);

module.exports = router;
