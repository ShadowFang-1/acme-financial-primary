import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Force the API to hit the backend directly on Render
// This bypasses the need for complex proxy rules and makes it 100% reliable
axios.defaults.baseURL = 'https://acme-financial-backend.onrender.com';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      try {
        // Step 1: 'Is Awake' Sync - Ensure backend is responsive before checking auth
        // This prevents the 'blank white screen' during Render cold starts
        await axios.get('/api/v1/status');
        
        // Step 2: Initialize Auth if token exists
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get('/api/v1/users/me');
          const userData = { 
            username: res.data.username, 
            role: res.data.role, 
            email: res.data.email, 
            imageUrl: res.data.imageUrl,
            pushNotifications: res.data.pushNotifications,
            emailAlerts: res.data.emailAlerts,
            loginNotifications: res.data.loginNotifications
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        console.warn("[Antigravity] Initial sync or auth check failed:", err.message);
        if (token) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (identifier, password) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    try {
      const response = await axios.post('/api/v1/auth/authenticate', { identifier, password });
      if (response.data.requiresOtp) {
        return response.data; // Return the response to the Login page to handle OTP
      }
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set header here
      localStorage.setItem('user', JSON.stringify(userData)); // Store user data
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const verifyOtp = async (identifier, otp) => {
    try {
      const response = await axios.post('/api/v1/auth/verify-otp', { identifier, otp });
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set header here
      localStorage.setItem('user', JSON.stringify(userData)); // Store user data
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('OTP Verification error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/v1/auth/forgot-password', { email });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      await axios.post('/api/v1/auth/reset-password', { email, otp, newPassword });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const sendOtpManual = async (identifier, email) => {
    try {
      await axios.post('/api/v1/auth/send-otp', { identifier, otp: email }); // Backend reuse OtpVerificationRequest
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  };

  const sendOtp = async (identifier, phoneNumber) => {
    try {
      await axios.post('/api/v1/auth/send-otp', { identifier, otp: phoneNumber }); // Re-using otp field for phoneNumber
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  };

  const register = async (username, email, password, phoneNumber, country, dateOfBirth) => {
    try {
      const response = await axios.post('/api/v1/auth/register', { username, email, password, phoneNumber, country, dateOfBirth });
      if (response.data.requiresOtp) {
        return response.data;
      }
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return userData;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, verifyOtp, sendOtp, forgotPassword, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
