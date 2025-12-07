const RFP = require('../models/RPF');
const Vendor = require('../models/Vendor');
const { sendRFPEmail } = require('../services/emailService');
const { generateRFP } = require('../services/geminiService');

// Generate RFP from natural language
exports.generateRFP = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const rfpData = await generateRFP(text);
    
    res.json(rfpData);
  } catch (error) {
    console.error('Generate RFP Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create and save RFP
exports.createRFP = async (req, res) => {
  try {
    const rfp = new RFP(req.body);
    await rfp.save();
    
    res.status(201).json(rfp);
  } catch (error) {
    console.error('Create RFP Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all RFPs
exports.getAllRFPs = async (req, res) => {
  try {
    const rfps = await RFP.find().sort({ createdAt: -1 });
    res.json(rfps);
  } catch (error) {
    console.error('Get RFPs Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single RFP
exports.getRFPById = async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.id).populate('sentTo');
    
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    
    res.json(rfp);
  } catch (error) {
    console.error('Get RFP Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send RFP to vendors
exports.sendRFP = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorIds } = req.body;

    const rfp = await RFP.findById(id);
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    const vendors = await Vendor.find({ _id: { $in: vendorIds } });

    // Send emails
    const emailPromises = vendors.map(vendor => sendRFPEmail(vendor, rfp));
    await Promise.all(emailPromises);

    // Update RFP status
    rfp.status = 'sent';
    rfp.sentTo = vendorIds;
    await rfp.save();

    res.json({ message: 'RFP sent successfully', sentTo: vendors.length });
  } catch (error) {
    console.error('Send RFP Error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
