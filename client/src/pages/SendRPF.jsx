import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, CheckCircle, Loader } from 'lucide-react';

const SendRFP = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [rfp, setRfp] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
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
      console.error('Error fetching RFP:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vendors');
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const toggleVendor = (vendorId) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSend = async () => {
    if (selectedVendors.length === 0) {
      alert('Please select at least one vendor');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/rfp/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorIds: selectedVendors })
      });

      if (!response.ok) throw new Error('Failed to send RFP');

      setSuccess(true);
      setTimeout(() => {
        navigate(`/rfp/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Error sending RFP:', error);
      alert('Failed to send RFP');
    } finally {
      setLoading(false);
    }
  };

  if (!rfp) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Send RFP to Vendors</h1>
        <p className="text-gray-600 mt-1">Select vendors to receive this RFP</p>
      </div>

      {/* RFP Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">RFP Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Title</p>
            <p className="font-medium text-gray-900">{rfp.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budget</p>
            <p className="font-medium text-gray-900">${rfp.budget?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Delivery Deadline</p>
            <p className="font-medium text-gray-900">{rfp.deliveryDeadline} days</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Items</p>
            <p className="font-medium text-gray-900">{rfp.lineItems?.length} items</p>
          </div>
        </div>
      </div>

      {/* Vendor Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Vendors ({selectedVendors.length} selected)
        </h2>

        {vendors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No vendors available</p>
            <button
              onClick={() => navigate('/vendors')}
              className="text-blue-600 hover:text-blue-800"
            >
              Add vendors first →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map((vendor) => {
              const isSelected = selectedVendors.includes(vendor._id);
              
              return (
                <div
                  key={vendor._id}
                  onClick={() => toggleVendor(vendor._id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <CheckCircle className="text-white" size={16} />}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-gray-600">{vendor.email}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Button */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSend}
          disabled={loading || selectedVendors.length === 0 || success}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={20} />
              Sending...
            </>
          ) : success ? (
            <>
              <CheckCircle size={20} />
              Sent Successfully!
            </>
          ) : (
            <>
              <Send size={20} />
              Send RFP via Email
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SendRFP;
