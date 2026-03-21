import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

/**
 * RestorationManager handles the 'Is Awake' Sync and 'Session Preservation' strategy.
 * It checks the backend status on mount and ensures the user lands on their previous route if refreshed.
 */
const RestorationManager = ({ children }) => {
  const [isAwake, setIsAwake] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Session Preservation Logic:
    // Store the current route in sessionStorage whenever it changes, EXCEPT for auth/landing pages
    const saveCurrentRoute = () => {
      const excludedRoutes = ['/', '/login', '/register', '/forgot-password'];
      if (!excludedRoutes.includes(location.pathname)) {
        sessionStorage.setItem('securepay_last_route', location.pathname);
      }
    };

    saveCurrentRoute();

    // Restoration Strategy on Mount:
    const restoreSession = async () => {
      const startTime = Date.now();
      
      // If the server takes > 3 seconds, show the themed SecurePay loading screen
      const coldServerTimer = setTimeout(() => {
        setShowLoadingScreen(true);
      }, 3000);

      try {
        // 'Is Awake' Sync Check against lightweight endpoint
        const response = await axios.get('/api/v1/status');
        const latency = Date.now() - startTime;
        
        console.log(`[Antigravity] Backend responded in ${latency}ms at ${response.data.timestamp}`);
        
        // Clear loader and mark backend as awake
        clearTimeout(coldServerTimer);
        setShowLoadingScreen(false);
        setIsAwake(true);

        // Landing Logic: Restore saved route if user lands on '/' and has a session-saved route
        const savedRoute = sessionStorage.getItem('securepay_last_route');
        if (savedRoute && location.pathname === '/') {
          console.log(`[Antigravity] Restoring session to path: ${savedRoute}`);
          navigate(savedRoute, { replace: true });
        }
      } catch (err) {
        console.warn("[Antigravity] Status check failed. Continuing with background pings.", err);
        clearTimeout(coldServerTimer);
        setShowLoadingScreen(false);
        setIsAwake(true); // Don't block UI if status check fails
      }
    };

    restoreSession();
  }, [navigate]); // Intentionally only runs once on primary mount of Manager

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

  if (showLoadingScreen) {
    return <LoadingScreen message="SecurePay: Awakening backend services..." />;
  }

  return children;
};

export default RestorationManager;
