import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminStats from './pages/AdminStats';
import Transfer from './pages/Transfer';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import LandingPage from './pages/LandingPage';
import Notifications from './pages/Notifications';
import { AuthProvider, useAuth } from './context/AuthContext';
import RestorationManager from './components/RestorationManager';
import LoadingScreen from './components/LoadingScreen';

/**
 * Enhanced ProtectedRoute that uses the themed LoadingScreen during auth checks.
 */
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen message="Checking authentication status..." />;
  if (!user) return <Navigate to="/login" />;
  
  // If a specific role is required and mismatch
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} />;
  }

  // If no specific role is required but user is ADMIN, steer them to admin console by default 
  if (!role && user.role === 'ADMIN') {
    return <Navigate to="/admin" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <RestorationManager>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute role="USER">
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/transfer" element={
              <ProtectedRoute role="USER">
                <Transfer />
              </ProtectedRoute>
            } />
            
            <Route path="/transactions" element={
              <ProtectedRoute role="USER">
                <Transactions />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/stats" element={
              <ProtectedRoute role="ADMIN">
                <AdminStats />
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute role="USER">
                <Notifications />
              </ProtectedRoute>
            } />

            <Route path="/" element={<LandingPage />} />
          </Routes>
        </RestorationManager>
      </AuthProvider>
    </Router>
  );
}

export default App;
