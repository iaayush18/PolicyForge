/**
 * src/pages/Login.jsx
 * Login Page Component
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Redirect based on role
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    }

    setIsLoading(false);
  };

  const fillDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@university.edu');
      setPassword('admin123');
    } else {
      setEmail('student1@university.edu');
      setPassword('Welcome123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Mental Health Monitor</h1>
          <p className="text-gray-600 mt-2">Student Well-being Assessment System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline mr-2" size={16} />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="your.email@university.edu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline mr-2" size={16} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-700 mb-3 text-center">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('student')}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
            >
              Student Login
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-600 space-y-1">
            <p><strong>Admin:</strong> admin@university.edu / admin123</p>
            <p><strong>Student:</strong> student1@university.edu / Welcome123</p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Need help? Contact support@university.edu
        </p>
      </div>
    </div>
  );
};

export default Login;