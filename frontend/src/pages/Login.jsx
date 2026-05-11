/**
 * src/pages/Login.jsx
 * v2 — Redesigned with entry animations, inline error states,
 *       password visibility toggle, and a richer visual identity.
 *       Backend logic is unchanged.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react';

/* ── tiny typewriter hook ── */
const useTypewriter = (words, speed = 80, pause = 2200) => {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = words[wordIdx % words.length];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length + 1 === current.length) setTimeout(() => setDeleting(true), pause);
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length - 1 === 0) { setDeleting(false); setWordIdx(i => i + 1); }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, wordIdx, words, speed, pause]);
  return text;
};

/* ── floating label input ── */
const FloatingInput = ({ type: initialType, value, onChange, placeholder, icon: Icon, required, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = initialType === 'password';
  const inputType = isPassword ? (showPass ? 'text' : 'password') : initialType;
  const active = focused || value.length > 0;

  return (
    <div className={`login-input-wrap ${active ? 'login-input-active' : ''} ${focused ? 'login-input-focused' : ''}`}>
      <Icon className="login-input-icon" size={16} />
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={active ? placeholder : ''}
        required={required}
        autoComplete={autoComplete}
        className="login-input-field"
      />
      {/* floating label */}
      <span className={`login-input-label ${active ? 'login-label-up' : ''}`}>
        {placeholder}
      </span>
      {/* password toggle */}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPass(p => !p)}
          className="login-pass-toggle"
          tabIndex={-1}
        >
          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  );
};

/* ── main component ── */
const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const [mounted, setMounted]   = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const tagline = useTypewriter([
    'Empowering student wellness.',
    'Early support. Better outcomes.',
    'Mental health, tracked with care.',
  ], 65, 2400);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // ✅ Roles are uppercase Enums from PostgreSQL
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
      setPassword('student123');
    };
  };

  return (
    <div className="login-root app-bg">

      {/* ── left panel (desktop only) ── */}
      <div className={`login-panel-left ${mounted ? 'login-panel-visible' : ''}`}>
        {/* background orb */}
        <div className="login-left-orb" />

        <div className="login-left-content">
          {/* logo */}
          <div className="login-logo-mark">
            <ShieldCheck size={28} className="text-white" />
          </div>

          <h2 className="login-left-title">Well-being<br />Portal</h2>

          {/* typewriter tagline */}
          <p className="login-left-tagline">
            {tagline}<span className="login-cursor">|</span>
          </p>

          {/* feature list */}
          <ul className="login-features">
            {[
              'PHQ-9 clinical assessments',
              'Real-time risk monitoring',
              'Secure student records',
              'Anonymous counseling links',
            ].map((f, i) => (
              <li key={i} className="login-feature-item" style={{ animationDelay: `${300 + i * 100}ms` }}>
                <span className="login-feature-dot" />
                {f}
              </li>
            ))}
          </ul>

          {/* version badge */}
          <div className="login-version-badge">v2.0 · SECURE SESSION</div>
        </div>
      </div>

      {/* ── right panel (form) ── */}
      <div className="login-panel-right">
        <div className={`login-card ${mounted ? 'login-card-visible' : ''}`}>

          {/* header */}
          <div className="login-card-header">
            <div className="login-card-icon">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <h1 className="login-card-title">Sign in</h1>
            <p className="login-card-subtitle">Student Monitoring System</p>
          </div>

          {/* inline error */}
          {error && (
            <div className="login-error-banner">
              <span className="login-error-dot" />
              {error}
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} className="login-form">
            <FloatingInput
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="University email"
              icon={Mail}
              required
              autoComplete="username"
            />

            <FloatingInput
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              icon={Lock}
              required
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="login-submit-btn"
            >
              {isLoading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  <LogIn size={17} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* demo credentials */}
          <div className="login-demo-section">
            <span className="login-demo-label">Quick access</span>
            <div className="login-demo-grid">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="login-demo-btn"
              >
                <span className="login-demo-role">Admin</span>
                <span className="login-demo-email">admin@university.edu</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('student')}
                className="login-demo-btn"
              >
                <span className="login-demo-role">Student</span>
                <span className="login-demo-email">student1@university.edu</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;