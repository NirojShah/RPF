import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, TrendingUp, Award, Clock, DollarSign, Shield } from 'lucide-react';

const ProposalsComparison = () => {
  const { id } = useParams();
  
  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch RFP
      const rfpResponse = await fetch(`http://localhost:5000/api/rfp/${id}`);
      const rfpData = await rfpResponse.json();
      setRfp(rfpData);

      // Fetch proposals - ✅ FIXED URL
      const proposalsResponse = await fetch(`http://localhost:5000/api/proposals/rfp/${id}/proposals`);
      const proposalsData = await proposalsResponse.json();
      setProposals(proposalsData.proposals || []);
      setAiRecommendation(proposalsData.recommendation || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 9) return 'text-green-600 bg-green-100';
    if (score >= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBadge = (score) => {
    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold ${getScoreColor(score)}`}>
        <Award size={16} />
        {score}/10
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Proposal Comparison</h1>
        <p className="text-gray-600 mt-1">{rfp?.title}</p>
      </div>

      {/* AI Recommendation */}
      {aiRecommendation && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">🤖 AI Recommendation</h2>
              <p className="text-gray-700 leading-relaxed">{aiRecommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Proposals Table */}
      {proposals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals received yet</h3>
          <p className="text-gray-600">Waiting for vendors to respond to the RFP</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      Total Price
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      Delivery
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Shield size={16} />
                      Warranty
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Terms
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {proposals.map((proposal) => (
                  <tr key={proposal._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{proposal.vendorId?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{proposal.vendorId?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${proposal.totalPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {proposal.deliveryDays} days
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {proposal.warrantyMonths} months
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {proposal.paymentTerms}
                    </td>
                    <td className="px-6 py-4">
                      {proposal.aiScore ? getScoreBadge(proposal.aiScore) : (
                        <span className="text-gray-400 text-sm">Not scored</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Reasoning */}
          <div className="border-t bg-gray-50 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
            <div className="space-y-4">
              {proposals.map((proposal) => (
                proposal.aiSummary && (
                  <div key={proposal._id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{proposal.vendorId?.name}</h4>
                      {proposal.aiScore && getScoreBadge(proposal.aiScore)}
                    </div>
                    <p className="text-sm text-gray-700">{proposal.aiSummary}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsComparison;
