/**
 * src/context/AuthContext.jsx
 * Authentication Context Provider - Migrated for Prisma
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, studentAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // 1. Verify token is still valid with the backend
          await authAPI.verifyToken();
          const userObj = JSON.parse(savedUser);
          setUser(userObj);
          setIsAuthenticated(true);

          // 2. Postgres Enum Check: role is now 'STUDENT' (uppercase)
          if (userObj.role?.toUpperCase() === 'STUDENT') {
            const response = await studentAPI.getMyProfile();
            // student.service.js returns { student, latestAssessment }
            setStudent(response.student);
          }
        } catch (error) {
          console.error('Session restoration failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const userData = response.user;

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      // ✅ FIX: Fetch profile immediately if the user is a student
      if (userData.role?.toUpperCase() === 'STUDENT') {
        const profileRes = await studentAPI.getMyProfile();
        setStudent(profileRes.student);
      }

      toast.success('Login successful!');
      return { success: true, user: userData };
    } catch (error) {  
     const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message }; }
  };


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setStudent(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateStudentProfile = (updatedStudent) => {
    setStudent(updatedStudent);
  };

  const value = {
    user,
    student,
    loading,
    isAuthenticated,
    // Helper getters updated for Postgres Enums
    isAdmin: user?.role?.toUpperCase() === 'ADMIN',
    isStudent: user?.role?.toUpperCase() === 'STUDENT',
    login,
    logout,
    updateStudentProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};