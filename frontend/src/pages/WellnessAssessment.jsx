/**
 * src/pages/WellnessAssessment.jsx
 * Multi-domain Campus Wellness Self-Assessment
 * Sections: Mental · Academic · Hostel · Placement · Lifestyle
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { wellnessAPI, studentAPI } from '../services/api';
import { ArrowLeft, ArrowRight, CheckCircle, ChevronLeft, Brain, BookOpen, Home, Briefcase, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Section definitions ────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'mental', label: 'Mental Wellness', icon: Brain, color: '#8b78ff',
    description: 'How have you been feeling emotionally?',
    scale: '03',
    questions: [
      { key: 'm1_exhaustion',    text: 'Feeling emotionally exhausted or burned out' },
      { key: 'm2_sleep',         text: 'Difficulty falling or staying asleep' },
      { key: 'm3_motivation',    text: 'Loss of motivation or interest in activities' },
      { key: 'm4_concentration', text: 'Trouble concentrating or focusing on tasks' },
      { key: 'm5_isolation',     text: 'Feeling isolated or disconnected from others' },
    ],
  },
  {
    id: 'academic', label: 'Academic Stress', icon: BookOpen, color: '#22d3ee',
    description: 'How is your academic workload affecting you?',
    scale: '03',
    questions: [
      { key: 'a1_assignment', text: 'Overwhelmed by assignment deadlines and pressure' },
      { key: 'a2_exam',       text: 'Experiencing fear or anxiety about exams' },
      { key: 'a3_backlog',    text: 'Struggling with subject backlogs or arrears' },
      { key: 'a4_time_mgmt',  text: 'Difficulty managing time between subjects' },
      { key: 'a5_attendance', text: 'Stressed about attendance or missing classes' },
    ],
  },
  {
    id: 'hostel', label: 'Hostel & Mess', icon: Home, color: '#34D399',
    description: 'Rate your satisfaction with hostel facilities.',
    scale: 'likert',
    questions: [
      { key: 'h1_food',        text: 'Food quality and variety in the mess' },
      { key: 'h2_cleanliness', text: 'Cleanliness of rooms and common areas' },
      { key: 'h3_internet',    text: 'Internet connectivity and reliability' },
      { key: 'h4_noise',       text: 'Noise levels and sleep environment' },
      { key: 'h5_safety',      text: 'Feeling of safety and security on campus' },
    ],
  },
  {
    id: 'placement', label: 'Placement Readiness', icon: Briefcase, color: '#FBBF24',
    description: 'How prepared do you feel for placements?',
    scale: '03',
    questions: [
      { key: 'p1_anxiety',      text: 'Feeling anxious about campus placement season' },
      { key: 'p2_technical',    text: 'Lacking confidence in technical skills' },
      { key: 'p3_resume',       text: 'Uncertain about resume or profile strength' },
      { key: 'p4_interview',    text: 'Nervous about interview performance' },
      { key: 'p5_unemployment', text: 'Fear of not getting placed or unemployment' },
    ],
  },
  {
    id: 'lifestyle', label: 'Lifestyle & Social', icon: Zap, color: '#F97316',
    description: 'How balanced is your daily lifestyle?',
    scale: '03',
    questions: [
      { key: 'l1_physical',        text: 'Lack of regular physical activity or exercise' },
      { key: 'l2_social',          text: 'Feeling disconnected from friends or peers' },
      { key: 'l3_screen_time',     text: 'Excessive screen time affecting wellbeing' },
      { key: 'l4_sleep_routine',   text: 'Irregular or poor sleep routine' },
      { key: 'l5_campus_activity', text: 'Not participating in campus clubs or events' },
    ],
  },
];

const STRESS_OPTIONS = [
  { label: 'Not at all', value: 0, color: '#10B981' },
  { label: 'Occasionally', value: 1, color: '#FBBF24' },
  { label: 'Often', value: 2, color: '#F97316' },
  { label: 'Almost always', value: 3, color: '#EF4444' },
];

const LIKERT_OPTIONS = [
  { label: 'Very Poor', value: 1, color: '#EF4444' },
  { label: 'Poor', value: 2, color: '#F97316' },
  { label: 'Average', value: 3, color: '#FBBF24' },
  { label: 'Good', value: 4, color: '#34D399' },
  { label: 'Excellent', value: 5, color: '#10B981' },
];

// ── helpers ────────────────────────────────────────────────────────────────
const initAnswers = () => {
  const a = {};
  SECTIONS.forEach(s => s.questions.forEach(q => { a[q.key] = null; }));
  return a;
};

const ScoreRing = ({ score, color, label }) => {
  const r = 36, c = 2 * Math.PI * r;
  const dash = c * (1 - score / 100);
  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={dash}
          transform="rotate(-90 44 44)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black" style={{ color }}>{score}</span>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">{label}</span>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
const WellnessAssessment = () => {
  const navigate = useNavigate();
  const { updateStudentProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [sectionIdx, setSectionIdx] = useState(0); // which section
  const [questionIdx, setQuestionIdx] = useState(0); // which question within section
  const [answers, setAnswers] = useState(initAnswers());
  const [notes, setNotes] = useState('');
  const [isReview, setIsReview] = useState(false);
  const [direction, setDirection] = useState('right');

  const section = SECTIONS[sectionIdx];
  const options = section?.scale === 'likert' ? LIKERT_OPTIONS : STRESS_OPTIONS;
  const currentQ = section?.questions[questionIdx];
  const currentAnswer = currentQ ? answers[currentQ.key] : null;

  const totalQuestions = SECTIONS.reduce((s, sec) => s + sec.questions.length, 0);
  const answeredCount = Object.values(answers).filter(v => v !== null).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const isAllAnswered = () => Object.values(answers).every(v => v !== null);

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e) => {
      if (['TEXTAREA', 'INPUT'].includes(e.target.tagName)) return;
      if ((e.key === 'ArrowRight' || e.key === 'Enter') && currentAnswer !== null) goNext();
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') goBack();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentAnswer, sectionIdx, questionIdx]);

  const handleAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setTimeout(() => {
      if (questionIdx < section.questions.length - 1) {
        setDirection('right'); setQuestionIdx(q => q + 1);
      } else if (sectionIdx < SECTIONS.length - 1) {
        setDirection('right'); setSectionIdx(s => s + 1); setQuestionIdx(0);
      } else {
        setIsReview(true);
      }
    }, 380);
  };

  const goNext = () => {
    if (questionIdx < section.questions.length - 1) { setDirection('right'); setQuestionIdx(q => q + 1); }
    else if (sectionIdx < SECTIONS.length - 1) { setDirection('right'); setSectionIdx(s => s + 1); setQuestionIdx(0); }
    else setIsReview(true);
  };

  const goBack = () => {
    if (isReview) { setIsReview(false); return; }
    if (questionIdx > 0) { setDirection('left'); setQuestionIdx(q => q - 1); }
    else if (sectionIdx > 0) { setDirection('left'); setSectionIdx(s => s - 1); setQuestionIdx(SECTIONS[sectionIdx - 1].questions.length - 1); }
    else navigate('/student');
  };

  const handleSubmit = async () => {
    if (!isAllAnswered()) { toast.error('Please answer all questions'); return; }
    setIsLoading(true);
    try {
      const response = await wellnessAPI.submit({ sectionAnswers: answers, notes: notes.trim() || undefined });
      const profileRes = await studentAPI.getMyProfile();
      const freshProfile = profileRes.student || profileRes.data || profileRes;
      if (updateStudentProfile) updateStudentProfile(freshProfile);
      toast.success('Wellness assessment complete!');
      const { finalWellnessScore, wellnessStatus } = response.assessment;
      toast.success(`Score: ${finalWellnessScore} — ${wellnessStatus}`, { duration: 5000 });
      navigate('/student');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Section mini-nav dots
  const globalQIndex = SECTIONS.slice(0, sectionIdx).reduce((s, sec) => s + sec.questions.length, 0) + questionIdx;

  return (
    <div className="min-h-screen app-bg text-white pb-16">
      {/* Nav */}
      <nav className="glass sticky top-0 z-50 px-5 py-3 rounded-none border-b-0 shadow-xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={goBack} className="flex items-center gap-2 bg-white/6 hover:bg-white/12 px-3 py-1.5 rounded-xl transition border border-white/10 text-sm">
            <ChevronLeft size={16} /> {isReview ? 'Back' : sectionIdx === 0 && questionIdx === 0 ? 'Back' : 'Prev'}
          </button>
          <div className="text-center">
            <h1 className="text-sm font-black tracking-tight">Wellness Self Assessment</h1>
            <p className="text-[9px] uppercase tracking-widest text-white/35 font-bold">Campus Wellness Portal</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border" style={{ background: `${section?.color}15`, borderColor: `${section?.color}35`, color: section?.color }}>
            {answeredCount}/{totalQuestions}
          </div>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="w-full h-1 bg-white/5">
        <div className="h-full transition-all duration-500" style={{ width: `${isReview ? 100 : progress}%`, background: `linear-gradient(90deg, ${section?.color}, #22d3ee)`, boxShadow: `0 0 8px ${section?.color}60` }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        {/* Section tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {SECTIONS.map((sec, i) => {
            const secAnswered = sec.questions.every(q => answers[q.key] !== null);
            const isCurrent = i === sectionIdx && !isReview;
            const SecIcon = sec.icon;
            return (
              <button key={sec.id}
                onClick={() => { if (!isReview) { setSectionIdx(i); setQuestionIdx(0); } }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0"
                style={{
                  background: isCurrent ? `${sec.color}18` : secAnswered ? `${sec.color}0a` : 'rgba(255,255,255,0.04)',
                  borderColor: isCurrent ? `${sec.color}50` : secAnswered ? `${sec.color}30` : 'rgba(255,255,255,0.08)',
                  color: isCurrent ? sec.color : secAnswered ? `${sec.color}cc` : 'rgba(255,255,255,0.35)',
                }}>
                <SecIcon size={12} />
                {sec.label}
                {secAnswered && <CheckCircle size={10} />}
              </button>
            );
          })}
        </div>

        {/* Question card */}
        {!isReview && currentQ && (
          <div className="glass-strong p-8 mb-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              {React.createElement(section.icon, { size: 16, style: { color: section.color } })}
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: section.color }}>{section.label}</span>
              <span className="ml-auto text-[10px] font-mono text-white/25">{questionIdx + 1}/{section.questions.length}</span>
            </div>
            <p className="text-[10px] text-white/40 mb-3">{section.description}</p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-black text-white/20">{String(globalQIndex + 1).padStart(2, '0')}</span>
              <p className="text-lg font-semibold text-white/90 leading-snug">{currentQ.text}</p>
            </div>

            <div className="space-y-2.5">
              {options.map((opt) => {
                const selected = answers[currentQ.key] === opt.value;
                return (
                  <button key={opt.value} type="button"
                    onClick={() => handleAnswer(currentQ.key, opt.value)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border text-left"
                    style={selected ? {
                      borderColor: opt.color, background: `${opt.color}18`, color: opt.color, boxShadow: `0 0 18px ${opt.color}22`,
                    } : { borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)' }}>
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: selected ? opt.color : 'rgba(255,255,255,0.08)', color: selected ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                      {opt.value}
                    </span>
                    <span className="font-semibold text-sm">{opt.label}</span>
                    {selected && <CheckCircle size={16} className="ml-auto flex-shrink-0" style={{ color: opt.color }} />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t border-white/8">
              <button type="button" onClick={goBack} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 transition hover:bg-white/10">
                <ArrowLeft size={15} /> Back
              </button>
              <button type="button" onClick={goNext} disabled={currentAnswer === null}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ml-auto disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: currentAnswer !== null ? `${section.color}25` : 'rgba(255,255,255,0.05)', border: `1px solid ${currentAnswer !== null ? section.color + '50' : 'rgba(255,255,255,0.08)'}`, color: currentAnswer !== null ? section.color : 'rgba(255,255,255,0.3)' }}>
                {sectionIdx === SECTIONS.length - 1 && questionIdx === section.questions.length - 1 ? 'Review' : 'Next'} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Review page */}
        {isReview && (
          <div className="space-y-4">
            <div className="glass-strong p-6">
              <h2 className="text-lg font-black text-center mb-1">Assessment Complete</h2>
              <p className="text-xs text-white/40 text-center mb-6">Review your responses across all 5 wellness domains</p>
              <div className="flex flex-wrap justify-center gap-4">
                {SECTIONS.map((sec) => {
                  const raw = sec.questions.reduce((sum, q) => sum + (answers[q.key] || 0), 0);
                  const maxRaw = sec.questions.length * (sec.scale === 'likert' ? 5 : 3);
                  const stress = sec.scale === 'likert'
                    ? Math.round(((maxRaw - raw) / (maxRaw - sec.questions.length)) * 100)
                    : Math.round((raw / (sec.questions.length * 3)) * 100);
                  return <ScoreRing key={sec.id} score={stress} color={sec.color} label={sec.label.split(' ')[0]} />;
                })}
              </div>
            </div>

            {SECTIONS.map((sec) => {
              const opts = sec.scale === 'likert' ? LIKERT_OPTIONS : STRESS_OPTIONS;
              return (
                <div key={sec.id} className="glass p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {React.createElement(sec.icon, { size: 14, style: { color: sec.color } })}
                    <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: sec.color }}>{sec.label}</h3>
                  </div>
                  <div className="space-y-1.5">
                    {sec.questions.map((q, i) => {
                      const ans = answers[q.key];
                      const opt = opts.find(o => o.value === ans);
                      return (
                        <div key={q.key}
                          onClick={() => { setIsReview(false); setSectionIdx(SECTIONS.indexOf(sec)); setQuestionIdx(i); }}
                          className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/5 border border-transparent hover:border-white/8 transition-all">
                          <span className="text-[10px] font-mono text-white/25 w-4 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                          <p className="text-xs text-white/65 flex-1 truncate">{q.text}</p>
                          {opt
                            ? <span className="text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0" style={{ color: opt.color, background: `${opt.color}18`, border: `1px solid ${opt.color}30` }}>{opt.label}</span>
                            : <span className="text-[10px] text-red-400 font-bold flex-shrink-0">Unanswered</span>
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="glass p-5">
              <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-3">Additional Notes <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span></label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="w-full resize-none rounded-xl text-sm"
                placeholder="Anything else you'd like to share…"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', padding: '12px 14px', color: 'rgba(255,255,255,0.85)', outline: 'none' }} />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={goBack} className="px-5 py-3.5 rounded-2xl font-semibold text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <ArrowLeft size={15} className="inline mr-1.5" /> Edit
              </button>
              <button type="button" onClick={handleSubmit} disabled={isLoading || !isAllAnswered()}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e8e4ff 100%)', color: '#2d1b8f', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
                {isLoading ? <span className="inline-block w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" /> : <><CheckCircle size={17} /> Submit Wellness Assessment</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessAssessment;
