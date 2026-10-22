import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

const MOCK_USER = {
  id: 'usr-101',
  name: 'Alex Vance',
  email: 'alex.vance@techcorp.io',
  targetRole: 'Senior Full Stack Engineer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  skills: ['React', 'Node.js', 'TypeScript', 'System Design', 'GraphQL', 'MongoDB', 'PostgreSQL'],
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp Solutions',
      years: '2023 - Present',
      description: 'Architected high-throughput microservices handling 10k req/sec with GraphQL & Redis.'
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'State University of Technology',
      year: '2022'
    }
  ],
  readinessScore: 82,
  streakDays: 4,
  savedResumesCount: 2,
  completedInterviewsCount: 3,
  skillsBreakdown: {
    technical: 85,
    communication: 78,
    problemSolving: 88,
    leadership: 75,
    starMethod: 80
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('careerelevate_token');
    const saved = localStorage.getItem('careerelevate_user');
    if (token && saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('careerelevate_token');
    return Boolean(token);
  });

  const [activeResume, setActiveResume] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState(() => {
    const savedHist = localStorage.getItem('careerelevate_interviews');
    if (savedHist) {
      try { return JSON.parse(savedHist); } catch { /* fallthrough */ }
    }
    // Seed with one real-looking session so dashboard shows data right away
    return [
      {
        id: 'sess-1',
        date: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        role: 'Full Stack Engineer',
        score: 86,
        questionsCount: 4,
        feedbackSummary: 'Excellent technical depth on System Design; ensure STAR framework structure for behavioral questions.',
      }
    ];
  });

  // Verify session on mount with the backend
  useEffect(() => {
    const token = localStorage.getItem('careerelevate_token');
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    let isMounted = true;
    api.getUserProfile().then((res) => {
      if (!isMounted) return;
      if (res && res.success && res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
        localStorage.setItem('careerelevate_user', JSON.stringify(res.user));
      } else if (res && res.status === 401) {
        // Expired or invalid token
        localStorage.removeItem('careerelevate_token');
        localStorage.removeItem('careerelevate_user');
        localStorage.removeItem('careerelevate_auth');
        setUser(null);
        setIsAuthenticated(false);
      }
    }).catch(() => {
      // Network hiccup - retain cached user if present
    });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('careerelevate_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('careerelevate_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('careerelevate_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('careerelevate_interviews', JSON.stringify(interviewHistory));
  }, [interviewHistory]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    // Two-step login requirement: Password validated, backend issued OTP challenge
    if (res && res.success && (res.requiresOtp || res.step === 'verify-otp')) {
      // Do NOT set isAuthenticated or token here!
      return {
        success: true,
        step: 'verify-otp',
        requiresOtp: true,
        email: res.email || email,
        challengeId: res.challengeId,
        message: res.message
      };
    } else if (res && res.success && res.token) {
      // Direct token returned (if any)
      localStorage.setItem('careerelevate_token', res.token);
      setUser(res.user);
      setIsAuthenticated(true);
      return { success: true };
    } else {
      return { success: false, message: res?.message || 'Invalid email or password.' };
    }
  };

  const register = async (name, email, password, targetRole) => {
    return await api.register(name, email, password, targetRole);
  };

  const verifyOTP = async (email, otp, challengeId) => {
    const res = await api.verifyOTP(email, otp, challengeId);
    if (res && res.success && res.token) {
      localStorage.setItem('careerelevate_token', res.token);
      setUser(res.user);
      setIsAuthenticated(true);
    }
    return res;
  };

  const resendOTP = async (email, challengeId) => {
    return await api.resendOTP(email, challengeId);
  };

  const forgotPassword = async (email) => {
    return await api.forgotPassword(email);
  };

  const resetPassword = async (email, token, newPassword) => {
    return await api.resetPassword(email, token, newPassword);
  };

  const loginAsDemo = () => {
    if (import.meta.env.PROD) {
      console.warn('Demo login is disabled in production.');
      return;
    }
    localStorage.setItem('careerelevate_token', 'demo-dev-session-token');
    setUser(MOCK_USER);
    setIsAuthenticated(true);
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateUserProfile(profileData);
    if (res && res.user) {
      setUser(prev => ({
        ...prev,
        ...res.user
      }));
      return { success: true, message: 'Profile updated successfully!' };
    }
    return { success: false, message: 'Failed to update profile' };
  };

  const logout = () => {
    localStorage.removeItem('careerelevate_token');
    localStorage.removeItem('careerelevate_user');
    localStorage.removeItem('careerelevate_auth');
    setUser(null);
    setIsAuthenticated(false);
  };

  const addInterviewSession = (session) => {
    const enriched = {
      ...session,
      createdAt: session.createdAt || new Date().toISOString(),
      date: session.date || new Date().toISOString(),
    };
    setInterviewHistory(prev => [enriched, ...prev]);
    setUser(prev => ({
      ...prev,
      completedInterviewsCount: (prev.completedInterviewsCount || 0) + 1,
      readinessScore: Math.min(98, (prev.readinessScore || 75) + 2)
    }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      login,
      register,
      verifyOTP,
      resendOTP,
      forgotPassword,
      resetPassword,
      updateProfile,
      loginAsDemo,
      logout,
      activeResume,
      setActiveResume,
      interviewHistory,
      addInterviewSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
