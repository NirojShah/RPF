const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  rfpId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFP',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  deliveryDays: Number,
  paymentTerms: String,
  warrantyMonths: Number,
  rawEmailBody: String,
  parsedDetailsJSON: Object,
  aiScore: Number,
  aiSummary: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Proposal', proposalSchema);
