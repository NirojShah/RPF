require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const rfpRoutes = require("./routes/rfpRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const { startEmailPolling } = require("./services/emailPollingService");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/rfp", rfpRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/proposals", proposalRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "RFP Management API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  setTimeout(() => {
    startEmailPolling();
  }, 5000);
});
