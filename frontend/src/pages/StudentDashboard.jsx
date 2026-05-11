/**
 * src/pages/StudentDashboard.jsx
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assessmentAPI, studentAPI } from '../services/api';
import { LogOut, RefreshCw, TrendingDown, TrendingUp, Calendar, BookOpen, Activity, Heart } from 'lucide-react';
import { format } from 'date-fns';

const RiskRing = ({ score, color }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const fraction = score / 100;
  const dashoffset = circumference * fraction; // high score = more ring filled = more concern
  const displayOffset = circumference - (circumference * fraction); // standard fill

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="risk-ring-svg">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashoffset} transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)', filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black leading-none" style={{ color, letterSpacing: '-0.05em', textShadow: `0 0 30px ${color}` }}>{score}</span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-1">/ 3</span>
      </div>
    </div>
  );
};

const StatBox = ({ icon: Icon, label, value, delay = 0 }) => (
  <div className="stat-box-v2" style={{ animationDelay: `${delay}ms` }}>
    <div className="stat-box-icon"><Icon size={16} /></div>
    <p className="stat-box-label">{label}</p>
    <p className="stat-box-value">{value ?? '—'}</p>
  </div>
);

const HistoryItem = ({ assessment, index, total, getRiskColor, getRiskLabel }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`history-item ${visible ? 'history-item-visible' : ''}`} style={{ transitionDelay: `${index * 50}ms` }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: `${getRiskColor(assessment.riskScore)}22`, border: `1px solid ${getRiskColor(assessment.riskScore)}44`, color: getRiskColor(assessment.riskScore) }}>
          {assessment.riskScore}
        </div>
        <div>
          <p className="text-sm font-semibold text-white/90">Check-in #{total - index}</p>
          <p className="text-[10px] text-white/35 font-mono mt-0.5">
            {format(new Date(assessment.createdAt), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg" style={{ color: getRiskColor(assessment.riskScore), background: `${getRiskColor(assessment.riskScore)}18`, border: `1px solid ${getRiskColor(assessment.riskScore)}40` }}>
        {getRiskLabel(assessment.riskScore)}
      </span>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { student, logout, updateStudentProfile } = useAuth();
  const navigate = useNavigate();
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAssessmentHistory(); }, []);

  const loadAssessmentHistory = async () => {
    try {
      const [historyRes, profileRes] = await Promise.all([
        assessmentAPI.getMyHistory(),
        studentAPI.getMyProfile(),
      ]);
      
      // FIX: Robust API property checks based on Express backend patterns
      setAssessmentHistory(historyRes.assessments || historyRes.data || []);
      
      if (updateStudentProfile && profileRes) {
        updateStudentProfile(profileRes.student || profileRes.data || profileRes);
      }
    } catch (error) {
      console.error('Error loading assessment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => ({ 0: '#10B981', 1: '#FBBF24', 2: '#F97316', 3: '#EF4444' }[score] || '#6B7280');
  const getRiskLabel = (score) => ({ 0: 'Minimal Depression', 1: 'Mild Depression', 2: 'Moderate Depression', 3: 'Severe' }[score] || 'Unknown');
  const getMotivationalMessage = (score) => ({
    0: "You're doing great! Keep maintaining your healthy habits.",
    1: "Stay connected with friends. Consider stress management techniques.",
    2: "Please consider speaking with a counselor. Support is available.",
    3: "🚨 Immediate support recommended. Please contact counseling today.",
  }[score] || "Take care of your mental health.");

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center app-bg">
        <div className="glass p-10 text-center">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-t-violet-400 border-r-cyan-400 animate-spin" />
            <Heart className="absolute inset-0 m-auto text-white/50" size={20} />
          </div>
          <p className="text-white/60 text-sm font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const riskScore = student.currentWellnessScore ?? student.currentRiskScore ?? 0;
  const riskColor = getRiskColor(riskScore);

  return (
    <div className="min-h-screen app-bg text-white pb-16">
      <nav className="glass sticky top-0 z-50 px-6 py-3 rounded-none border-b-0 shadow-2xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${riskColor}aa, ${riskColor}55)`, boxShadow: `0 0 14px ${riskColor}40` }}>
              <Heart size={15} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none">Mental Health Portal</h1>
              <p className="text-[10px] text-white/40 mt-0.5">Welcome back, <span className="text-white/70 font-semibold">{student.name}</span></p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 bg-white/8 hover:bg-white/14 px-4 py-1.5 rounded-xl transition border border-white/12 text-sm font-medium">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-6">
        <div className="glass-strong p-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${riskColor}18 0%, transparent 70%)` }} />
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <RiskRing score={riskScore} color={riskColor} />
              <div className="text-center">
                <p className="text-sm font-bold" style={{ color: riskColor }}>{getRiskLabel(riskScore)}</p>
                <p className="text-[10px] text-white/35 font-black uppercase tracking-widest mt-1">Current Risk Score</p>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="rounded-2xl p-5 mb-6" style={{ background: `${riskColor}10`, border: `1px solid ${riskColor}30` }}>
                <p className="text-sm text-white/85 leading-relaxed italic">"{getMotivationalMessage(riskScore)}"</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatBox icon={Calendar} label="Last Checkup" value={student.lastAssessmentDate ? format(new Date(student.lastAssessmentDate), 'MMM d') : 'Never'} delay={0} />
                <StatBox icon={BookOpen} label="Course" value={student.course} delay={60} />
                <StatBox icon={TrendingUp} label="CGPA" value={student.cgpa} delay={120} />
                <StatBox icon={Activity} label="Check-ins" value={student.totalAssessments} delay={180} />
              </div>
              <button onClick={() => navigate('/student/assessment')} className="w-full mt-5 py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #fff 0%, #e8e4ff 100%)', color: '#2d1b8f', boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
                <RefreshCw size={17} />
                {student.totalAssessments > 0 ? 'Update My Assessment' : 'Take First Assessment'}
              </button>
            </div>
            <button onClick={() => navigate('/student/assessment')} className="vibe-btn-primary w-full md:w-auto"><RefreshCw size={18}/> Update Assessment</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass p-6 h-full">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black flex items-center gap-2"><TrendingDown size={18} className="text-white/60" /> Assessment History</h3>
                <span className="text-[10px] font-mono text-white/30">{assessmentHistory.length} records</span>
              </div>
              {assessmentHistory.length > 0 ? (
                <div className="space-y-2">
                  {assessmentHistory.map((a, i) => (
                    <HistoryItem key={a._id || i} assessment={a} index={i} total={assessmentHistory.length} getRiskColor={getRiskColor} getRiskLabel={getRiskLabel} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-white/25">
                  <Activity size={32} className="mb-3 opacity-40" />
                  <p className="text-sm">No assessments yet.</p>
                  <p className="text-xs mt-1">Take your first check-in above.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass p-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4">Risk Guide</h3>
              <div className="space-y-2">
                {[{ score: 0, label: 'Minimal', color: '#10B981' }, { score: 1, label: 'Mild', color: '#FBBF24' }, { score: 2, label: 'Moderate', color: '#F97316' }, { score: 3, label: 'Severe', color: '#EF4444' }].map(({ score, label, color }) => (
                  <div key={score} className="flex items-center gap-3 p-2.5 rounded-xl transition-all" style={{ background: riskScore === score ? `${color}12` : 'rgba(255,255,255,0.03)', border: `1px solid ${riskScore === score ? color + '35' : 'rgba(255,255,255,0.06)'}` }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs flex-shrink-0" style={{ background: `${color}22`, color }}>{score}</div>
                    <p className="text-xs font-semibold text-white/75">{label}</p>
                    {riskScore === score && <span className="ml-auto text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color, background: `${color}20` }}>You</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="glass p-5" style={{ border: '1px solid rgba(139,120,255,0.2)', background: 'rgba(139,120,255,0.06)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-violet-300/70 mb-2">Need Support?</p>
              <p className="text-xs text-white/50 mb-4 leading-relaxed">Confidential help is always available. You are not alone.</p>
              <a href="mailto:counseling@university.edu" className="block text-center text-xs font-bold py-2.5 px-4 rounded-xl transition-all" style={{ background: 'rgba(139,120,255,0.15)', border: '1px solid rgba(139,120,255,0.3)', color: '#a78bfa' }}>counseling@university.edu</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;