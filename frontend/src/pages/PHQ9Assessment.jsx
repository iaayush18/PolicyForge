/**
 * src/pages/PHQ9Assessment.jsx
 * Migrated for Prisma & Glassmorphism
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assessmentAPI, studentAPI } from '../services/api';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PHQ9_QUESTIONS = [
  { key: 'q1_interest', text: 'Little interest or pleasure in doing things' },
  { key: 'q2_depressed', text: 'Feeling down, depressed, or hopeless' },
  { key: 'q3_sleep', text: 'Trouble falling or staying asleep, or sleeping too much' },
  { key: 'q4_energy', text: 'Feeling tired or having little energy' },
  { key: 'q5_appetite', text: 'Poor appetite or overeating' },
  { key: 'q6_failure', text: 'Feeling bad about yourself — or that you are a failure' },
  { key: 'q7_concentration', text: 'Trouble concentrating on things (reading, etc.)' },
  { key: 'q8_movement', text: 'Moving or speaking noticeably slowly or being too restless' },
  { key: 'q9_suicidal', text: 'Thoughts that you would be better off dead' },
];

const FREQUENCY_OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

const PHQ9Assessment = () => {
  const navigate = useNavigate();
  const { updateStudentProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState({
    q1_interest: null, q2_depressed: null, q3_sleep: null,
    q4_energy: null, q5_appetite: null, q6_failure: null,
    q7_concentration: null, q8_movement: null, q9_suicidal: null,
  });
  const [notes, setNotes] = useState('');

  const handleAnswerChange = (questionKey, value) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
  };

  const calculateTotalScore = () => Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);
  const isFormComplete = () => Object.values(answers).every((val) => val !== null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete()) {
      toast.error('Please answer all questions');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Submit Assessment to Prisma Backend
      const response = await assessmentAPI.submit({
        phq9Answers: answers,
        notes: notes.trim() || undefined,
      });

      // 2. Fetch fresh profile and update context
      const studentResponse = await studentAPI.getMyProfile();
      updateStudentProfile(studentResponse.student);

      toast.success('Assessment complete!');
      
      const { riskScore, riskLevel } = response.assessment;
      toast.success(`Result: ${riskLevel}`, { duration: 5000 });
      
      navigate('/student');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (Object.values(answers).filter((v) => v !== null).length / 9) * 100;

  return (
    <div className="min-h-screen app-bg text-white pb-12">
      <nav className="glass sticky top-0 z-50 p-4 mb-8 rounded-none border-b-0 shadow-xl">
        <div className="container mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/student')} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition border border-white/20">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">PHQ-9 Health Check</h1>
            <p className="text-[10px] text-indigo-100 opacity-60 uppercase tracking-widest font-bold">Standard Clinical Assessment</p>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4 max-w-4xl">
        {/* Progress Card */}
        <div className="glass p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-100 opacity-80">Completion Progress</h3>
            <span className="text-lg font-black">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/5 border border-white/5 rounded-full h-3 overflow-hidden">
            <div className="bg-white h-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong p-8">
          <div className="bg-indigo-900/30 border border-white/10 rounded-2xl p-6 mb-10">
            <div className="flex gap-4">
              <AlertCircle className="text-indigo-200" size={24} />
              <p className="text-sm text-indigo-100/90 leading-relaxed italic">
                "Over the last 2 weeks, how often have you been bothered by these problems?"
              </p>
            </div>
          </div>

          <div className="space-y-12">
            {PHQ9_QUESTIONS.map((question, index) => (
              <div key={question.key} className="border-b border-white/5 pb-10 last:border-b-0">
                <p className="font-bold text-xl mb-6 text-white leading-snug">
                  <span className="text-indigo-300 mr-2 text-sm opacity-60">0{index + 1}.</span> {question.text}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <label key={option.value} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                        answers[question.key] === option.value
                          ? 'bg-white text-indigo-900 border-white shadow-xl scale-[1.02]'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}>
                      <input type="radio" name={question.key} checked={answers[question.key] === option.value} onChange={() => handleAnswerChange(question.key, option.value)} className="hidden" required />
                      <span className="font-bold text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <label className="block text-xs font-bold text-indigo-100 uppercase tracking-widest mb-3">Optional Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white/20 outline-none text-white h-32" placeholder="Write anything else on your mind..." />
          </div>

          <div className="mt-10 flex gap-4">
            <button type="button" onClick={() => navigate('/student')} className="flex-1 px-6 py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 border border-white/10 transition">Cancel</button>
            <button type="submit" disabled={isLoading || !isFormComplete()} className="flex-1 bg-white text-indigo-900 py-4 rounded-2xl font-black text-lg hover:bg-indigo-50 transition transform active:scale-95 shadow-2xl disabled:opacity-30">
              {isLoading ? 'SUBMITTING...' : 'FINISH ASSESSMENT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PHQ9Assessment;