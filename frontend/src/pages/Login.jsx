/**
 * src/pages/Login.jsx
 * Optimized with Glassmorphism & PostgreSQL Enum support
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
      // ✅ FIXED: Roles are now uppercase Enums from PostgreSQL
      if (result.user.role === 'ADMIN') {
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
    <div className="min-h-screen app-bg flex items-center justify-center p-4">
      {/* ✅ FIXED: Applied 'glass' class and centered design */}
      <div className="glass-strong p-8 w-full max-w-md border-0 shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
            <Users className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Well-being Portal</h1>
          <p className="text-indigo-100/70 mt-2 text-sm uppercase tracking-widest font-medium">Student Monitoring System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-white transition-all placeholder:text-white/20"
                placeholder="university.email@edu.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-white transition-all placeholder:text-white/20"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-50 transition transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg mt-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-700"></div>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Section */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-[10px] font-black text-indigo-100/50 uppercase tracking-[0.2em] mb-4 text-center">Quick Access</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="px-3 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10 transition text-xs font-bold"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('student')}
              className="px-3 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10 transition text-xs font-bold"
            >
              Student Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;