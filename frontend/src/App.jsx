/**
 * src/App.jsx
 * Main Application Component with Routing
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import StudentDashboard from './pages/StudentDashboard';
import WellnessAssessment from './pages/WellnessAssessment';
import SupportTicketForm from './pages/SupportTicketForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(20, 16, 50, 0.92)',
                backdropFilter: 'blur(16px)',
                color: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                fontSize: '0.875rem',
                fontFamily: "'Sora', system-ui, sans-serif",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: 'rgba(20, 16, 50, 0.92)',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#f87171',
                  secondary: 'rgba(20, 16, 50, 0.92)',
                },
              },
            }}
          />

          {/* Routes */}
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-student"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AddStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-student/:id"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <EditStudent />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assessment"
              element={
                <ProtectedRoute>
                  <WellnessAssessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/support"
              element={
                <ProtectedRoute>
                  <SupportTicketForm />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;