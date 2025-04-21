import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { PrivateRoute } from './components/PrivateRoute';
import Records from './pages/Records';
import SharedAccess from './pages/SharedAccess';
import RoleManagement from './components/RoleManagement';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';

const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/records"
          element={
            <PrivateRoute>
              <Records />
            </PrivateRoute>
          }
        />
        <Route
          path="/shared"
          element={
            <PrivateRoute>
              <SharedAccess />
            </PrivateRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <PrivateRoute>
              <RoleManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

export default AppRoutes; 