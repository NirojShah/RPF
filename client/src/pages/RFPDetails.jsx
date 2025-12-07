import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  BarChart3,
  Calendar,
  DollarSign,
  Clock,
} from "lucide-react";

const RFPDetails = () => {
  const { id } = useParams();
  const [rfp, setRfp] = useState(null);

  useEffect(() => {
    fetchRFP();
  }, [id]);

  const fetchRFP = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/rfp/${id}`);
      const data = await response.json();
      setRfp(data);
    } catch (error) {
      console.error("Error fetching RFP:", error);
    }
  };

  if (!rfp) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {rfp.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                Created: {new Date(rfp.createdAt).toLocaleDateString()}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  rfp.status === "sent"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {rfp.status?.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/rfp/${id}/send`}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Send size={18} />
              Send to Vendors
            </Link>
            <Link
              to={`/rfp/${id}/proposals`}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <BarChart3 size={18} />
              Compare Proposals
            </Link>
            <Link
              to={`/rfp/${id}/submit-proposal`}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              <Send size={18} />
              Submit Proposal (Demo)
          </Link>
          </div>
        </div>
      </div>

      {/* RFP Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-600" size={24} />
            <h3 className="font-semibold text-gray-900">Budget</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${rfp.budget?.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-blue-600" size={24} />
            <h3 className="font-semibold text-gray-900">Delivery Deadline</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {rfp.deliveryDeadline} days
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-purple-600" size={24} />
            <h3 className="font-semibold text-gray-900">Payment Terms</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{rfp.paymentTerms}</p>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Line Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Specifications
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rfp.lineItems?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.itemType}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.specs}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RFPDetails;
