/**
 * src/pages/EditStudent.jsx
 * Migrated for Prisma & Glassmorphism
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentAPI } from '../services/api';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: 18,
    gender: 'Male',
    course: '',
    cgpa: 0,
  });

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      const response = await studentAPI.getById(id);
      const studentData = response.student;
      
      setStudent(studentData);
      setFormData({
        name: studentData.name,
        age: studentData.age,
        gender: studentData.gender,
        course: studentData.course,
        cgpa: studentData.cgpa,
      });
    } catch (error) {
      toast.error('Error loading student data');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'cgpa' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await studentAPI.update(id, formData);
      toast.success('Student demographics updated!');
      navigate('/admin');
    } catch (error) {
      const message = error.response?.data?.message || 'Error updating student';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center app-bg">
        <div className="glass p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white font-medium">Fetching Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg text-white pb-12">
      {/* Header */}
      <nav className="glass sticky top-0 z-50 p-4 mb-8 rounded-none border-b-0 shadow-xl">
        <div className="container mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition border border-white/20"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Edit Demographics</h1>
            <p className="text-xs text-indigo-100 opacity-70 uppercase tracking-widest">{student?.studentId} — {student?.name}</p>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4 max-w-2xl">
        <div className="glass-strong p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Readonly Info Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-4">Core Account Details</p>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="block opacity-50 text-[10px] uppercase font-bold">System ID</span>
                  <span className="font-mono text-indigo-100">{student?.studentId}</span>
                </div>
                <div>
                  <span className="block opacity-50 text-[10px] uppercase font-bold">Email Address</span>
                  {/* ✅ FIXED: Prisma nests email inside user object */}
                  <span className="font-semibold text-indigo-100 truncate block">{student?.user?.email}</span>
                </div>
                <div>
                  <span className="block opacity-50 text-[10px] uppercase font-bold">Current Risk</span>
                  <span className="font-bold text-red-400">{student?.currentRiskScore} / 3</span>
                </div>
                <div>
                  <span className="block opacity-50 text-[10px] uppercase font-bold">Total History</span>
                  <span className="font-bold">{student?.totalAssessments} Check-ins</span>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">Legal Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-white/20 text-white"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">Academic Course</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">Current CGPA</label>
                <input
                  type="number"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5 flex gap-4 mt-8">
              <AlertTriangle className="text-orange-400 flex-shrink-0" size={24} />
              <p className="text-xs text-orange-100/80 leading-relaxed">
                <strong className="text-orange-300 block mb-1 uppercase tracking-tighter">Restriction</strong>
                Mental health assessments are clinical data and cannot be modified by staff. Admin updates are limited to academic and demographic metadata only.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex-1 px-6 py-3 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 border border-white/10 transition"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-white text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-50 transition transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-700"></div>
                ) : (
                  <>
                    <Save size={20} />
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;