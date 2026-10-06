import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bdl_user');
    return saved ? JSON.parse(saved) : {
      name: 'Aarav Mehta',
      email: 'member@braindock.com',
      role: 'Member',
      memberId: 'BDL-MEM-8842',
      membershipPlan: 'Premium Scholar',
      membershipStatus: 'Active',
      finesDue: 0,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      phone: '+91 91234 56789'
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('bdl_token') || 'demo_token');
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bdl_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bdl_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('bdl_token', token);
    } else {
      localStorage.removeItem('bdl_token');
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      // Fallback demo login if server is unreachable
      if (email.toLowerCase().includes('admin')) {
        const u = {
          name: 'Dr. Keval Patel (Director)',
          email: 'admin@braindock.com',
          role: 'Super Admin',
          memberId: 'BDL-DIR-001',
          membershipPlan: 'Institutional VIP',
          membershipStatus: 'Active',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
        };
        setUser(u);
        setToken('token_' + Date.now());
        return { success: true };
      }
      const u = {
        name: 'Aarav Mehta',
        email,
        role: 'Member',
        memberId: 'BDL-MEM-8842',
        membershipPlan: 'Premium Scholar',
        membershipStatus: 'Active',
        finesDue: 0,
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
      };
      setUser(u);
      setToken('token_' + Date.now());
      return { success: true };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const u = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: 'Member',
        memberId: `BDL-MEM-${Math.floor(1000 + Math.random() * 9000)}`,
        membershipPlan: userData.membershipPlan || 'First 50 Admissions Offer',
        membershipStatus: 'Active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
      };
      setUser(u);
      setToken('token_' + Date.now());
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bdl_user');
    localStorage.removeItem('bdl_token');
  };

  const updateProfile = (data) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, unreadNotifications, setUnreadNotifications }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
