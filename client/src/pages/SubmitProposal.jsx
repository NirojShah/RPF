import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, CheckCircle } from 'lucide-react';

const SubmitProposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [rfp, setRfp] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    vendorId: '',
    emailBody: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchRFP();
    fetchVendors();
  }, [id]);

  const fetchRFP = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/rfp/${id}`);
      const data = await response.json();
      setRfp(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vendors');
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/proposals/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfpId: id,
          vendorId: formData.vendorId,
          emailBody: formData.emailBody
        })
      });

      if (!response.ok) throw new Error('Failed to submit proposal');

      setSuccess(true);
      setTimeout(() => {
        navigate(`/rfp/${id}/proposals`);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  if (!rfp) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Submit Vendor Proposal</h1>
        <p className="text-gray-600 mt-1">Simulate receiving a vendor response (For Demo)</p>
      </div>

      {/* RFP Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">RFP: {rfp.title}</h2>
        <p className="text-sm text-gray-600">Budget: ${rfp.budget?.toLocaleString()} | Deadline: {rfp.deliveryDeadline} days</p>
      </div>

      {/* Proposal Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Vendor
            </label>
            <select
              required
              value={formData.vendorId}
              onChange={(e) => setFormData({...formData, vendorId: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a vendor...</option>
              {vendors.map(vendor => (
                <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor Email Response (Simulate)
            </label>
            <textarea
              required
              value={formData.emailBody}
              onChange={(e) => setFormData({...formData, emailBody: e.target.value})}
              placeholder={`Example:

Dear Procurement Team,

Thank you for the RFP. We are pleased to submit our proposal:

- Total Price: $12,000
- Delivery: 18 days
- Warranty: 2 years
- Payment Terms: Net-30

We look forward to working with you.

Best regards,
Vendor Name`}
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
            />
            <p className="mt-2 text-sm text-gray-500">
              AI will extract: price, delivery days, warranty, payment terms
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <>Processing with AI...</>
            ) : success ? (
              <>
                <CheckCircle size={20} />
                Proposal Submitted!
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Proposal (AI will parse)
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitProposal;
