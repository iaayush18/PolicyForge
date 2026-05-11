// AdminDashboard.jsx
// Campus Wellness Intelligence Platform — Admin View

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, studentAPI, supportAPI } from '../services/api';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import {
  Users, AlertCircle, TrendingUp, Award, LogOut,
  Plus, Search, Trash2, Activity, Shield, BarChart2, RefreshCw, MessageSquare, CheckCircle, Clock, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Stat Card component with animation
const useAnimatedValue = (target, duration = 800) => {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);
  useEffect(() => {
    if (target === prevTarget.current) return;
    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();
    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(start + diff * eased));
      if (p < 1) requestAnimationFrame(tick);
      else prevTarget.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
};

const StatCard = ({ title, value, icon: Icon, color, accentColor, delay = 0 }) => {
  const animated = useAnimatedValue(value || 0);
  return (
    <div className="glass-strong p-6 glass-hover group relative overflow-hidden" style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-xl pointer-events-none" style={{ backgroundColor: accentColor }} />
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-2" style={{ color: 'rgba(200,200,255,0.55)' }}>{title}</p>
          <p className={`text-4xl font-black leading-none ${color}`} style={{ letterSpacing: '-0.04em' }}>{animated}</p>
        </div>
        <div className="p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300" style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
          <Icon size={22} style={{ color: accentColor }} />
        </div>
      </div>
    </div>
  );
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (!percent || isNaN(percent) || percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
};

const PRIORITY_COLORS = { LOW: '#9CA3AF', MEDIUM: '#FBBF24', HIGH: '#F97316', CRITICAL: '#EF4444' };
const STATUS_COLORS = { OPEN: '#8b78ff', IN_PROGRESS: '#22d3ee', RESOLVED: '#10B981', ESCALATED: '#EF4444' };
const TYPE_LABELS = { MENTAL_WELLNESS: 'Mental', ACADEMIC: 'Academic', HOSTEL: 'Hostel', PLACEMENT: 'Placement', OTHER: 'Other' };

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [domainAverages, setDomainAverages] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('directory');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const [statsRes, studentsRes, courseRes, domainRes, ticketsRes] = await Promise.all([
        dashboardAPI.getStats(),
        studentAPI.getAll(),
        dashboardAPI.getByCourse(),
        dashboardAPI.getDomainAverages(),
        supportAPI.getAll(),
      ]);
      setStats(statsRes.stats || statsRes.data);
      setStudents(studentsRes.data || studentsRes.students || []);
      setCourseStats(courseRes.data || courseRes.courseStats || []);
      setDomainAverages(domainRes.data || null);
      setTickets(ticketsRes.tickets || []);
    } catch (error) {
      console.error('Dashboard Load Error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Permanently delete all records for ${name}?`)) return;
    try {
      await studentAPI.delete(id);
      toast.success('Student removed successfully');
      loadDashboardData(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting student');
    }
  };

  const handleUpdateTicket = async (ticketId, status) => {
    try {
      await supportAPI.updateStatus(ticketId, { status });
      toast.success(`Ticket marked as ${status}`);
      loadDashboardData(true);
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  const getWellnessColor = (score) => {
    if (score <= 20) return '#10B981';
    if (score <= 40) return '#34D399';
    if (score <= 60) return '#FBBF24';
    if (score <= 80) return '#F97316';
    return '#EF4444';
  };
  const getWellnessLabel = (score) => {
    if (score <= 20) return 'Excellent';
    if (score <= 40) return 'Stable';
    if (score <= 60) return 'Concern';
    if (score <= 80) return 'High Stress';
    return 'Critical';
  };

  const filteredStudents = React.useMemo(() => {
    return (students || [])
      .filter((s) => {
        const score = s.currentWellnessScore || 0;
        if (filterRisk === 'critical' && score <= 80) return false;
        if (filterRisk === 'concern' && (score <= 40 || score > 80)) return false;
        if (filterRisk === 'stable' && score > 40) return false;
        if (searchTerm.trim()) {
          const t = searchTerm.toLowerCase();
          return (s.name || '').toLowerCase().includes(t) || (s.studentId || '').toLowerCase().includes(t);
        }
        return true;
      })
      .sort((a, b) => (b.currentWellnessScore || 0) - (a.currentWellnessScore || 0));
  }, [students, searchTerm, filterRisk]);

  const wellnessPieData = React.useMemo(() => {
    if (!students?.length) return [];
    const bands = { Excellent: 0, Stable: 0, Concern: 0, 'High Stress': 0, Critical: 0 };
    const colors = { Excellent: '#10B981', Stable: '#34D399', Concern: '#FBBF24', 'High Stress': '#F97316', Critical: '#EF4444' };
    students.forEach(s => { const lbl = getWellnessLabel(s.currentWellnessScore || 0); bands[lbl]++; });
    return Object.entries(bands).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value, color: colors[name] }));
  }, [students]);

  const domainRadarData = React.useMemo(() => {
    if (!domainAverages) return [];
    return [
      { domain: 'Mental', score: domainAverages.mental },
      { domain: 'Academic', score: domainAverages.academic },
      { domain: 'Hostel', score: domainAverages.hostel },
      { domain: 'Placement', score: domainAverages.placement },
      { domain: 'Lifestyle', score: domainAverages.lifestyle },
    ];
  }, [domainAverages]);

  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'ESCALATED').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center app-bg">
        <div className="glass p-10 text-center">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-t-violet-400 border-r-cyan-400 animate-spin" />
            <Activity className="absolute inset-0 m-auto text-white/60" size={20} />
          </div>
          <p className="text-white/70 text-sm font-medium tracking-wide">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg text-white pb-20">
      <nav className="glass sticky top-0 z-50 px-6 py-3 rounded-none border-b-0 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b78ff, #22d3ee)', boxShadow: '0 0 16px rgba(139,120,255,0.4)' }}>
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none">Campus Wellness Intelligence</h1>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => loadDashboardData(true)} disabled={refreshing} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition">
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-violet-400' : 'text-white/60'} />
            </button>
            <button onClick={() => navigate('/admin/add-student')} className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-1.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition shadow-lg">
              <Plus size={16} /> Add Student
            </button>
            <button onClick={logout} className="flex items-center gap-2 bg-white/8 hover:bg-white/15 px-4 py-1.5 rounded-xl transition border border-white/15 text-sm">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-10 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={stats?.totalStudents} icon={Users} color="text-white" accentColor="#8b78ff" delay={0} />
          <StatCard title="High Priority" value={(stats?.highStressCount || 0) + (stats?.criticalCount || 0)} icon={AlertCircle} color="text-red-400" accentColor="#f87171" delay={60} />
          <StatCard title="Open Tickets" value={stats?.pendingSupport || openTickets} icon={MessageSquare} color="text-violet-400" accentColor="#8b78ff" delay={120} />
          <StatCard title="Stable / Excellent" value={(stats?.excellentCount || 0) + (stats?.stableCount || 0)} icon={Award} color="text-emerald-400" accentColor="#10b981" delay={180} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/8 w-fit">
          {[{ id: 'directory', label: 'Directory', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'support', label: `Support${openTickets > 0 ? ` (${openTickets})` : ''}`, icon: MessageSquare }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-800 shadow-md' : 'text-white/50 hover:text-white/80'}`}>
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-strong p-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-white/60 mb-6">Wellness Distribution</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={wellnessPieData} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={4} dataKey="value" labelLine={false} label={<CustomPieLabel />}>
                        {wellnessPieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(10,8,30,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'rgba(200,200,255,0.7)', fontSize: 11 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-strong p-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-white/60 mb-6">Domain Stress Averages</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={domainRadarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="domain" tick={{ fill: 'rgba(200,200,255,0.6)', fontSize: 11 }} />
                      <Radar name="Avg Score" dataKey="score" stroke="#8b78ff" fill="#8b78ff" fillOpacity={0.25} />
                      <Tooltip contentStyle={{ background: 'rgba(10,8,30,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="glass-strong p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/60 mb-6">Average Wellness Score by Course</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseStats} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="course" stroke="transparent" tick={{ fill: 'rgba(200,200,255,0.5)', fontSize: 10 }} />
                    <YAxis stroke="transparent" tick={{ fill: 'rgba(200,200,255,0.5)', fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: 'rgba(10,8,30,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="avgWellnessScore" fill="#8b78ff" radius={[6, 6, 0, 0]} name="Avg Wellness Score" />
                    <Bar dataKey="criticalCount" fill="#EF4444" radius={[6, 6, 0, 0]} name="Critical Students" />
                    <Legend formatter={(v) => <span style={{ color: 'rgba(200,200,255,0.6)', fontSize: 11 }}>{v}</span>} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Directory Tab */}
        {activeTab === 'directory' && (
          <div className="glass p-6">
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input type="text" placeholder="Search by name or ID…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl outline-none text-white placeholder:text-white/25 focus:border-violet-500/50 transition" />
              </div>
              <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="px-4 py-2.5 text-sm bg-white/8 border border-white/12 rounded-xl text-white outline-none cursor-pointer">
                <option value="all">All Wellness Levels</option>
                <option value="critical">🔴 High Stress / Critical</option>
                <option value="concern">🟡 Moderate Concern</option>
                <option value="stable">🟢 Stable / Excellent</option>
              </select>
              <div className="text-xs text-white/30 self-center font-mono px-2">{filteredStudents.length} records</div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/6">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['Student ID', 'Name', 'Course', 'CGPA', 'Wellness Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-white/35 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? filteredStudents.map((student, idx) => {
                    const score = student.currentWellnessScore || 0;
                    const color = getWellnessColor(score);
                    const label = getWellnessLabel(score);
                    return (
                      <tr key={student.id} className="border-t border-white/5 hover:bg-white/4 transition-colors group">
                        <td className="px-4 py-3.5"><span className="font-mono text-[11px] text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/8">{student.studentId || 'N/A'}</span></td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-sm text-white/90">{student.name}</div>
                          <div className="font-mono text-[10px] text-white/35 mt-0.5">{student.user?.email}</div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-white/65">{student.course}</td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-white/70">{student.cgpa ?? '—'}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                              style={{ background: `${color}22`, border: `1px solid ${color}55`, color }}>
                              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
                              {label}
                            </span>
                            <span className="text-[10px] font-mono text-white/30">{Math.round(score)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button onClick={() => handleDeleteStudent(student.id, student.name)} className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-all">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan="6" className="text-center py-16 text-white/30 text-sm italic">No students match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/60">Support Requests</h2>
              <span className="text-xs font-mono text-white/30">{tickets.length} total · {openTickets} open</span>
            </div>
            {tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: `${PRIORITY_COLORS[ticket.priority]}20`, color: PRIORITY_COLORS[ticket.priority], border: `1px solid ${PRIORITY_COLORS[ticket.priority]}30` }}>
                          {ticket.priority}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: `${STATUS_COLORS[ticket.status]}20`, color: STATUS_COLORS[ticket.status], border: `1px solid ${STATUS_COLORS[ticket.status]}30` }}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-white/80">{TYPE_LABELS[ticket.type] || ticket.type}</span>
                          {!ticket.isAnonymous && ticket.student && (
                            <span className="text-[10px] text-white/40">· {ticket.student.name} ({ticket.student.studentId})</span>
                          )}
                          {ticket.isAnonymous && <span className="text-[10px] text-white/30 italic">Anonymous</span>}
                          <span className="ml-auto text-[9px] font-mono text-white/25">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{ticket.message}</p>
                      </div>
                    </div>
                    {ticket.status !== 'RESOLVED' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/6">
                        {ticket.status === 'OPEN' && (
                          <button onClick={() => handleUpdateTicket(ticket.id, 'IN_PROGRESS')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.25)', color: '#22d3ee' }}>
                            <Clock size={11} /> In Progress
                          </button>
                        )}
                        <button onClick={() => handleUpdateTicket(ticket.id, 'RESOLVED')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}>
                          <CheckCircle size={11} /> Resolve
                        </button>
                        {ticket.status !== 'ESCALATED' && (
                          <button onClick={() => handleUpdateTicket(ticket.id, 'ESCALATED')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}>
                            <Zap size={11} /> Escalate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-white/30">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No support tickets yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;