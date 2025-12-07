import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Users, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [rfps, setRfps] = useState([]);
  const [stats, setStats] = useState({
    totalRFPs: 0,
    activeRFPs: 0,
    totalVendors: 0,
    pendingProposals: 0
  });

  useEffect(() => {
    // Fetch RFPs from backend
    fetchRFPs();
    fetchStats();
  }, []);

  const fetchRFPs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rfp');
      const data = await response.json();
      setRfps(data);
    } catch (error) {
      console.error('Error fetching RFPs:', error);
    }
  };

const fetchStats = async () => {
  try {
    // Fetch real stats from backend
    const [rfpsRes, vendorsRes] = await Promise.all([
      fetch('http://localhost:5000/api/rfp'),
      fetch('http://localhost:5000/api/vendors')
    ]);

    const rfpsData = await rfpsRes.json();
    const vendorsData = await vendorsRes.json();

    // Calculate stats
    const totalRFPs = rfpsData.length;
    const activeRFPs = rfpsData.filter(rfp => rfp.status === 'sent').length;
    const totalVendors = vendorsData.length;
    const pendingProposals = rfpsData.filter(rfp => rfp.status === 'sent').length;

    setStats({
      totalRFPs,
      activeRFPs,
      totalVendors,
      pendingProposals
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Keep default values on error
    setStats({
      totalRFPs: 0,
      activeRFPs: 0,
      totalVendors: 0,
      pendingProposals: 0
    });
  }
};


  const statCards = [
    { label: 'Total RFPs', value: stats.totalRFPs, icon: FileText, color: 'blue' },
    { label: 'Active RFPs', value: stats.activeRFPs, icon: Clock, color: 'purple' },
    { label: 'Total Vendors', value: stats.totalVendors, icon: Users, color: 'green' },
    { label: 'Pending Proposals', value: stats.pendingProposals, icon: CheckCircle, color: 'yellow' },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      proposals_received: 'bg-green-100 text-green-700',
    };
    return styles[status] || styles.draft;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your RFPs efficiently with AI</p>
        </div>
        <Link
          to="/rfp/create"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Create New RFP
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RFPs Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent RFPs</h2>
        </div>
        
        {rfps.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No RFPs yet</h3>
            <p className="text-gray-600 mb-6">Create your first RFP to get started</p>
            <Link
              to="/rfp/create"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Create RFP
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RFP Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rfps.map((rfp) => (
                  <tr key={rfp._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{rfp.title}</div>
                      <div className="text-sm text-gray-500">{rfp.lineItems?.length || 0} items</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${rfp.budget?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(rfp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(rfp.status)}`}>
                        {rfp.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Link
                          to={`/rfp/${rfp._id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                        <Link
                          to={`/rfp/${rfp._id}/send`}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          Send
                        </Link>
                        <Link
                          to={`/rfp/${rfp._id}/proposals`}
                          className="text-green-600 hover:text-green-800"
                        >
                          Compare
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
