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
    const saved = localStorage.getItem('careerelevate_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('careerelevate_auth');
    return savedAuth ? JSON.parse(savedAuth) : true;
  });

  const [activeResume, setActiveResume] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState(() => {
    const savedHist = localStorage.getItem('careerelevate_interviews');
    return savedHist ? JSON.parse(savedHist) : [
      {
        id: 'sess-1',
        date: '2026-07-28',
        role: 'Full Stack Engineer',
        score: 86,
        questionsCount: 4,
        feedbackSummary: 'Excellent technical depth on System Design; ensure STAR framework structure for behavioral questions.'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('careerelevate_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('careerelevate_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('careerelevate_interviews', JSON.stringify(interviewHistory));
  }, [interviewHistory]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res && res.success) {
      if (res.token) localStorage.setItem('careerelevate_token', res.token);
      const loggedUser = {
        ...MOCK_USER,
        ...res.user,
        email: email || MOCK_USER.email,
        name: res.user?.name || email.split('@')[0].toUpperCase()
      };
      setUser(loggedUser);
      setIsAuthenticated(true);
      return { success: true };
    } else if (res && res.requiresVerification) {
      return { success: false, requiresVerification: true, message: res.message, email: res.email };
    } else {
      return { success: false, message: res?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password, targetRole) => {
    return await api.register(name, email, password, targetRole);
  };

  const verifyOTP = async (email, otp) => {
    const res = await api.verifyOTP(email, otp);
    if (res && res.success) {
      if (res.token) localStorage.setItem('careerelevate_token', res.token);
      const loggedUser = {
        ...MOCK_USER,
        ...res.user,
        email: email || MOCK_USER.email
      };
      setUser(loggedUser);
      setIsAuthenticated(true);
    }
    return res;
  };

  const resendOTP = async (email) => {
    return await api.resendOTP(email);
  };

  const forgotPassword = async (email) => {
    return await api.forgotPassword(email);
  };

  const resetPassword = async (email, token, newPassword) => {
    return await api.resetPassword(email, token, newPassword);
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
    setIsAuthenticated(false);
  };

  const addInterviewSession = (session) => {
    setInterviewHistory(prev => [session, ...prev]);
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
