/**
 * src/pages/StudentDashboard.jsx
 * Student Personal Dashboard
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// ✅ FIXED IMPORT: Added studentAPI
import { assessmentAPI, studentAPI } from '../services/api';
import { LogOut, RefreshCw, TrendingDown, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user, student, logout } = useAuth();
  const navigate = useNavigate();
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessmentHistory();
  }, []);

  const loadAssessmentHistory = async () => {
    try {
      // ✅ FIXED: Fetch both History and Profile in parallel
      const [historyRes, profileRes] = await Promise.all([
        assessmentAPI.getMyHistory(),
        studentAPI.getMyProfile()
      ]);
      
      setAssessmentHistory(historyRes.assessments);
      // Optional: You could update local student state here if needed
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
      0: "You're doing great! Keep maintaining your healthy habits and positive mindset.",
      1: "Stay connected with friends and family. Consider stress management techniques like meditation or exercise.",
      2: "Please consider speaking with a counselor. Your well-being matters, and support is available.",
      3: "🚨 Immediate support recommended. Please contact campus counseling services today. You're not alone.",
    };
    return messages[score] || "Take care of your mental health.";
  };

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const riskScore = student.currentRiskScore || 0;
  const riskColor = getRiskColor(riskScore);
  const riskLabel = getRiskLabel(riskScore);
  const message = getMotivationalMessage(riskScore);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Mental Health Dashboard</h1>
            <p className="text-sm text-indigo-200">Welcome back, {student.name}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 bg-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-800 transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-6 max-w-5xl">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Current Mental Health Score</h2>
            <div className="text-9xl font-bold mb-4" style={{ color: riskColor }}>
              {riskScore}
            </div>
            <p className="text-3xl font-semibold mb-2" style={{ color: riskColor }}>
              {riskLabel}
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mt-6 max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <StatBox icon={Calendar} label="Last Assessment" value={student.lastAssessmentDate ? format(new Date(student.lastAssessmentDate), 'MMM d, yyyy') : 'Never'} />
            <StatBox icon={BookOpen} label="Course" value={student.course} />
            <StatBox icon={TrendingUp} label="CGPA" value={student.cgpa} />
            <StatBox icon={RefreshCw} label="Total Assessments" value={student.totalAssessments} />
          </div>

          <button onClick={() => navigate('/student/assessment')} className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-3 shadow-md">
            <RefreshCw size={24} />
            {student.totalAssessments > 0 ? 'Update Assessment (PHQ-9)' : 'Take First Assessment (PHQ-9)'}
          </button>
        </div>

        {assessmentHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingDown size={24} className="text-indigo-600" /> Assessment History
            </h3>
            <div className="space-y-3">
              {assessmentHistory.map((assessment, index) => (
                <div
                  // 🔴 FIXED KEY: Use _id because MongoDB uses underscores
                  key={assessment._id || index} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-semibold">Assessment #{assessmentHistory.length - index}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(assessment.createdAt), 'MMMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: getRiskColor(assessment.riskScore) }}>
                      Score: {assessment.riskScore} - {getRiskLabel(assessment.riskScore)}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">Raw Score: {assessment.rawScore}/27</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Understanding Your Score</h3>
            <div className="space-y-3">
                <InfoCard score="0" label="Minimal Depression" desc="You're doing well. Continue healthy habits." color="green" />
                <InfoCard score="1" label="Mild Depression" desc="Consider stress management techniques." color="yellow" />
                <InfoCard score="2" label="Moderate Depression" desc="Please consider speaking with a counselor." color="orange" />
                <InfoCard score="3" label="Severe" desc="Immediate support recommended." color="red" />
            </div>
             <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="font-semibold text-indigo-900 mb-2">📞 Need Help?</p>
                <p className="text-sm text-indigo-800">Campus Counseling: <strong>counseling@university.edu</strong></p>
             </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components to keep JSX clean
const StatBox = ({ icon: Icon, label, value }) => (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
        <Icon className="mx-auto mb-2 text-indigo-600" size={24} />
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
    </div>
);

const InfoCard = ({ score, label, desc, color }) => {
    const colors = {
        green: 'bg-green-500 text-green-800 bg-green-50',
        yellow: 'bg-yellow-500 text-yellow-800 bg-yellow-50',
        orange: 'bg-orange-500 text-orange-800 bg-orange-50',
        red: 'bg-red-500 text-red-800 bg-red-50'
    };
    const circleColor = colors[color].split(' ')[0];
    const textColor = colors[color].split(' ')[1];
    const bgColor = colors[color].split(' ')[2];

    return (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${bgColor}`}>
            <div className={`w-10 h-10 ${circleColor} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                {score}
            </div>
            <div className="flex-1">
                <p className={`font-semibold ${textColor}`}>{label}</p>
                <p className={`text-sm opacity-80 ${textColor}`}>{desc}</p>
            </div>
        </div>
    );
};

export default StudentDashboard;