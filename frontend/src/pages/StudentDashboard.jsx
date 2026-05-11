/**
 * src/pages/StudentDashboard.jsx
 * Campus Wellness Platform — Student View
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { wellnessAPI, studentAPI } from '../services/api';
import { LogOut, RefreshCw, TrendingDown, TrendingUp, Calendar, BookOpen, Activity, Zap, Brain, Home, Briefcase, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

// ── Wellness score → status ────────────────────────────────────────────────
const getWellnessStatus = (score) => {
  if (score <= 20) return { label: 'Excellent',        color: '#10B981' };
  if (score <= 40) return { label: 'Stable',           color: '#34D399' };
  if (score <= 60) return { label: 'Moderate Concern', color: '#FBBF24' };
  if (score <= 80) return { label: 'High Stress',      color: '#F97316' };
  return             { label: 'Critical',              color: '#EF4444' };
};

const getMotivationalMessage = (score) => {
  if (score <= 20) return "You're thriving! Keep maintaining your healthy habits.";
  if (score <= 40) return "You're doing well. Stay connected and keep up the great work.";
  if (score <= 60) return "Things feel a bit tough. Consider reaching out to campus support.";
  if (score <= 80) return "You're under significant pressure. Please talk to a counselor.";
  return "🚨 Immediate support recommended. Please contact counseling today.";
};

// ── WellnessRing (0–100 score) ────────────────────────────────────────────
const WellnessRing = ({ score, color }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const fraction = score / 100;
  const dashoffset = circumference * fraction; // high score = more ring filled = more concern
  const displayOffset = circumference - (circumference * fraction); // standard fill

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="risk-ring-svg">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={displayOffset}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)', filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black leading-none" style={{ color, letterSpacing: '-0.05em', textShadow: `0 0 30px ${color}` }}>{score}</span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-1">/ 100</span>
      </div>
    </div>
  );
};

// ── Domain mini cards ────────────────────────────────────────────────────
const DomainCard = ({ icon: Icon, label, score, color, delay = 0 }) => (
  <div className="stat-box-v2 flex flex-col gap-2" style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-center gap-1.5">
      <Icon size={13} style={{ color }} />
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</p>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score ?? 0}%`, background: color, boxShadow: `0 0 6px ${color}60` }} />
      </div>
      <span className="text-xs font-black" style={{ color }}>{score ?? '—'}</span>
    </div>
  </div>
);

// ── History item ─────────────────────────────────────────────────────────
const HistoryItem = ({ assessment, index, total }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const { label, color } = getWellnessStatus(assessment.finalWellnessScore || 0);

  return (
    <div ref={ref} className={`history-item ${visible ? 'history-item-visible' : ''}`} style={{ transitionDelay: `${index * 50}ms` }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
          style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}>
          {Math.round(assessment.finalWellnessScore || 0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-white/90">Check-in #{total - index}</p>
          <p className="text-[10px] text-white/35 font-mono mt-0.5">
            {format(new Date(assessment.createdAt), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"
        style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}>
        {label}
      </span>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { student, logout, updateStudentProfile } = useAuth();
  const navigate = useNavigate();
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [historyRes, profileRes] = await Promise.all([
        wellnessAPI.getMyHistory(),
        studentAPI.getMyProfile(),
      ]);

      const history = historyRes.assessments || historyRes.data || [];
      setAssessmentHistory(history);
      setLatestAssessment(history[0] || null);

      if (updateStudentProfile && profileRes) {
        updateStudentProfile(profileRes.student || profileRes.data || profileRes);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center app-bg">
        <div className="glass p-10 text-center">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-t-violet-400 border-r-cyan-400 animate-spin" />
            <Activity className="absolute inset-0 m-auto text-white/50" size={20} />
          </div>
          <p className="text-white/60 text-sm font-medium">Loading your wellness dashboard…</p>
        </div>
      </div>
    );
  }

  const wellnessScore = Math.round(student.currentWellnessScore || 0);
  const { label: wellnessLabel, color: wellnessColor } = getWellnessStatus(wellnessScore);

  return (
    <div className="min-h-screen app-bg text-white pb-16">
      {/* Nav */}
      <nav className="glass sticky top-0 z-50 px-6 py-3 rounded-none border-b-0 shadow-2xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${wellnessColor}aa, ${wellnessColor}55)`, boxShadow: `0 0 14px ${wellnessColor}40` }}>
              <Activity size={15} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none">Campus Wellness Portal</h1>
              <p className="text-[10px] text-white/40 mt-0.5">Welcome back, <span className="text-white/70 font-semibold">{student.name}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/student/support')}
              className="flex items-center gap-2 bg-violet-500/15 hover:bg-violet-500/25 px-3 py-1.5 rounded-xl transition border border-violet-500/30 text-sm font-medium text-violet-300">
              <MessageCircle size={14} /> Support
            </button>
            <button onClick={logout} className="flex items-center gap-2 bg-white/8 hover:bg-white/14 px-4 py-1.5 rounded-xl transition border border-white/12 text-sm font-medium">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-6">
        {/* Hero card */}
        <div className="glass-strong p-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${wellnessColor}18 0%, transparent 70%)` }} />
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            {/* Ring */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <WellnessRing score={wellnessScore} color={wellnessColor} />
              <div className="text-center">
                <p className="text-sm font-bold" style={{ color: wellnessColor }}>{wellnessLabel}</p>
                <p className="text-[10px] text-white/35 font-black uppercase tracking-widest mt-1">Wellness Index</p>
              </div>
            </div>

            <div className="flex-1 w-full">
              {/* Motivational message */}
              <div className="rounded-2xl p-5 mb-5" style={{ background: `${wellnessColor}10`, border: `1px solid ${wellnessColor}30` }}>
                <p className="text-sm text-white/85 leading-relaxed italic">"{getMotivationalMessage(wellnessScore)}"</p>
              </div>

              {/* Domain scores from latest assessment */}
              {latestAssessment ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
                  <DomainCard icon={Brain} label="Mental" score={Math.round(latestAssessment.mentalScore)} color="#8b78ff" delay={0} />
                  <DomainCard icon={BookOpen} label="Academic" score={Math.round(latestAssessment.academicScore)} color="#22d3ee" delay={60} />
                  <DomainCard icon={Home} label="Hostel" score={Math.round(latestAssessment.hostelScore)} color="#34D399" delay={120} />
                  <DomainCard icon={Briefcase} label="Placement" score={Math.round(latestAssessment.placementScore)} color="#FBBF24" delay={180} />
                  <DomainCard icon={Zap} label="Lifestyle" score={Math.round(latestAssessment.lifestyleScore)} color="#F97316" delay={240} />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="stat-box-v2"><p className="stat-box-label">Last Check-in</p><p className="stat-box-value">Never</p></div>
                  <div className="stat-box-v2"><p className="stat-box-label">Course</p><p className="stat-box-value">{student.course}</p></div>
                  <div className="stat-box-v2"><p className="stat-box-label">CGPA</p><p className="stat-box-value">{student.cgpa}</p></div>
                  <div className="stat-box-v2"><p className="stat-box-label">Check-ins</p><p className="stat-box-value">{student.totalAssessments}</p></div>
                </div>
              )}

              {/* Stat row */}
              <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                {[
                  { icon: Calendar, label: 'Last Check-in', value: student.lastAssessmentDate ? format(new Date(student.lastAssessmentDate), 'MMM d') : 'Never' },
                  { icon: BookOpen, label: 'Course', value: student.course?.split(' ').slice(-1)[0] },
                  { icon: TrendingUp, label: 'CGPA', value: student.cgpa },
                  { icon: Activity, label: 'Check-ins', value: student.totalAssessments },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-2.5 border border-white/8">
                    <Icon size={12} className="mx-auto text-white/40 mb-1" />
                    <p className="text-[8px] text-white/35 font-bold uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-sm font-black text-white/90">{value ?? '—'}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/student/assessment')}
                className="w-full py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #fff 0%, #e8e4ff 100%)', color: '#2d1b8f', boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
                <RefreshCw size={17} />
                {student.totalAssessments > 0 ? 'Update My Wellness Assessment' : 'Take First Wellness Assessment'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* History */}
          <div className="lg:col-span-2">
            <div className="glass p-6 h-full">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black flex items-center gap-2"><TrendingDown size={18} className="text-white/60" /> Wellness History</h3>
                <span className="text-[10px] font-mono text-white/30">{assessmentHistory.length} records</span>
              </div>
              {assessmentHistory.length > 0 ? (
                <div className="space-y-2">
                  {assessmentHistory.map((a, i) => (
                    <HistoryItem key={a.id || i} assessment={a} index={i} total={assessmentHistory.length} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-white/25">
                  <Activity size={32} className="mb-3 opacity-40" />
                  <p className="text-sm">No assessments yet.</p>
                  <p className="text-xs mt-1">Take your first wellness check-in above.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Wellness Guide */}
            <div className="glass p-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4">Student Wellness Index</h3>
              <div className="space-y-2">
                {[
                  { label: 'Excellent', range: '0–20', color: '#10B981' },
                  { label: 'Stable', range: '21–40', color: '#34D399' },
                  { label: 'Moderate Concern', range: '41–60', color: '#FBBF24' },
                  { label: 'High Stress', range: '61–80', color: '#F97316' },
                  { label: 'Critical', range: '81–100', color: '#EF4444' },
                ].map(({ label, range, color }) => (
                  <div key={label} className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                    style={{ background: wellnessLabel === label ? `${color}12` : 'rgba(255,255,255,0.03)', border: `1px solid ${wellnessLabel === label ? color + '35' : 'rgba(255,255,255,0.06)'}` }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <p className="text-xs font-semibold text-white/75 flex-1">{label}</p>
                    <span className="text-[9px] font-mono text-white/30">{range}</span>
                    {wellnessLabel === label && <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color, background: `${color}20` }}>You</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Support CTA */}
            <div className="glass p-5" style={{ border: '1px solid rgba(139,120,255,0.2)', background: 'rgba(139,120,255,0.06)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-violet-300/70 mb-2">Need Support?</p>
              <p className="text-xs text-white/50 mb-4 leading-relaxed">Confidential help is always available. Submit a support request and our team will respond within 24 hours.</p>
              <button onClick={() => navigate('/student/support')}
                className="w-full text-center text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
                style={{ background: 'rgba(139,120,255,0.15)', border: '1px solid rgba(139,120,255,0.3)', color: '#a78bfa' }}>
                Request Support →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;