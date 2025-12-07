const Imap = require("imap");
const { simpleParser } = require("mailparser");
const RFP = require("../models/RPF");
const Vendor = require("../models/Vendor");
const Proposal = require("../models/Proposal");
const { parseProposal } = require("./geminiService");

// IMAP configuration
const imapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  connTimeout: 30000, // ADD THIS - 30 second timeout
  authTimeout: 20000, // ADD THIS - 20 second auth timeout
  keepalive: false, // ADD THIS - disable keepalive
};
let isPolling = false;

// Start polling for new emails
const startEmailPolling = () => {
  if (isPolling) {
    console.log("Email polling already running");
    return;
  }

  console.log("🔄 Starting email polling service...");
  isPolling = true;

  // Poll every 30 seconds
  setInterval(() => {
    checkForNewEmails();
  }, 30000);

  // Check immediately on start
  checkForNewEmails();
};

// Check inbox for new emails
// Check inbox for new emails
const checkForNewEmails = async () => {
  return new Promise((resolve) => {
    const imap = new Imap(imapConfig);
    let isConnected = false;

    // Set connection timeout
    const connectionTimeout = setTimeout(() => {
      if (!isConnected) {
        console.log("⚠️ IMAP connection timeout, will retry...");
        imap.end();
        resolve();
      }
    }, 15000); // 15 second timeout

    imap.once("ready", () => {
      isConnected = true;
      clearTimeout(connectionTimeout);

      imap.openBox("INBOX", false, (err, box) => {
        if (err) {
          console.error("Error opening inbox:", err);
          imap.end();
          resolve();
          return;
        }

        // Search for unseen emails from the last 24 hours
        imap.search(
          ["UNSEEN", ["SINCE", new Date(Date.now() - 24 * 60 * 60 * 1000)]],
          (err, results) => {
            if (err) {
              console.error("Error searching emails:", err);
              imap.end();
              resolve();
              return;
            }

            if (!results || results.length === 0) {
              console.log("No new vendor emails found");
              imap.end();
              resolve();
              return;
            }

            console.log(`📧 Found ${results.length} new email(s)`);

            const fetch = imap.fetch(results, { bodies: "" });

            fetch.on("message", (msg) => {
              msg.on("body", (stream) => {
                simpleParser(stream, async (err, parsed) => {
                  if (err) {
                    console.error("Error parsing email:", err);
                    return;
                  }

                  try {
                    await processVendorEmail(parsed);
                  } catch (error) {
                    console.error("Error processing email:", error);
                  }
                });
              });

              msg.once("attributes", (attrs) => {
                // Mark as seen
                imap.addFlags(attrs.uid, ["\\Seen"], (err) => {
                  if (err) console.error("Error marking email as seen:", err);
                });
              });
            });

            fetch.once("error", (err) => {
              console.error("Fetch error:", err);
              imap.end();
              resolve();
            });

            fetch.once("end", () => {
              console.log("✅ Finished processing emails");
              imap.end();
              resolve();
            });
          }
        );
      });
    });

    imap.once("error", (err) => {
      console.error("IMAP error:", err.message);
      clearTimeout(connectionTimeout);
      resolve();
    });

    imap.once("end", () => {
      clearTimeout(connectionTimeout);
      resolve();
    });

    try {
      imap.connect();
    } catch (err) {
      console.error("Connection error:", err);
      clearTimeout(connectionTimeout);
      resolve();
    }
  });
};

// Process vendor email and create proposal
const processVendorEmail = async (email) => {
  try {
    console.log("📬 Processing email from:", email.from.text);
    console.log("Subject:", email.subject);

    // Extract vendor email
    const vendorEmail = email.from.value[0].address;
    console.log("Checking vendor email:", vendorEmail);

    // DYNAMIC VENDOR CHECKING - Fetch all vendors from database
    const allVendors = await Vendor.find({});
    const vendorEmails = allVendors.map((v) => v.email);
    
    console.log("📋 Valid vendor emails in database:", vendorEmails);

    if (!vendorEmails.includes(vendorEmail)) {
      console.log("⚠️ Email not from registered vendor, skipping:", vendorEmail);
      return;
    }
    // Extract RFP ID from subject line
    const rfpIdMatch = email.subject.match(/ID:\s*([a-f0-9]{24})/i);
    if (!rfpIdMatch) {
      console.log("⚠️ No RFP ID found in subject, skipping");
      return;
    }

    const rfpId = rfpIdMatch[1];
    console.log("Found RFP ID:", rfpId);

    // Find the RFP
    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      console.log("⚠️ RFP not found:", rfpId);
      return;
    }

    // Find the vendor
    const vendor = await Vendor.findOne({ email: vendorEmail });
    if (!vendor) {
      console.log("⚠️ Vendor not found:", vendorEmail);
      return;
    }

    console.log("✅ Vendor found:", vendor.name);

    // Check if proposal already exists
    const existingProposal = await Proposal.findOne({
      rfpId: rfpId,
      vendorId: vendor._id,
    });

    if (existingProposal) {
      console.log("⚠️ Proposal already exists for this vendor, skipping");
      return;
    }

    // Get email body text
    const emailBody = email.text || email.html || "";
    console.log("Email body length:", emailBody.length);

    // Parse with AI
    console.log("🤖 Parsing with AI...");
    const parsedData = await parseProposal(emailBody, rfp);

    // Create proposal
    const proposal = new Proposal({
      rfpId: rfpId,
      vendorId: vendor._id,
      totalPrice: parsedData.totalPrice,
      currency: parsedData.currency || "USD",
      deliveryDays: parsedData.deliveryDays,
      paymentTerms: parsedData.paymentTerms,
      warrantyMonths: parsedData.warrantyMonths,
      rawEmailBody: emailBody,
      parsedDetailsJSON: parsedData,
    });

    await proposal.save();

    // Update RFP status
    rfp.status = "proposals_received";
    await rfp.save();

    console.log("✅ Proposal created successfully for vendor:", vendor.name);
  } catch (error) {
    console.error("❌ Error processing vendor email:", error);
  }
};


module.exports = {
  startEmailPolling,
  checkForNewEmails,
};
