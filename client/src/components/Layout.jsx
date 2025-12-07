import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <Navbar />
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
