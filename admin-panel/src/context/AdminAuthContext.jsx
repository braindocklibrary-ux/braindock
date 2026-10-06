import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem('bdl_super_admin_token') || null;
  });

  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('bdl_super_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Fallback staff representation for components expecting currentStaff
  const currentStaff = adminUser || {
    name: 'Super Admin',
    role: 'Super Admin',
    email: 'admin@braindock.com',
    memberId: 'BDL-DIR-001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
  };

  const isAuthenticated = Boolean(adminToken && adminUser);

  // Authenticate Super Admin via backend
  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      setAuthLoading(false);

      if (data.success && data.token) {
        setAdminToken(data.token);
        setAdminUser(data.user);
        localStorage.setItem('bdl_super_admin_token', data.token);
        localStorage.setItem('bdl_super_admin_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        const errorMsg = data.message || 'Login failed. Invalid Super Admin credentials.';
        setAuthError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      setAuthLoading(false);
      const errorMsg = 'Unable to connect to Admin authentication server. Please ensure backend is running.';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Secure Super Admin Logout
  const logout = () => {
    setAdminToken(null);
    setAdminUser(null);
    setAuthError('');
    localStorage.removeItem('bdl_super_admin_token');
    localStorage.removeItem('bdl_super_admin_user');
  };

  // Only Super Admin has access, so all permissions are unconditionally granted
  const hasPermission = () => true;

  // Mobile Responsive Drawer State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => setMobileSidebarOpen(prev => !prev);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <AdminAuthContext.Provider value={{
      adminUser,
      adminToken,
      currentStaff,
      isAuthenticated,
      authLoading,
      authError,
      setAuthError,
      login,
      logout,
      hasPermission,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      toggleMobileSidebar,
      closeMobileSidebar
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
