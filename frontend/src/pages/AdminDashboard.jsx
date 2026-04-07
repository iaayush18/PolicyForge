/**
 * src/pages/AdminDashboard.jsx
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, studentAPI } from '../services/api';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import {
  Users, AlertCircle, TrendingUp, Award, LogOut,
  Plus, Search, Trash2, Activity, Shield, BarChart2, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  // FIX: Added !percent and isNaN check to prevent Recharts from crashing if values are 0
  if (!percent || isNaN(percent) || percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fontFamily="'Sora', sans-serif">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); 
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const [statsRes, studentsRes, courseRes] = await Promise.all([
        dashboardAPI.getStats(),
        studentAPI.getAll(),
        dashboardAPI.getByCourse(),
      ]);
      
      // FIX: Robust payload bindings to prevent map() errors if .data wrappers exist
      setStats(statsRes.stats || statsRes.data);
      setStudents(studentsRes.data || studentsRes.students || []);
      setCourseStats(courseRes.data || courseRes.courseStats || []);
      
    } catch (error) {
      console.error('Dashboard Load Error:', error);
      toast.error('Failed to sync with intelligence database');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Permanently delete all records for ${name}?`)) return;
    try {
      await studentAPI.delete(id);
      toast.success('Student account wiped successfully');
      loadDashboardData(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting student');
    }
  };

  const getRiskColor = (score) => ({ 0: '#10B981', 1: '#FBBF24', 2: '#F97316', 3: '#EF4444' }[score] || '#6B7280');
  const getRiskLabel = (score) => ({ 0: 'Minimal', 1: 'Mild', 2: 'Moderate', 3: 'Critical' }[score] || 'Unknown');

  const filteredStudents = React.useMemo(() => {
    return (students || [])
      .filter((s) => {
        if (filterRisk !== 'all' && (s.currentRiskScore ?? 0) !== parseInt(filterRisk)) return false;
        if (searchTerm.trim()) {
          const t = searchTerm.toLowerCase();
          return (s.name || '').toLowerCase().includes(t) || (s.studentId || '').toLowerCase().includes(t);
        }
        return true;
      })
      .sort((a, b) => (b.currentRiskScore || 0) - (a.currentRiskScore || 0));
  }, [students, searchTerm, filterRisk]);

  const riskPieData = React.useMemo(() => {
    if (!students?.length) return [];
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0 };
    students.forEach(s => { const sc = s.currentRiskScore ?? 0; if (counts[sc] !== undefined) counts[sc]++; });
    return [
      { name: 'Minimal', value: counts[0], color: '#10B981' },
      { name: 'Mild',    value: counts[1], color: '#FBBF24' },
      { name: 'Moderate',value: counts[2], color: '#F97316' },
      { name: 'Critical', value: counts[3], color: '#EF4444' },
    ].filter(d => d.value > 0);
  }, [students]);

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
    <div className="min-h-screen app-bg text-white pb-16">
      <nav className="glass sticky top-0 z-50 px-6 py-3 rounded-none border-b-0 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b78ff, #22d3ee)', boxShadow: '0 0 16px rgba(139,120,255,0.4)' }}>
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none">Admin Intelligence</h1>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => loadDashboardData(true)} disabled={refreshing} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition" title="Refresh">
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

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={stats?.totalStudents} icon={Users} color="text-white" accentColor="#8b78ff" delay={0} />
          <StatCard title="Critical Cases" value={stats?.criticalCount} icon={AlertCircle} color="text-red-400" accentColor="#f87171" delay={60} />
          <StatCard title="Moderate Risk" value={stats?.moderateCount} icon={TrendingUp} color="text-orange-400" accentColor="#f97316" delay={120} />
          <StatCard title="Healthy" value={stats?.healthyCount} icon={Award} color="text-emerald-400" accentColor="#10b981" delay={180} />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/8 w-fit">
          {[ { id: 'directory', label: 'Directory', icon: Users }, { id: 'analytics', label: 'Analytics', icon: BarChart2 } ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${ activeTab === tab.id ? 'bg-white text-indigo-800 shadow-md' : 'text-white/50 hover:text-white/80' }`}>
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in">
            <div className="glass-strong p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/60 mb-6">Risk Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={4} dataKey="value" labelLine={false} label={<CustomPieLabel />}>
                      {riskPieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(10,8,30,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontFamily: "'Sora', sans-serif", fontSize: 12 }} itemStyle={{ color: 'rgba(255,255,255,0.85)' }} />
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'rgba(200,200,255,0.7)', fontSize: 11 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-strong p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/60 mb-6">Risk by Course</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseStats} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="_id" stroke="transparent" tick={{ fill: 'rgba(200,200,255,0.5)', fontSize: 10, fontFamily: "'Sora', sans-serif" }} />
                    <YAxis stroke="transparent" tick={{ fill: 'rgba(200,200,255,0.5)', fontSize: 10 }} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: 'rgba(10,8,30,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12, fontFamily: "'Sora', sans-serif" }} />
                    <Bar dataKey="criticalCount" fill="#EF4444" radius={[6, 6, 0, 0]} name="Critical" />
                    <Bar dataKey="count" fill="rgba(139,120,255,0.45)" radius={[6, 6, 0, 0]} name="Total" />
                    <Legend formatter={(v) => <span style={{ color: 'rgba(200,200,255,0.6)', fontSize: 11 }}>{v}</span>} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'directory' && (
          <div className="glass p-6 animate-in">
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input type="text" placeholder="Search by name or ID…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl outline-none text-white placeholder:text-white/25 focus:border-violet-500/50 focus:bg-white/8 transition" />
              </div>
              <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="px-4 py-2.5 text-sm bg-white/8 border border-white/12 rounded-xl text-white outline-none focus:border-violet-500/50 transition cursor-pointer">
                <option value="all">All Risk Levels</option>
                <option value="3">🔴 Critical</option>
                <option value="2">🟠 Moderate</option>
                <option value="1">🟡 Mild</option>
                <option value="0">🟢 Healthy</option>
              </select>
              <div className="text-xs text-white/30 self-center font-mono px-2">{filteredStudents.length} records</div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/6">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['Student ID', 'Name', 'Course', 'CGPA', 'Risk Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-white/35 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? filteredStudents.map((student, idx) => (
                    <tr key={student._id || student.id} className="border-t border-white/5 hover:bg-white/4 transition-colors group" style={{ animationDelay: `${idx * 30}ms` }}>
                      <td className="px-4 py-3.5"><span className="font-mono text-[11px] text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/8">{student.studentId || 'N/A'}</span></td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-sm text-white/90">{student.name}</div>
                        <div className="font-mono text-[10px] text-white/35 mt-0.5">{student.userId?.email || student.email}</div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-white/65">{student.course}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-white/70">{student.cgpa ?? '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white" style={{ background: `${getRiskColor(student.currentRiskScore || 0)}22`, border: `1px solid ${getRiskColor(student.currentRiskScore || 0)}55`, color: getRiskColor(student.currentRiskScore || 0) }}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: getRiskColor(student.currentRiskScore || 0) }} />
                          {getRiskLabel(student.currentRiskScore || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button onClick={() => handleDeleteStudent(student._id || student.id, student.name)} className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-all">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="text-center py-16 text-white/30 text-sm italic">No students match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;