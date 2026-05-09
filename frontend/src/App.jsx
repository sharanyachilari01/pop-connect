import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BankDetailsSetup from './pages/BankDetailsSetup';
import Users from './pages/Users';
import Lectures from './pages/Lectures';
import Reports from './pages/Reports';
import Attendance from './pages/Attendance';
import Honorariums from './pages/Honorariums';

const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-bold">Loading POP CONNECT...</div>;
  }

  // Force PoP/AssistantPoP to add bank details if not entered
  const needsBankDetails = user && (user.role === 'PoP' || user.role === 'AssistantPoP') && !user.hasBankDetails;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={needsBankDetails ? "/setup" : "/dashboard"} replace />} />
      
      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
        {/* If needs bank details, force them here */}
        {needsBankDetails ? (
          <>
            <Route path="/setup" element={<BankDetailsSetup />} />
            <Route path="*" element={<Navigate to="/setup" replace />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* These routes are implemented */}
            <Route path="/users" element={<Users />} />
            <Route path="/lectures" element={<Lectures />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/honorariums" element={<Honorariums />} />
          </Route>
        )}
      </Route>
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
