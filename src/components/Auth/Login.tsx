import React, { useState } from 'react';
import { Package, Eye, EyeOff, UserPlus } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (userData: { name: string; email: string; password: string; role: string }) => Promise<boolean>;
  loading: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, loading }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let success = false;
    if (isLoginMode) {
      success = await onLogin(formData.email, formData.password);
    } else {
      success = await onRegister(formData);
    }
    
    if (!success) {
      setError(isLoginMode ? 'Invalid email or password' : 'Registration failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@supermarket.com', password: 'admin123' },
    { role: 'Manager', email: 'manager@supermarket.com', password: 'manager123' },
    { role: 'Cashier', email: 'cashier@supermarket.com', password: 'cashier123' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SuperMarket System</h1>
          <p className="text-gray-600 mt-2">
            {isLoginMode ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required={!isLoginMode}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={!isLoginMode}
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isLoginMode ? (
              <>
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
              setFormData({ name: '', email: '', password: '', role: 'cashier' });
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLoginMode ? "Don't have an account? Register here" : "Already have an account? Sign in"}
          </button>
        </div>

        {isLoginMode && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Demo Accounts</h3>
            <div className="space-y-2">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      email: account.email,
                      password: account.password
                    });
                  }}
                  className="w-full text-left px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{account.role}</span>
                    <span className="text-xs text-gray-500">{account.email}</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Click to auto-fill credentials</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;