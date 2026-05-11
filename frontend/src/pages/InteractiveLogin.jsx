import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

/* ── React Bits Inspired Aurora Background ── */
const AuroraBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#0a0a0a]">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
    <motion.div 
      animate={{ x: [0, 100, -50, 0], y: [0, -50, 100, 0], scale: [1, 1.2, 0.9, 1] }} 
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-40 blur-[100px] mix-blend-screen bg-indigo-600"
    />
    <motion.div 
      animate={{ x: [0, -100, 50, 0], y: [0, 50, -100, 0], scale: [1, 1.5, 0.8, 1] }} 
      transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
      className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-30 blur-[120px] mix-blend-screen bg-pink-600"
    />
    <motion.div 
      animate={{ x: [0, 50, -50, 0], y: [0, 100, -50, 0], scale: [1, 0.8, 1.1, 1] }} 
      transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 4 }}
      className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full opacity-30 blur-[100px] mix-blend-screen bg-violet-600"
    />
  </div>
);

/* ── tiny typewriter hook ── */
const useTypewriter = (words, speed = 65, pause = 2400) => {
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

/* ── framer motion floating input ── */
const FloatingInput = ({ type: initialType, value, onChange, placeholder, icon: Icon, required, autoComplete, delay }) => {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = initialType === 'password';
  const inputType = isPassword ? (showPass ? 'text' : 'password') : initialType;
  const active = focused || value.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`relative rounded-xl border transition-all duration-300 ${focused ? 'border-indigo-400 bg-white/10 ring-2 ring-indigo-500/20' : 'border-white/20 bg-white/5'} overflow-hidden`}
    >
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon size={18} className={focused ? 'text-indigo-400' : ''} />
      </div>
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        autoComplete={autoComplete}
        className="w-full bg-transparent px-11 py-4 text-white placeholder-transparent tracking-wide outline-none focus:ring-0"
        placeholder={placeholder}
      />
      <span 
        className={`absolute left-11 transition-all duration-300 pointer-events-none text-gray-400 ${active ? 'top-2 text-[10px] uppercase tracking-wider font-semibold text-indigo-300' : 'top-1/2 -translate-y-1/2 text-sm'}`}
      >
        {placeholder}
      </span>
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPass(p => !p)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          tabIndex={-1}
        >
          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </motion.div>
  );
};

/* ── main component ── */
const InteractiveLogin = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errorBanner, setErrorBanner] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // AuthContext

  const tagline = useTypewriter([
    'Empowering student wellness.',
    'Early support. Better outcomes.',
    'Mental health, tracked with care.',
  ]);

  // TanStack Query Mutation replacing previous raw state
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      // Wrapper to hook into tanstack logic while preserving AuthContext's state mgmt
      const result = await login(email, password);
      if (!result.success) throw new Error(result.error || 'Invalid credentials.');
      return result;
    },
    onSuccess: (data) => {
      if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    },
    onError: (err) => {
      setErrorBanner(err.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorBanner('');
    loginMutation.mutate({ email, password });
  };

  const fillDemoCredentials = (role) => {
    setErrorBanner('');
    if (role === 'admin') {
      setEmail('admin@university.edu');
      setPassword('admin123');
    } else {
      setEmail('student1@university.edu');
      setPassword('Welcome123');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      <AuroraBackground />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-16">
        
        {/* ── left text panel ── */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-white space-y-8"
        >
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mb-6">
            <ShieldCheck size={36} className="text-indigo-400" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Well-being <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">Portal</span>
          </h1>
          <p className="text-xl lg:text-2xl font-light text-gray-300 h-8">
            {tagline}<motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="pl-1 text-indigo-400">|</motion.span>
          </p>

          <ul className="space-y-4 pt-4">
            {['PHQ-9 clinical assessments', 'Real-time risk monitoring', 'Secure student records', 'Anonymous counseling links'].map((feature, idx) => (
              <motion.li 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.15 }}
                className="flex items-center space-x-3 text-gray-400 text-lg"
              >
                <Zap size={18} className="text-pink-400" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* ── right form panel ── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Top decorative glow inside card */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50" />
            
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Secure Sign In</h2>
              <p className="text-gray-400">Access your dashboard</p>
            </div>

            <AnimatePresence>
              {errorBanner && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm text-center backdrop-blur-sm">
                    {errorBanner}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FloatingInput
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorBanner(''); }}
                placeholder="University email"
                icon={Mail}
                required
                autoComplete="username"
                delay={0.4}
              />

              <FloatingInput
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorBanner(''); }}
                placeholder="Password"
                icon={Lock}
                required
                autoComplete="current-password"
                delay={0.5}
              />

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loginMutation.isPending || !email || !password}
                className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white rounded-xl font-bold tracking-wide shadow-lg Disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden transition-all"
              >
                {loginMutation.isPending ? (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full mx-auto"
                  />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                    Connect securely
                  </span>
                )}
              </motion.button>
            </form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 pt-8 border-t border-white/10"
            >
              <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-4">Demo Access</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('admin')}
                  className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm transition-all hover:border-indigo-400/50 flex flex-col items-center"
                >
                  <span className="font-semibold mb-1 text-white">Admin</span>
                  <span className="text-[10px] text-gray-500 truncate w-full text-center">admin@univ...</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('student')}
                  className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm transition-all hover:border-pink-400/50 flex flex-col items-center"
                >
                  <span className="font-semibold mb-1 text-white">Student</span>
                  <span className="text-[10px] text-gray-500 truncate w-full text-center">student1@univ...</span>
                </button>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InteractiveLogin;
