import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';

const BasicLogin = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } else {
      setError(result.message || 'Invalid credentials. Please try again.');
    }

    setIsLoading(false);
  };

  const fillDemoCredentials = (role) => {
    setError('');
    if (role === 'admin') {
      setEmail('admin@university.edu');
      setPassword('admin123');
    } else {
      setEmail('student1@university.edu');
      setPassword('Welcome123');
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '100px auto', background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <ShieldCheck size={48} color="#333" style={{ margin: '0 auto' }} />
        <h2 style={{ color: '#333', marginTop: '10px' }}>Sign In</h2>
        <p style={{ color: '#666' }}>Student Monitoring System (Basic)</p>
      </div>

      {error && <div style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Email</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
            <Mail size={16} color="#666" style={{ marginRight: '10px' }} />
            <input 
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="University email"
              required
              style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Password</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
            <Lock size={16} color="#666" style={{ marginRight: '10px' }} />
            <input 
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              required
              style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent' }}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !email || !password}
          style={{ padding: '12px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', fontWeight: 'bold' }}
        >
          {isLoading ? 'Loading...' : <><LogIn size={16} style={{ marginRight: '8px' }}/> Sign In</>}
        </button>
      </form>

      <div style={{ marginTop: '30px', borderTop: '1px solid #e0e0e0', paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Quick access (Demo)</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button onClick={() => fillDemoCredentials('admin')} style={{ padding: '6px 12px', cursor: 'pointer', background: '#e9ecef', border: '1px solid #ccc', borderRadius: '4px' }}>Admin</button>
          <button onClick={() => fillDemoCredentials('student')} style={{ padding: '6px 12px', cursor: 'pointer', background: '#e9ecef', border: '1px solid #ccc', borderRadius: '4px' }}>Student</button>
        </div>
      </div>
    </div>
  );
};

export default BasicLogin;
