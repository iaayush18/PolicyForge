import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assessmentAPI, studentAPI } from '../services/api';
import { LogOut, RefreshCw, Activity, Calendar, Zap, Heart } from 'lucide-react';
import { format } from 'date-fns';

const RiskRing = ({ score, color }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const fraction = (score / 3);
  const dashoffset = circumference * (1 - fraction);

  return (
    <div className="relative inline-flex items-center justify-center p-6 rounded-full bg-slate-800/50 border border-slate-700">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <circle cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashoffset} transform="rotate(-90 65 65)" style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.19, 1, 0.22, 1)', filter: `drop-shadow(0 0 10px ${color}55)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black italic text-white" style={{ color }}>{score}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">LEVEL</span>
      </div>
    </div>
  );
};

const VibeStat = ({ icon: Icon, label, value }) => (
  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 hover:bg-slate-700 transition-colors shadow-sm">
    <div className="flex items-center gap-2 mb-2 text-slate-400">
      <Icon size={14} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-xl font-bold text-white">{value ?? '—'}</p>
  </div>
);

const StudentDashboard = () => {
  const { student, logout, updateStudentProfile } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hRes, pRes] = await Promise.all([assessmentAPI.getMyHistory(), studentAPI.getMyProfile()]);
        setHistory(hRes.assessments || hRes.data || []);
        if (updateStudentProfile && pRes) updateStudentProfile(pRes.student || pRes.data || pRes);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const getRiskColor = (s) => ({ 0: '#10b981', 1: '#06b6d4', 2: '#f59e0b', 3: '#ef4444' }[s] || '#94a3b8');
  const getRiskLabel = (s) => ({ 0: 'OPTIMAL', 1: 'STABLE', 2: 'MODERATE', 3: 'CRITICAL' }[s] || 'UNKNOWN');

  if (loading || !student) return <div className="app-bg min-h-screen flex items-center justify-center font-mono text-cyan-400">SYNCING DATA...</div>;

  const riskColor = getRiskColor(student.currentRiskScore || 0);

  return (
    <div className="min-h-screen app-bg pb-20">
      <nav className="vibe-nav">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 text-white flex items-center justify-center rounded-xl font-black italic">W</div>
            <h1 className="text-lg text-white">WELLNESS<span className="text-cyan-400">VIBE</span></h1>
          </div>
          <button onClick={logout} className="vibe-btn-secondary text-xs flex items-center gap-2 text-slate-300"><LogOut size={14}/> EXIT</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-10 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Hello, {student.name}</h2>
          <p className="text-slate-400 text-sm font-mono mt-1">ID: {student.studentId} {student.course ? `• ${student.course}` : ''}</p>
        </div>
        <div className="glass-strong p-10 flex flex-col md:flex-row items-center gap-12">
          <RiskRing score={student.currentRiskScore || 0} color={riskColor} />
          <div className="flex-1 w-full space-y-6 text-center md:text-left">
            <div>
              <p className="text-cyan-400 font-mono text-xs mb-2 tracking-[0.2em] uppercase">Status Analysis</p>
              <h2 className="text-5xl mb-2 text-white">{getRiskLabel(student.currentRiskScore || 0)}</h2>
              <p className="text-slate-400 max-w-lg">Current data suggests your wellness levels are within the {getRiskLabel(student.currentRiskScore || 0).toLowerCase()} range.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <VibeStat icon={Calendar} label="Last Scan" value={student.lastAssessmentDate ? format(new Date(student.lastAssessmentDate), 'MMM d') : '—'} />
              <VibeStat icon={Zap} label="Activity" value={student.totalAssessments} />
              <VibeStat icon={Heart} label="CGPA" value={student.cgpa} />
              <VibeStat icon={Activity} label="Risk" value={student.currentRiskScore} />
            </div>
            <button onClick={() => navigate('/student/assessment')} className="vibe-btn-primary w-full md:w-auto"><RefreshCw size={18}/> Update Assessment</button>
          </div>
        </div>

        <div className="glass p-8">
          <h3 className="mb-6 flex items-center gap-3 text-white"><Activity size={20} className="text-cyan-400" /> Activity History</h3>
          <div className="space-y-3">
            {history.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700 shadow-sm hover:border-cyan-500/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: getRiskColor(a.riskScore) }} />
                  <div>
                    <p className="font-bold text-sm text-white">LEVEL {a.riskScore} — {getRiskLabel(a.riskScore)}</p>
                    <p className="font-mono text-[10px] text-slate-400 uppercase">{format(new Date(a.createdAt), 'MMM d, yyyy | p')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;