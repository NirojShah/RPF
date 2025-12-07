import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader, Save } from 'lucide-react';

const CreateRFP = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [generatedRFP, setGeneratedRFP] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('Please describe what you need to procure');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/rfp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });

      if (!response.ok) throw new Error('Failed to generate RFP');

      const data = await response.json();
      setGeneratedRFP(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rfp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedRFP)
      });

      if (!response.ok) throw new Error('Failed to save RFP');

      const saved = await response.json();
      navigate(`/rfp/${saved._id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New RFP</h1>
        <p className="text-gray-600 mt-2">
          Describe your procurement needs in natural language, and AI will structure it for you
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe Your Procurement Needs
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Example: I need to procure 20 laptops with 16GB RAM and Intel i5 processor, 15 monitors 27-inch. Budget is $50,000 total. Need delivery within 30 days. Payment terms should be net 30, and we need at least 1 year warranty."
          className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={20} />
              Generating with AI...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate RFP with AI
            </>
          )}
        </button>
      </div>

      {/* Generated RFP Display */}
      {generatedRFP && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Generated RFP</h2>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Save size={18} />
              Save RFP
            </button>
          </div>

          {/* RFP Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={generatedRFP.title || ''}
                onChange={(e) => setGeneratedRFP({...generatedRFP, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  ${generatedRFP.budget?.toLocaleString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Deadline</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {generatedRFP.deliveryDeadline} days
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                {generatedRFP.paymentTerms}
              </div>
            </div>

            {/* Line Items */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Specifications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {generatedRFP.lineItems?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.itemType}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{item.specs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRFP;
