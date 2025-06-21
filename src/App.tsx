import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Inventory from './components/Inventory/Inventory';
import POS from './components/POS/POS';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import SalesReport from './components/Reports/SalesReport';
import UserManagement from './components/Users/UserManagement';
import AuditLogs from './components/Audit/AuditLogs';

function App() {
  const { user, loading, login, register, logout, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <Login onLogin={login} onRegister={register} loading={loading} />
        <Toaster position="top-right" />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'pos':
        return <POS />;
      case 'reports':
        return <SalesReport />;
      case 'users':
        return <UserManagement />;
      case 'audit':
        return <AuditLogs />;
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
              <p className="text-gray-500">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
          user={user}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} onLogout={logout} />
          <main className="flex-1 overflow-y-auto">
            {renderPage()}
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  );
}

export default App;