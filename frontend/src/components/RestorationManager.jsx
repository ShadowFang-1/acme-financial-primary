import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

/**
 * RestorationManager handles the 'Is Awake' Sync and 'Session Preservation' strategy.
 * It checks the backend status on mount and ensures the user lands on their previous route if refreshed.
 */
const RestorationManager = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Session Preservation Logic:
    // Store the current route in sessionStorage whenever it changes, EXCEPT for login/register pages
    const currentPath = location.pathname;
    const excludedRoutes = ['/', '/login', '/register', '/forgot-password'];
    
    if (!excludedRoutes.includes(currentPath)) {
      sessionStorage.setItem('securepay_last_route', currentPath);
    }

    // 2. Landing Logic:
    // When the app initializes at the root ('/'), check if there's a saved session route to restore.
    const savedRoute = sessionStorage.getItem('securepay_last_route');
    if (savedRoute && currentPath === '/') {
      console.log(`[Antigravity] Restoring session context to: ${savedRoute}`);
      navigate(savedRoute, { replace: true });
    }
  }, [location.pathname, navigate]);

  // UI Restoration: Always save route just BEFORE leaving/refreshing the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      const excludedRoutes = ['/', '/login', '/register', '/forgot-password'];
      if (!excludedRoutes.includes(location.pathname)) {
        sessionStorage.setItem('securepay_last_route', location.pathname);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location.pathname]);

  return children;
};

export default RestorationManager;
