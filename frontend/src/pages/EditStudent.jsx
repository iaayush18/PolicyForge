/**
 * src/pages/EditStudent.jsx
 * Edit Student Demographics (Admin Only)
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
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await studentAPI.update(id, formData);
      toast.success('Student updated successfully!');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 hover:bg-indigo-700 px-3 py-2 rounded-lg transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold">Edit Student Demographics</h1>
            <p className="text-sm text-indigo-200">{student?.studentId} - {student?.name}</p>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Readonly Fields */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Student Information</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Student ID:</span>
                  <span className="ml-2 font-semibold">{student?.studentId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-semibold">{student?.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Current Risk Score:</span>
                  <span className="ml-2 font-semibold">{student?.currentRiskScore}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Assessments:</span>
                  <span className="ml-2 font-semibold">{student?.totalAssessments}</span>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="15"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course/Degree *
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CGPA *
                </label>
                <input
                  type="number"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="text-yellow-600 flex-shrink-0" size={24} />
              <div>
                <p className="font-semibold text-yellow-800 mb-1">Important Notice</p>
                <p className="text-sm text-yellow-700">
                  PHQ-9 assessment answers <strong>cannot be edited</strong> by administrators. 
                  Students must update their own mental health assessments. You can only modify 
                  demographic information (name, age, course, CGPA).
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
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