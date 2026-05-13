/**
 * src/pages/AddStudent.jsx
 * Migrated for Prisma & Glassmorphism
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import { ArrowLeft, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const AddStudent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: 'Welcome123',
    studentId: '',
    name: '',
    age: 18,
    gender: 'Male',
    course: '',
    cgpa: 0,
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // ✅ CRITICAL: Postgres is strictly typed. Convert age and cgpa to numbers.
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'cgpa' ? parseFloat(value) : value,
    }));
  }, []);

  const isFormValid = useMemo(() => {
    return (
      formData.email &&
      formData.studentId &&
      formData.name &&
      formData.course &&
      formData.age >= 15
    );
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);

    try {
      // This triggers the Prisma transaction: User creation -> Student creation
      await studentAPI.create(formData);
      toast.success('Student account & profile created!');
      navigate('/admin');
    } catch (error) {
      const message = error.response?.data?.message || 'Error adding student';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isFormValid, navigate]);

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
          <h1 className="text-xl font-bold tracking-tight text-white">Enroll New Student</h1>
        </div>
      </nav>

      <div className="container mx-auto p-4 max-w-2xl">
        <div className="glass-strong p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
              <UserPlus className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Registration</h2>
              <p className="text-xs text-indigo-100/60 uppercase tracking-widest font-semibold">Creating System Credentials</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">Student ID (University ID)</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-white transition-all placeholder:text-white/20"
                  placeholder="e.g., STU2026-X"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-white transition-all"
                  placeholder="Legal name of student"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-white transition-all"
                  placeholder="student@uni.edu"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">Temporary Password</label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
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
                  min="15"
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
                <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">Course</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-white transition-all"
                  placeholder="e.g., AI & Data Science"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">CGPA</label>
                <input
                  type="number"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-white transition-all"
                  placeholder="Current Score"
                  required
                />
              </div>
            </div>

            <div className="bg-indigo-900/30 border border-white/10 rounded-2xl p-4 mt-8">
              <p className="text-xs text-indigo-100 opacity-80 leading-relaxed">
                <strong>Note:</strong> New accounts are initialized with a 0 risk score. The student must log in to provide their first mental health assessment.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 border border-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="flex-1 bg-white text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-50 transition transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-700"></div>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Enroll Student
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

export default AddStudent;