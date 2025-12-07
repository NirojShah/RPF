const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'smtp.gmail.com'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
  }
});

// Send RFP to vendors
const sendRFPEmail = async (vendor, rfp) => {
  const emailBody = `
Dear ${vendor.name},

We are pleased to share a Request for Proposal (RFP) for your review.

RFP Title: ${rfp.title}
Budget: $${rfp.budget.toLocaleString()}
Delivery Deadline: ${rfp.deliveryDeadline} days
Payment Terms: ${rfp.paymentTerms}

LINE ITEMS:
${rfp.lineItems.map((item, i) => `${i + 1}. ${item.itemType} - Quantity: ${item.quantity}, Specs: ${item.specs}`).join('\n')}

Please reply to this email with your proposal including:
- Total price
- Delivery timeline
- Warranty details
- Payment terms
- Any additional notes

Looking forward to your response.

Best regards,
Procurement Team
`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: vendor.email,
    subject: `RFP: ${rfp.title} - ID: ${rfp._id}`,
    text: emailBody
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to', vendor.email, ':', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw error;
  }
};

module.exports = {
  sendRFPEmail
};
