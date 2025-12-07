const Proposal = require('../models/Proposal');
const RFP = require('../models/RPF');
const Vendor = require('../models/Vendor');
const { parseProposal, generateComparison } = require('../services/geminiService');

// Manually receive and parse proposal (for demo)
exports.receiveProposal = async (req, res) => {
  try {
    const { rfpId, vendorId, emailBody } = req.body;

    // Fetch RFP and Vendor
    const rfp = await RFP.findById(rfpId);
    const vendor = await Vendor.findById(vendorId);

    if (!rfp || !vendor) {
      return res.status(404).json({ error: 'RFP or Vendor not found' });
    }

    // Parse email with AI
    const parsedData = await parseProposal(emailBody, rfp);

    // Create proposal
    const proposal = new Proposal({
      rfpId,
      vendorId,
      totalPrice: parsedData.totalPrice,
      currency: parsedData.currency || 'USD',
      deliveryDays: parsedData.deliveryDays,
      paymentTerms: parsedData.paymentTerms,
      warrantyMonths: parsedData.warrantyMonths,
      rawEmailBody: emailBody,
      parsedDetailsJSON: parsedData
    });

    await proposal.save();

    // Update RFP status
    rfp.status = 'proposals_received';
    await rfp.save();

    res.status(201).json(proposal);
  } catch (error) {
    console.error('Receive Proposal Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get proposals for an RFP with AI comparison
exports.getProposalsForRFP = async (req, res) => {
  try {
    const { id } = req.params;

    const rfp = await RFP.findById(id);
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    const proposals = await Proposal.find({ rfpId: id }).populate('vendorId');

    if (proposals.length === 0) {
      return res.json({ proposals: [], recommendation: null });
    }

    // Generate AI comparison if not already scored
    const needsScoring = proposals.some(p => !p.aiScore);

    if (needsScoring) {
      const proposalsData = proposals.map(p => ({
        vendorId: p.vendorId._id,
        vendorName: p.vendorId.name,
        totalPrice: p.totalPrice,
        deliveryDays: p.deliveryDays,
        warrantyMonths: p.warrantyMonths,
        paymentTerms: p.paymentTerms
      }));

      const comparison = await generateComparison(rfp, proposalsData);

      // Update proposals with scores
      for (const scoreData of comparison.scores) {
        const proposal = proposals.find(p => p.vendorId._id.toString() === scoreData.vendorId);
        if (proposal) {
          proposal.aiScore = scoreData.score;
          proposal.aiSummary = scoreData.reasoning;
          await proposal.save();
        }
      }

      // Refresh proposals with updated scores
      const updatedProposals = await Proposal.find({ rfpId: id }).populate('vendorId');

      return res.json({
        proposals: updatedProposals,
        recommendation: comparison.recommendation
      });
    }

    // If already scored, just return
    const recommendation = "Proposals have been evaluated. See scores and reasoning below.";
    res.json({ proposals, recommendation });

  } catch (error) {
    console.error('Get Proposals Error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
