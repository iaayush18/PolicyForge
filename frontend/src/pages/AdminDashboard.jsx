/**
 * src/pages/AdminDashboard.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, studentAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Users, AlertCircle, TrendingUp, Award, LogOut, Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, studentsRes, courseRes] = await Promise.all([
        dashboardAPI.getStats(),
        studentAPI.getAll(),
        dashboardAPI.getByCourse(),
      ]);

      // 🔍 DEBUGGING LOGS (Check Console F12)
      console.log("Stats Response:", statsRes);
      console.log("Students Response:", studentsRes); // Check if this has .data or .students
      console.log("Course Response:", courseRes);

      setStats(statsRes.stats);
      
      // ✅ FIX: Use .data instead of .students if your controller sends 'data'
      const studentList = studentsRes.data || studentsRes.students || [];
      setStudents(studentList);
      
      setCourseStats(courseRes.data || []); 
    } catch (error) {
      console.error(error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await studentAPI.delete(id);
      toast.success('Student deleted successfully');
      loadDashboardData();
    } catch (error) {
      toast.error('Error deleting student');
    }
  };

  const getRiskColor = (score) => {
    const colors = { 0: '#10B981', 1: '#FBBF24', 2: '#F97316', 3: '#EF4444' };
    return colors[score] || '#6B7280';
  };

  const getRiskLabel = (score) => {
    const labels = { 0: 'Minimal', 1: 'Mild', 2: 'Moderate', 3: 'Critical' };
    return labels[score] || 'Unknown';
  };

  // ==========================================
  // 🔍 ROBUST SEARCH FILTER
  // ==========================================
  const filteredStudents = (students || [])
    .filter((student) => {
        // 1. Risk Filter
        if (filterRisk !== 'all') {
            const risk = student.currentRiskScore !== undefined ? student.currentRiskScore : 0;
            if (risk !== parseInt(filterRisk)) return false;
        }

        // 2. Search Filter
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            const name = (student.name || '').toLowerCase();
            const studentId = (student.studentId || '').toLowerCase();
            const email = (student.email || student.userId?.email || '').toLowerCase();
            
            return name.includes(term) || studentId.includes(term) || email.includes(term);
        }

        return true;
    })
    .sort((a, b) => (b.currentRiskScore || 0) - (a.currentRiskScore || 0));

  // ==========================================
  // 📊 ROBUST PIE CHART CALCULATION
  // ==========================================
  const calculatePieData = () => {
    if (!students || students.length === 0) return [];

    const counts = { 0: 0, 1: 0, 2: 0, 3: 0 };

    students.forEach(student => {
        // Handle null/undefined risk scores (default to 0)
        let score = student.currentRiskScore;
        if (score === undefined || score === null) score = 0;
        if (counts[score] !== undefined) counts[score]++;
    });

    // Only return data if there is at least one student
    const hasData = Object.values(counts).some(val => val > 0);
    if (!hasData && students.length > 0) {
        // If students exist but all have weird scores, show them as healthy (0)
        return [{ name: 'Healthy', value: students.length, color: '#10B981' }];
    }

    return [
        { name: 'Healthy', value: counts[0], color: '#10B981' },
        { name: 'Low Risk', value: counts[1], color: '#FBBF24' },
        { name: 'Moderate', value: counts[2], color: '#F97316' },
        { name: 'Critical', value: counts[3], color: '#EF4444' },
    ];
  };

  const riskData = calculatePieData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-indigo-200">Welcome, {user?.email}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 bg-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-800 transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} color="text-gray-800" />
          <StatCard title="Critical Cases" value={stats?.criticalCount || 0} icon={AlertCircle} color="text-red-600" />
          <StatCard title="Moderate Risk" value={stats?.moderateCount || 0} icon={TrendingUp} color="text-orange-600" />
          <StatCard title="Healthy / Low" value={stats?.healthyCount || 0} icon={Award} color="text-green-600" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Risk Distribution</h2>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={riskData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {riskData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Risk by Course</h2>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={courseStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" angle={-45} textAnchor="end" height={60} fontSize={10} interval={0} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="criticalCount" fill="#EF4444" name="Critical Cases" />
                        <Bar dataKey="count" fill="#6366f1" name="Total Students" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Students Table Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Student Directory</h2>
            <button onClick={() => navigate('/admin/add-student')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              <Plus size={18} /> Add Student
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, ID or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
            >
              <option value="all">All Risk Levels</option>
              <option value="3">Critical (3)</option>
              <option value="2">Moderate (2)</option>
              <option value="1">Low Risk (1)</option>
              <option value="0">Healthy (0)</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">CGPA</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Risk</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                    <tr key={student._id || student.id} className="border-t hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{student.studentId}</td>
                        <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{student.userId?.email || student.email}</td>
                        <td className="px-4 py-3 text-sm">{student.course}</td>
                        <td className="px-4 py-3 text-sm">{student.cgpa}</td>
                        <td className="px-4 py-3">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap" style={{ backgroundColor: getRiskColor(student.currentRiskScore || 0) }}>
                                {(student.currentRiskScore || 0)} - {getRiskLabel(student.currentRiskScore || 0)}
                            </span>
                        </td>
                        <td className="px-4 py-3">
                            <button onClick={() => handleDeleteStudent(student._id || student.id, student.name)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Delete">
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="7" className="text-center py-8 text-gray-500">No students found matching your criteria.</td>
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

// Simple helper component for stats
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className="flex justify-between items-center">
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={color.replace('text-', 'text-opacity-100 ')} size={40} />
    </div>
  </div>
);

export default AdminDashboard;