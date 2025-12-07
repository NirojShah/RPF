import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Users, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Create RFP', path: '/rfp/create', icon: FileText },
    { name: 'Vendors', path: '/vendors', icon: Users },
  ];

  return (
    <div className="h-screen w-64 bg-white shadow-lg fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          RFP Manager
        </h1>
        <p className="text-sm text-gray-500 mt-1">AI-Powered</p>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
