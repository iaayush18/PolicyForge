/**
 * src/pages/PHQ9Assessment.jsx
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assessmentAPI } from '../services/api';
import { cachedFetch } from '../hooks/useApi';
import { ArrowLeft, ArrowRight, CheckCircle, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const PHQ9_QUESTIONS = [
  { key: 'q1_interest', text: 'Little interest or pleasure in doing things', category: 'Mood' },
  { key: 'q2_depressed', text: 'Feeling down, depressed, or hopeless', category: 'Mood' },
  { key: 'q3_sleep', text: 'Trouble falling or staying asleep, or sleeping too much', category: 'Sleep' },
  { key: 'q4_energy', text: 'Feeling tired or having little energy', category: 'Energy' },
  { key: 'q5_appetite', text: 'Poor appetite or overeating', category: 'Appetite' },
  { key: 'q6_failure', text: 'Feeling bad about yourself — or that you are a failure', category: 'Self-worth' },
  { key: 'q7_concentration', text: 'Trouble concentrating on things, such as reading or watching television', category: 'Focus' },
  { key: 'q8_movement', text: 'Moving or speaking so slowly that other people could have noticed', category: 'Activity' },
  { key: 'q9_suicidal', text: 'Thoughts that you would be better off dead, or of hurting yourself', category: 'Safety' },
];

const FREQUENCY_OPTIONS = [
  { label: 'Not at all', value: 0, color: '#10B981' },
  { label: 'Several days', value: 1, color: '#FBBF24' },
  { label: 'More than half the days', value: 2, color: '#F97316' },
  { label: 'Nearly every day', value: 3, color: '#EF4444' },
];

const scoreToRisk = (score) => {
  if (score <= 4) return { label: 'Minimal', color: '#10B981', level: 0 };
  if (score <= 9) return { label: 'Mild', color: '#FBBF24', level: 1 };
  if (score <= 14) return { label: 'Moderate', color: '#F97316', level: 2 };
  return { label: 'Severe', color: '#EF4444', level: 3 };
};

const QuestionCard = ({ question, index, answer, onAnswer, direction }) => {
  return (
    <div className={`phq-question-card phq-slide-${direction}`} key={question.key}>
      <span className="phq-category-tag">{question.category}</span>
      <div className="phq-q-number">
        <span className="phq-q-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="phq-q-slash">/09</span>
      </div>
      <p className="phq-q-text">{question.text}</p>
      <div className="phq-options">
        {FREQUENCY_OPTIONS.map((opt) => {
          const selected = answer === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAnswer(question.key, opt.value)}
              className={`phq-option-btn ${selected ? 'phq-option-selected' : ''}`}
              style={selected ? {
                borderColor: opt.color, background: `${opt.color}18`, color: opt.color, boxShadow: `0 0 20px ${opt.color}28`,
              } : {}}
            >
              <span className="phq-option-chip" style={{ background: selected ? opt.color : 'rgba(255,255,255,0.08)', color: selected ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                {opt.value}
              </span>
              <span className="phq-option-label">{opt.label}</span>
              {selected && <CheckCircle size={16} className="ml-auto flex-shrink-0" style={{ color: opt.color }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const PHQ9Assessment = () => {
  const navigate = useNavigate();
  const { updateStudentProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState('right');
  const [answers, setAnswers] = useState({
    q1_interest: null, q2_depressed: null, q3_sleep: null,
    q4_energy: null, q5_appetite: null, q6_failure: null,
    q7_concentration: null, q8_movement: null, q9_suicidal: null,
  });
  const [notes, setNotes] = useState('');

  const totalQuestions = PHQ9_QUESTIONS.length;
  const answeredCount = useMemo(() => Object.values(answers).filter(v => v !== null).length, [answers]);
  const progress = useMemo(() => (answeredCount / totalQuestions) * 100, [answeredCount, totalQuestions]);
  const rawScore = useMemo(() => Object.values(answers).reduce((s, v) => s + (v || 0), 0), [answers]);
  const liveRisk = useMemo(() => scoreToRisk(rawScore), [rawScore]);
  const isFormComplete = useMemo(() => Object.values(answers).every(v => v !== null), [answers]);
  const currentQ = PHQ9_QUESTIONS[currentStep];
  const currentAnswer = currentQ ? answers[currentQ.key] : null;

  useEffect(() => {
    const handleKey = (e) => {
      // FIX: Prevent global keystrokes from triggering while typing in inputs/textareas
      if (['TEXTAREA', 'INPUT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStep < totalQuestions && currentAnswer !== null) goNext();
      }
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        if (currentStep > 0) goBack();
      }
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 0 && num <= 3 && currentQ) {
        handleAnswerChange(currentQ.key, num);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentStep, currentAnswer, currentQ]);

  const handleAnswerChange = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));

    // FIX: Using functional state update prevents the fast-clicking skipped-question bug
    setTimeout(() => {
      setCurrentStep(current => {
        if (current < totalQuestions - 1) {
          setDirection('right');
          return current + 1;
        } else if (current === totalQuestions - 1) {
          setDirection('right');
          return totalQuestions;
        }
        return current;
      });
    }, 420);
  };

  const goNext = () => {
    if (currentStep < totalQuestions) {
      setDirection('right');
      setCurrentStep(s => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setDirection('left');
      setCurrentStep(s => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) { toast.error('Please answer all questions'); return; }
    setIsLoading(true);
    try {
      const response = await assessmentAPI.submit({
        phq9Answers: answers,
        notes: notes.trim() || undefined,
      });
      // Use cachedFetch for student profile to leverage browser caching
      const studentResponse = await cachedFetch('/api/students/me');
      const freshProfile = studentResponse;
      if (updateStudentProfile) updateStudentProfile(freshProfile);

      toast.success('Assessment complete!');

      // FIX: Safe chain assignment if API returns { success: true, data: { assessment: ... } }
      const finalRiskLevel = response.assessment?.riskLevel || response.data?.assessment?.riskLevel || 'Calculated';
      toast.success(`Result: ${finalRiskLevel}`, { duration: 5000 });
      navigate('/student');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  const isReviewStep = currentStep === totalQuestions;

  return (
    <div className="min-h-screen app-bg text-white pb-16">
      <nav className="glass sticky top-0 z-50 px-5 py-3 rounded-none border-b-0 shadow-xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => currentStep > 0 ? goBack() : navigate('/student')} className="flex items-center gap-2 bg-white/6 hover:bg-white/12 px-3 py-1.5 rounded-xl transition border border-white/10 text-sm">
            <ChevronLeft size={16} />
            {currentStep > 0 ? `Q${currentStep}` : 'Back'}
          </button>
          <div className="text-center">
            <h1 className="text-sm font-black tracking-tight">PHQ-9 Assessment</h1>
            <p className="text-[9px] uppercase tracking-widest text-white/35 font-bold">Standard Clinical Screen</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all" style={{ background: `${liveRisk.color}15`, borderColor: `${liveRisk.color}35`, color: liveRisk.color }}>
            <span>{rawScore}</span>
            <span className="text-[9px] opacity-60 font-medium">{liveRisk.label}</span>
          </div>
        </div>
      </nav>

      <div className="w-full h-1 bg-white/5">
        <div className="h-full transition-all duration-500" style={{ width: `${isReviewStep ? 100 : progress}%`, background: `linear-gradient(90deg, ${liveRisk.color}, #22d3ee)`, boxShadow: `0 0 8px ${liveRisk.color}60` }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1.5">
            {PHQ9_QUESTIONS.map((_, i) => (
              <button key={i} onClick={() => { setDirection(i < currentStep ? 'left' : 'right'); setCurrentStep(i); }} className="transition-all duration-300 rounded-full" style={{ width: i === currentStep ? '20px' : '6px', height: '6px', background: answers[PHQ9_QUESTIONS[i].key] !== null ? '#8b78ff' : i === currentStep ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)' }} />
            ))}
            <button onClick={() => isFormComplete() && setCurrentStep(totalQuestions)} className="rounded-full transition-all duration-300" style={{ width: isReviewStep ? '20px' : '6px', height: '6px', background: isReviewStep ? '#22d3ee' : 'rgba(255,255,255,0.1)' }} />
          </div>
          <span className="text-xs text-white/30 font-mono">{isReviewStep ? 'Review' : `${answeredCount} / ${totalQuestions} answered`}</span>
        </div>

        {!isReviewStep && currentQ && (
          <div className="glass-strong p-8 mb-6 overflow-hidden">
            <QuestionCard question={currentQ} index={currentStep} answer={currentAnswer} onAnswer={handleAnswerChange} direction={direction} />
            <div className="flex gap-3 mt-8 pt-6 border-t border-white/8">
              <button type="button" onClick={goBack} disabled={currentStep === 0} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed">
                <ArrowLeft size={15} /> Previous
              </button>
              <button type="button" onClick={goNext} disabled={currentAnswer === null} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ml-auto disabled:opacity-30 disabled:cursor-not-allowed" style={{ background: currentAnswer !== null ? 'rgba(139,120,255,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${currentAnswer !== null ? 'rgba(139,120,255,0.4)' : 'rgba(255,255,255,0.08)'}`, color: currentAnswer !== null ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}>
                {currentStep === totalQuestions - 1 ? 'Review' : 'Next'} <ArrowRight size={15} />
              </button>
            </div>
            <p className="text-center text-[9px] text-white/20 font-mono mt-4">Press <kbd className="phq-kbd">0–3</kbd> to answer · <kbd className="phq-kbd">→</kbd> next · <kbd className="phq-kbd">←</kbd> back</p>
          </div>
        )}

        {isReviewStep && (
          <div className="space-y-4 animate-in">
            <div className="glass-strong p-6 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-black" style={{ background: `${liveRisk.color}18`, border: `1px solid ${liveRisk.color}35`, color: liveRisk.color }}>{rawScore}</div>
              <h2 className="text-lg font-black">Assessment Complete</h2>
              <p className="text-sm mt-1" style={{ color: liveRisk.color }}>{liveRisk.label} · PHQ-9 Score: {rawScore} / 27</p>
              <p className="text-xs text-white/35 mt-2">Review your answers below, then submit.</p>
            </div>
            <div className="glass p-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Answer Summary</h3>
              <div className="grid grid-cols-1 gap-2">
                {PHQ9_QUESTIONS.map((q, i) => {
                  const ans = answers[q.key];
                  const opt = FREQUENCY_OPTIONS.find(o => o.value === ans);
                  return (
                    <div key={q.key} onClick={() => { setDirection('left'); setCurrentStep(i); }} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 border border-transparent hover:border-white/8">
                      <span className="text-[10px] font-mono text-white/25 w-5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <p className="text-xs text-white/65 flex-1 truncate">{q.text}</p>
                      {opt ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0" style={{ color: opt.color, background: `${opt.color}18`, border: `1px solid ${opt.color}30` }}>{opt.value} · {opt.label}</span>
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold flex-shrink-0">Unanswered</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="glass p-5">
              <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-3">Additional Notes <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span></label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full resize-none rounded-xl text-sm" placeholder="Anything else on your mind…" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', padding: '12px 14px', color: 'rgba(255,255,255,0.85)', outline: 'none' }} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setDirection('left'); setCurrentStep(totalQuestions - 1); }} className="px-5 py-3.5 rounded-2xl font-semibold text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <ArrowLeft size={15} className="inline mr-1.5" /> Review
              </button>
              <button type="button" onClick={handleSubmit} disabled={isLoading || !isFormComplete()} className="flex-1 py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e8e4ff 100%)', color: '#2d1b8f', boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
                {isLoading ? <span className="inline-block w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" /> : <><CheckCircle size={17} /> Submit Assessment</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PHQ9Assessment;