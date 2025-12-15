/**
 * src/context/AuthContext.jsx
 * Authentication Context Provider
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
          // Verify token is still valid
          await authAPI.verifyToken();
          const userObj = JSON.parse(savedUser);
          setUser(userObj);
          setIsAuthenticated(true);

          // If student, fetch profile
          if (userObj.role === 'student') {
            const response = await studentAPI.getMyProfile();
            setStudent(response.student);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
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
      const token = response.token;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      // If student, save profile
      if (userData.role === 'student' && response.student) {
        setStudent(response.student);
      }

      toast.success('Login successful!');
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
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
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    login,
    logout,
    updateStudentProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};