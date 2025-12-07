import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateRFP from "./pages/CreateRPF";
import RFPDetails from "./pages/RFPDetails";
import SendRFP from "./pages/SendRPF";
import ProposalsComparison from "./pages/ProposalsComparison";
import Vendors from "./pages/Vendors";
import Layout from "./components/Layout";
import SubmitProposal from "./pages/SubmitProposal";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rfp/create" element={<CreateRFP />} />
          <Route path="/rfp/:id" element={<RFPDetails />} />
          <Route path="/rfp/:id/send" element={<SendRFP />} />
          <Route path="/rfp/:id/proposals" element={<ProposalsComparison />} />
          <Route
            path="/rfp/:id/submit-proposal"
            element={<SubmitProposal />}
          />{" "}
          {/* ✅ New */}
          <Route path="/vendors" element={<Vendors />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
