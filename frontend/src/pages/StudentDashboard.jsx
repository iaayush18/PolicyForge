/**
 * src/pages/StudentDashboard.jsx 
 * Optimized with Glassmorphism
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assessmentAPI, studentAPI } from '../services/api';
import { LogOut, RefreshCw, TrendingDown, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessmentHistory();
  }, []);

  const loadAssessmentHistory = async () => {
    try {
      const [historyRes] = await Promise.all([
        assessmentAPI.getMyHistory(),
        studentAPI.getMyProfile()
      ]);
      setAssessmentHistory(historyRes.assessments);
    } catch (error) {
      console.error('Error loading assessment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    const colors = { 0: '#10B981', 1: '#FBBF24', 2: '#F97316', 3: '#EF4444' };
    return colors[score] || '#6B7280';
  };

  const getRiskLabel = (score) => {
    const labels = { 0: 'Minimal Depression', 1: 'Mild Depression', 2: 'Moderate Depression', 3: 'Moderately Severe/Severe' };
    return labels[score] || 'Unknown';
  };

  const getMotivationalMessage = (score) => {
    const messages = {
      0: "You're doing great! Keep maintaining your healthy habits.",
      1: "Stay connected with friends. Consider stress management techniques.",
      2: "Please consider speaking with a counselor. Support is available.",
      3: "🚨 Immediate support recommended. Please contact counseling today.",
    };
    return messages[score] || "Take care of your mental health.";
  };

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center app-bg">
        <div className="glass p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const riskScore = student.currentRiskScore || 0;

  return (
    <div className="min-h-screen app-bg text-white pb-12">
      {/* NAVBAR */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 mb-8 border-b-0 rounded-none shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Mental Health Portal</h1>
            <p className="text-xs text-indigo-100 opacity-80">Welcome, {student.name}</p>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/20"
          >
            <LogOut size={18} /> <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* MAIN SCORE CARD */}
        <div className="glass-strong p-8 mb-8 glass-hover">
          <div className="text-center mb-8">
            <h2 className="text-lg uppercase tracking-widest text-indigo-100 font-semibold mb-2">Current Risk Score</h2>
            <div className="text-9xl font-black drop-shadow-2xl" style={{ color: getRiskColor(riskScore) }}>
              {riskScore}
            </div>
            <p className="text-3xl font-bold mt-2" style={{ color: getRiskColor(riskScore) }}>
              {getRiskLabel(riskScore)}
            </p>
            <div className="glass bg-white/5 border-white/10 rounded-2xl p-6 mt-8 max-w-2xl mx-auto shadow-inner">
              <p className="text-lg text-white leading-relaxed italic">"{getMotivationalMessage(riskScore)}"</p>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatBox icon={Calendar} label="Last Checkup" value={student.lastAssessmentDate ? format(new Date(student.lastAssessmentDate), 'MMM d, yy') : 'N/A'} />
            <StatBox icon={BookOpen} label="Course" value={student.course} />
            <StatBox icon={TrendingUp} label="CGPA" value={student.cgpa} />
            <StatBox icon={RefreshCw} label="Assessments" value={student.totalAssessments} />
          </div>

          <button 
            onClick={() => navigate('/student/assessment')} 
            className="w-full mt-8 bg-white text-indigo-700 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-3"
          >
            <RefreshCw size={22} />
            {student.totalAssessments > 0 ? 'Update Assessment' : 'Take First Assessment'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* HISTORY SECTION */}
          <div className="lg:col-span-2">
            {assessmentHistory.length > 0 && (
              <div className="glass p-6 h-full">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <TrendingDown size={24} /> Assessment History
                </h3>
                <div className="space-y-4">
                  {assessmentHistory.map((assessment, index) => (
                    <div
                      key={assessment._id || index} 
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-indigo-100">Round #{assessmentHistory.length - index}</p>
                        <p className="text-xs opacity-60">
                          {format(new Date(assessment.createdAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-white" style={{ backgroundColor: getRiskColor(assessment.riskScore) }}>
                          {getRiskLabel(assessment.riskScore)}
                        </span>
                        <p className="text-sm font-medium mt-1">Score: {assessment.riskScore}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* HELP & INFO */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass p-6">
                <h3 className="text-lg font-bold mb-4">Risk Guide</h3>
                <div className="space-y-3">
                    <InfoCard score="0" label="Minimal" color="#10B981" />
                    <InfoCard score="1" label="Mild" color="#FBBF24" />
                    <InfoCard score="2" label="Moderate" color="#F97316" />
                    <InfoCard score="3" label="Severe" color="#EF4444" />
                </div>
                <div className="mt-8 p-4 bg-indigo-900/40 border border-white/10 rounded-2xl">
                    <p className="font-bold text-sm mb-1 uppercase tracking-tighter">📞 Need Assistance?</p>
                    <p className="text-xs text-indigo-100 opacity-80 mb-3">Your privacy is our priority.</p>
                    <a href="mailto:help@uni.edu" className="text-sm font-semibold underline block">counseling@university.edu</a>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- HELPER COMPONENTS --- */

const StatBox = ({ icon: Icon, label, value }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
        <Icon className="mx-auto mb-2 text-indigo-200 opacity-80" size={20} />
        <p className="text-[10px] uppercase tracking-widest text-indigo-100 opacity-60 mb-1">{label}</p>
        <p className="text-md font-bold truncate">{value}</p>
    </div>
);

const InfoCard = ({ score, label, color }) => (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: color }}>
            {score}
        </div>
        <p className="text-sm font-medium text-indigo-50">{label}</p>
    </div>
);

export default StudentDashboard;