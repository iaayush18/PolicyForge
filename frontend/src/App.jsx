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
import PHQ9Assessment from './pages/PHQ9Assessment';

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
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
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
                  <PHQ9Assessment />
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