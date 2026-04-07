/**
 * src/pages/AdminDashboard.jsx
 * Optimized with Glassmorphism Effect
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Users, AlertCircle, TrendingUp, Award, LogOut, Plus, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, studentAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ✅ Single source of truth
  const [students, setStudents] = useState([]);

  // ⚠️ Keep only if absolutely needed
  const [loading, setLoading] = useState(true);

  const [filterRisk, setFilterRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ===============================
  // ✅ LOAD DATA (SIMPLIFIED)
  // ===============================
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);

      const res = await studentAPI.getAll();

      // ✅ Defensive parsing
      const data = res?.data || [];

      if (!Array.isArray(data)) {
        throw new Error("Invalid students data format");
      }

      setStudents(data);
    } catch (error) {
      console.error("Student Load Error:", error);
      toast.error("Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ✅ DELETE STUDENT (FIXED)
  // ===============================
  const handleDeleteStudent = async (id, name) => {
    if (!id) return;

    if (!window.confirm(`Delete ${name}?`)) return;

    try {
      await studentAPI.delete(id);

      // ✅ Optimistic update (instant UI sync)
      setStudents(prev =>
        prev.filter(s => (s._id || s.id) !== id)
      );

      toast.success("Student deleted");

    } catch (error) {
      console.error("Delete Error:", error);
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  // ===============================
  // ✅ FILTER + SEARCH (FIXED)
  // ===============================
  const filteredStudents = useMemo(() => {
    return students
      .filter(student => {
        if (!student) return false;

        // Risk filter
        if (filterRisk !== 'all') {
          const risk = student.currentRiskScore ?? 0;
          if (risk !== Number(filterRisk)) return false;
        }

        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const name = (student.name || '').toLowerCase();
          const sId = (student.studentId || '').toLowerCase();

          return name.includes(term) || sId.includes(term);
        }

        return true;
      })
      .sort((a, b) => (b.currentRiskScore || 0) - (a.currentRiskScore || 0));
  }, [students, filterRisk, searchTerm]);

  // ===============================
  // ✅ COMPUTED STATS (FIXED)
  // ===============================
  const computedStats = useMemo(() => {
    let critical = 0, moderate = 0, healthy = 0;

    students.forEach(s => {
      const score = s?.currentRiskScore ?? 0;
      if (score === 3) critical++;
      else if (score === 2) moderate++;
      else healthy++;
    });

    return {
      totalStudents: students.length,
      criticalCount: critical,
      moderateCount: moderate,
      healthyCount: healthy,
    };
  }, [students]);

  // ===============================
  // ✅ PIE DATA (ALREADY GOOD, SAFETY ADDED)
  // ===============================
  const riskPieData = useMemo(() => {
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0 };

    students.forEach(s => {
      const score = s?.currentRiskScore ?? 0;
      if (counts[score] !== undefined) counts[score]++;
    });

    return [
      { name: 'Minimal', value: counts[0], color: '#10B981' },
      { name: 'Mild', value: counts[1], color: '#FBBF24' },
      { name: 'Moderate', value: counts[2], color: '#F97316' },
      { name: 'Critical', value: counts[3], color: '#EF4444' },
    ];
  }, [students]);

  // COURSE STATS 
  const computedCourseStats = useMemo(() => {
    const map = {};

    students.forEach(s => {
      if (!s) return;

      const course = s.course || "Unknown";

      if (!map[course]) {
        map[course] = {
          _id: course,
          count: 0,
          criticalCount: 0,
        };
      }

      map[course].count++;

      if ((s.currentRiskScore ?? 0) === 3) {
        map[course].criticalCount++;
      }
    });

    return Object.values(map);
  }, [students]);

  // ===============================
  // ✅ HELPERS (SAFE)
  // ===============================
  const getRiskColor = (score) => {
    return {
      0: '#10B981',
      1: '#FBBF24',
      2: '#F97316',
      3: '#EF4444',
    }[score] || '#6B7280';
  };

  const getRiskLabel = (score) => {
    return {
      0: 'Minimal',
      1: 'Mild',
      2: 'Moderate',
      3: 'Critical',
    }[score] || 'Unknown';
  };

  return (
    <div className="min-h-screen app-bg text-white pb-12">
      {/* GLASS NAV */}
      <nav className="glass sticky top-0 z-50 p-4 mb-6 rounded-none border-b-0 shadow-2xl">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Admin Intelligence</h1>
            <p className="text-xs text-indigo-100 opacity-70">Logged in as {user?.email}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition border border-white/20">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {/* STATS ROW - Using .glass for each card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Students" value={computedStats.totalStudents} icon={Users} color="text-white" />
          <StatCard title="Critical Cases" value={computedStats.criticalCount} icon={AlertCircle} color="text-red-400" />
          <StatCard title="Moderate Risk" value={computedStats.moderateCount} icon={TrendingUp} color="text-orange-400" />
          <StatCard title="Healthy" value={computedStats.healthyCount} icon={Award} color="text-green-400" />
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-strong p-6">
            <h2 className="text-lg font-bold mb-4 text-indigo-50">Risk Distribution</h2>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {riskPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff' }} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-strong p-6">
            <h2 className="text-lg font-bold mb-4 text-indigo-50">Risk by Course</h2>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={computedCourseStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="course" stroke="rgba(255,255,255,0.5)" fontSize={10} tick={{fill: '#fff'}} />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} tick={{fill: '#fff'}} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                        <Bar dataKey="criticalCount" fill="#EF4444" radius={[4, 4, 0, 0]} name="Critical" />
                        <Bar dataKey="count" fill="rgba(255,255,255,0.3)" radius={[4, 4, 0, 0]} name="Total" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* STUDENT DIRECTORY - Large Glass Container */}
        <div className="glass p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-xl font-bold">Student Directory</h2>
            <button onClick={() => navigate('/admin/add-student')} className="flex items-center gap-2 bg-white text-indigo-700 px-5 py-2 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg">
              <Plus size={18} /> Add Student
            </button>
          </div>

          {/* GLASS FILTERS */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-white placeholder:text-white/30"
                />
            </div>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-white/20 text-white"
            >
              <option value="all">All Risk Levels</option>
              <option value="3">Critical (3)</option>
              <option value="2">Moderate (2)</option>
              <option value="1">Low Risk (1)</option>
              <option value="0">Healthy (0)</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-4 text-xs uppercase tracking-wider text-white/50 font-bold">Student ID</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-wider text-white/50 font-bold">Name</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-wider text-white/50 font-bold">Course</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-wider text-white/50 font-bold">Risk Status</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-wider text-white/50 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                    <tr key={student.id} className="group hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 text-sm font-mono opacity-70">{student.studentId}</td>
                        <td className="px-4 py-4">
                            <div className="font-bold">{student.name}</div>
                            <div className="text-xs opacity-50">{student.userId?.email || student.email}</div>
                        </td>
                        <td className="px-4 py-4 text-sm">{student.course}</td>
                        <td className="px-4 py-4">
                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter text-white" style={{ backgroundColor: getRiskColor(student.currentRiskScore || 0) }}>
                                {getRiskLabel(student.currentRiskScore || 0)} ({student.currentRiskScore || 0})
                            </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                            <button onClick={() => handleDeleteStudent(student.id, student.name)} className="text-white/30 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition">
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="text-center py-12 text-white/40 italic">No results match your filters.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass-strong p-6 glass-hover group">
    <div className="flex justify-between items-start">
        <div>
            <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
            <p className={`text-3xl font-black ${color} drop-shadow-md`}>{value || 0}</p>
        </div>
        <div className={`p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform ${color.replace('text-', 'bg-')}/10`}>
            <Icon size={24} />
        </div>
    </div>
  </div>
);

export default AdminDashboard;