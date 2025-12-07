const mongoose = require('mongoose');

const rfpSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  descriptionText: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  deliveryDeadline: {
    type: Number, // in days
    required: true
  },
  paymentTerms: {
    type: String,
    required: true
  },
  lineItems: [{
    itemType: String,
    quantity: Number,
    specs: String
  }],
  status: {
    type: String,
    enum: ['draft', 'sent', 'proposals_received'],
    default: 'draft'
  },
  sentTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('RFP', rfpSchema);
