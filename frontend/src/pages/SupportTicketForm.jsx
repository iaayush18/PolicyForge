/**
 * src/pages/SupportTicketForm.jsx
 * Student-facing support ticket creation form
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportAPI } from '../services/api';
import { ChevronLeft, Brain, BookOpen, Home, Briefcase, HelpCircle, Send, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const TICKET_TYPES = [
  { value: 'MENTAL_WELLNESS', label: 'Mental Wellness', icon: Brain, color: '#8b78ff', description: 'Emotional distress, anxiety, counseling requests' },
  { value: 'ACADEMIC', label: 'Academic Support', icon: BookOpen, color: '#22d3ee', description: 'Backlogs, study guidance, exam stress' },
  { value: 'HOSTEL', label: 'Hostel / Mess', icon: Home, color: '#34D399', description: 'Facility issues, food quality, maintenance' },
  { value: 'PLACEMENT', label: 'Placement Help', icon: Briefcase, color: '#FBBF24', description: 'Career guidance, interview prep, mentoring' },
  { value: 'OTHER', label: 'Other', icon: HelpCircle, color: '#9CA3AF', description: 'Any other concern or general support' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low — General query', color: '#9CA3AF' },
  { value: 'MEDIUM', label: 'Medium — Needs attention soon', color: '#FBBF24' },
  { value: 'HIGH', label: 'High — Urgent concern', color: '#F97316' },
  { value: 'CRITICAL', label: 'Critical — Immediate help needed', color: '#EF4444' },
];

const SupportTicketForm = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedType = TICKET_TYPES.find(t => t.value === type);
  const selectedPriority = PRIORITIES.find(p => p.value === priority);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) { toast.error('Please select a support type'); return; }
    if (!message.trim() || message.trim().length < 20) { toast.error('Please describe your concern (min 20 characters)'); return; }

    setIsLoading(true);
    try {
      await supportAPI.create({ type, message: message.trim(), priority, isAnonymous });
      toast.success('Support request submitted!');
      toast.success('Our team will reach out to you soon.', { duration: 5000 });
      navigate('/student');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg text-white pb-16">
      <nav className="glass sticky top-0 z-50 px-5 py-3 rounded-none border-b-0 shadow-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/student')} className="flex items-center gap-2 bg-white/6 hover:bg-white/12 px-3 py-1.5 rounded-xl transition border border-white/10 text-sm">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="text-center">
            <h1 className="text-sm font-black tracking-tight">Request Support</h1>
            <p className="text-[9px] uppercase tracking-widest text-white/35 font-bold">Campus Wellness Portal</p>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-5">
        {/* Header */}
        <div className="glass-strong p-6 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(139,120,255,0.15)', border: '1px solid rgba(139,120,255,0.3)' }}>
            <Send size={24} className="text-violet-400" />
          </div>
          <h2 className="text-xl font-black mb-1">How can we help?</h2>
          <p className="text-sm text-white/50 leading-relaxed">Your request is handled confidentially. Our support team responds within 24 hours.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type selection */}
          <div className="glass p-5">
            <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-4">Support Category</label>
            <div className="grid grid-cols-1 gap-2">
              {TICKET_TYPES.map((t) => {
                const TypeIcon = t.icon;
                const selected = type === t.value;
                return (
                  <button key={t.value} type="button" onClick={() => setType(t.value)}
                    className="flex items-center gap-3 p-3.5 rounded-xl transition-all border text-left"
                    style={selected
                      ? { borderColor: t.color, background: `${t.color}15`, boxShadow: `0 0 16px ${t.color}18` }
                      : { borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: selected ? `${t.color}25` : 'rgba(255,255,255,0.06)', border: `1px solid ${selected ? t.color + '40' : 'rgba(255,255,255,0.08)'}` }}>
                      <TypeIcon size={16} style={{ color: selected ? t.color : 'rgba(255,255,255,0.4)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: selected ? t.color : 'rgba(255,255,255,0.85)' }}>{t.label}</p>
                      <p className="text-[10px] text-white/35 mt-0.5">{t.description}</p>
                    </div>
                    {selected && (
                      <div className="ml-auto w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: t.color }}>
                        <span className="text-[8px] text-white font-black">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div className="glass p-5">
            <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-4">Priority Level</label>
            <div className="grid grid-cols-2 gap-2">
              {PRIORITIES.map((p) => {
                const selected = priority === p.value;
                return (
                  <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                    className="flex flex-col items-start p-3 rounded-xl transition-all border text-left"
                    style={selected
                      ? { borderColor: p.color, background: `${p.color}15` }
                      : { borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                      <span className="text-xs font-bold" style={{ color: selected ? p.color : 'rgba(255,255,255,0.7)' }}>{p.value}</span>
                    </div>
                    <p className="text-[10px] text-white/35">{p.label.split('—')[1]?.trim()}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div className="glass p-5">
            <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-3">
              Describe Your Concern
              <span className="text-white/20 font-normal normal-case tracking-normal ml-1">(min 20 chars)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
              placeholder="Please describe what you're experiencing and how we can best support you…"
              className="w-full resize-none rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', padding: '14px 16px', color: 'rgba(255,255,255,0.85)', outline: 'none' }}
            />
            <p className="text-[10px] text-white/25 mt-2 text-right">{message.length} characters</p>
          </div>

          {/* Anonymous option */}
          <div className="glass p-4">
            <button type="button" onClick={() => setIsAnonymous(a => !a)}
              className="flex items-center gap-3 w-full text-left">
              <div className={`w-10 h-5 rounded-full transition-all relative ${isAnonymous ? 'bg-violet-500' : 'bg-white/10'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isAnonymous ? 'left-5' : 'left-0.5'}`} />
              </div>
              <div className="flex items-center gap-2">
                <EyeOff size={14} className="text-white/50" />
                <div>
                  <p className="text-sm font-semibold text-white/85">Submit Anonymously</p>
                  <p className="text-[10px] text-white/35">Your name will not be visible to support staff</p>
                </div>
              </div>
            </button>
          </div>

          {/* Submit */}
          <button type="submit" disabled={isLoading || !type || message.trim().length < 20}
            className="w-full py-4 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #8b78ff 0%, #22d3ee 100%)', color: '#fff', boxShadow: '0 4px 24px rgba(139,120,255,0.35)' }}>
            {isLoading
              ? <span className="inline-block w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              : <><Send size={17} /> Submit Support Request</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportTicketForm;
