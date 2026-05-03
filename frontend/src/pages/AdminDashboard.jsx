import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, studentAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Users, AlertCircle, Zap, Shield, Search, Trash2, LayoutGrid, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass-strong p-8 group overflow-hidden">
    <div className="flex justify-between items-center mb-6">
      <div className="p-3 rounded-2xl bg-slate-800/60 text-slate-400"><Icon size={20} /></div>
      <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Live Intel</span>
    </div>
    <p className="text-5xl font-black italic tracking-tighter mb-2" style={{ color }}>{value || 0}</p>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</p>
  </div>
);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ stats: null, students: [], courses: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('directory');

  const loadData = async () => {
    try {
      const [sRes, stRes, cRes] = await Promise.all([dashboardAPI.getStats(), studentAPI.getAll(), dashboardAPI.getByCourse()]);
      setData({ stats: sRes.stats || sRes.data, students: stRes.data || stRes.students || [], courses: cRes.data || cRes.courseStats || [] });
    } catch (e) { toast.error("Sync Error"); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const riskPieData = [
    { name: 'Healthy', value: data.stats?.healthyCount || 0, color: '#10b981' },
    { name: 'Moderate', value: data.stats?.moderateCount || 0, color: '#f59e0b' },
    { name: 'Critical', value: data.stats?.criticalCount || 0, color: '#ef4444' },
  ];

  const chartData = data.courses || [];

  if (loading) return <div className="app-bg min-h-screen flex items-center justify-center font-mono text-cyan-400">LOADING HUB...</div>;

  return (
    <div className="min-h-screen app-bg pb-20">
      <nav className="vibe-nav">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield size={22} className="text-cyan-400" />
            <h1 className="text-lg text-white">ADMIN<span className="text-cyan-400">INTEL</span></h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/admin/add-student')} className="vibe-btn-primary py-2 text-xs">Add Account</button>
            <button onClick={logout} className="vibe-btn-secondary text-xs text-slate-300">LOGOUT</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Cadets" value={data.stats?.totalStudents} icon={Users} color="#f8fafc" />
          <StatCard title="Critical Breach" value={data.stats?.criticalCount} icon={AlertCircle} color="#ef4444" />
          <StatCard title="Optimal Sync" value={data.stats?.healthyCount} icon={Zap} color="#10b981" />
        </div>

        <div className="flex gap-2 p-1 bg-slate-800/50 rounded-2xl w-fit border border-slate-700">
          <button onClick={() => setActiveTab('directory')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'directory' ? 'bg-cyan-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}><LayoutGrid size={14} className="inline mr-2"/>Directory</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'analytics' ? 'bg-cyan-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}><BarChart2 size={14} className="inline mr-2"/>Analytics</button>
        </div>

        {activeTab === 'analytics' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-strong p-8">
              <h3 className="mb-8 text-xs font-mono text-slate-400 tracking-[0.3em]">Risk Profile Distro</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                      {riskPieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-strong p-8">
              <h3 className="mb-8 text-xs font-mono text-slate-400 tracking-[0.3em]">Department Metrics</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={true} axisLine={true} allowDecimals={false} />
                    <YAxis dataKey="course" type="category" stroke="#94a3b8" fontSize={10} tickLine={true} axisLine={true} width={130} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' }} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-strong p-8 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  <th className="pb-4 px-4">Cadet</th>
                  <th className="pb-4 px-4">Department</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.students.map((s, i) => (
                  <tr key={i} className="group hover:bg-slate-800/40">
                    <td className="py-5 px-4">
                      <p className="font-bold text-sm text-white">{s.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{s.studentId}</p>
                    </td>
                    <td className="py-5 px-4 text-sm text-slate-300">{s.course}</td>
                    <td className="py-5 px-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black italic uppercase" style={{ border: `1px solid ${s.currentRiskScore > 2 ? '#ef4444' : '#10b981'}44`, color: s.currentRiskScore > 2 ? '#ef4444' : '#10b981' }}>
                        LEVEL {s.currentRiskScore || 0}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <button className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;