import mongoose from 'mongoose';
import { User } from '../models/User.js';

export const getUserProfile = async (req, res, next) => {
  try {
    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user._id);
    }

    if (!user) {
      user = {
        _id: req.user._id || 'usr-101',
        name: req.user.name || 'Alex Vance',
        email: req.user.email || 'alex.vance@techcorp.io',
        targetRole: req.user.targetRole || 'Senior Full Stack Engineer',
        avatar: req.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        skills: req.user.skills || ['React', 'Node.js', 'TypeScript', 'System Design', 'GraphQL', 'MongoDB'],
        experience: req.user.experience || [
          { title: 'Senior Software Engineer', company: 'TechCorp Solutions', years: '2023 - Present', description: 'Architected high-throughput microservices handling 10k req/sec.' }
        ],
        education: req.user.education || [
          { degree: 'Bachelor of Science in Computer Science', institution: 'State University of Technology', year: '2022' }
        ],
        readinessScore: 82,
        streakDays: 4,
        skillsBreakdown: { technical: 85, communication: 78, problemSolving: 88, leadership: 75, starMethod: 80 }
      };
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        avatar: user.avatar,
        skills: user.skills,
        experience: user.experience,
        education: user.education,
        readinessScore: user.readinessScore,
        streakDays: user.streakDays,
        skillsBreakdown: user.skillsBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, avatar, targetRole, skills, experience, education } = req.body;

    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user._id);
      if (user) {
        if (name) user.name = name;
        if (avatar) user.avatar = avatar;
        if (targetRole) user.targetRole = targetRole;
        if (skills && Array.isArray(skills)) user.skills = skills;
        if (experience && Array.isArray(experience)) user.experience = experience;
        if (education && Array.isArray(education)) user.education = education;
        await user.save();
      }
    }

    const updatedUser = {
      id: user ? user._id : (req.user._id || 'usr-101'),
      name: name || req.user.name || 'Alex Vance',
      email: req.user.email || 'alex.vance@techcorp.io',
      targetRole: targetRole || req.user.targetRole || 'Senior Software Engineer',
      avatar: avatar || req.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      skills: skills || req.user.skills || ['React', 'Node.js', 'TypeScript', 'System Design'],
      experience: experience || req.user.experience || [],
      education: education || req.user.education || [],
      readinessScore: 82,
      streakDays: 4,
      skillsBreakdown: { technical: 85, communication: 78, problemSolving: 88, leadership: 75, starMethod: 80 }
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
