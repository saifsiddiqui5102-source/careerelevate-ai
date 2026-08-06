import React, { useState } from 'react';
import { User, Mail, Briefcase, Cpu, GraduationCap, Plus, Trash2, CheckCircle2, Save, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Senior Software Engineer');
  const [skills, setSkills] = useState(user?.skills || ['React', 'Node.js', 'TypeScript', 'System Design']);
  const [newSkill, setNewSkill] = useState('');

  const [experience, setExperience] = useState(user?.experience || [
    { title: 'Senior Software Engineer', company: 'TechCorp Solutions', years: '2023 - Present', description: 'Architected high-throughput microservices handling 10k req/sec.' }
  ]);

  const [education, setEducation] = useState(user?.education || [
    { degree: 'Bachelor of Science in Computer Science', institution: 'State University of Technology', year: '2022' }
  ]);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { title: 'Software Developer', company: 'Innovation Labs', years: '2021 - 2023', description: 'Developed React frontend components and REST APIs.' }
    ]);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, idx) => idx !== index));
  };

  const handleAddEducation = () => {
    setEducation([
      ...education,
      { degree: 'Master of Science in Software Engineering', institution: 'Tech Institute', year: '2024' }
    ]);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    const res = await updateProfile({
      name,
      avatar,
      targetRole,
      skills,
      experience,
      education
    });

    setLoading(false);
    if (res && res.success) {
      setSuccessMessage('✓ Candidate Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
          />
          <div className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Candidate Profile</span>
          </div>
          <h2 className="font-heading font-black text-3xl text-white">{name || 'Candidate Profile'}</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">{user?.email}</p>
        </div>
      </div>

      {/* Status Alerts */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. BASIC INFORMATION & PREFERRED JOB ROLE */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <span>Basic Account & Role Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Candidate Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Preferred Target Career Role</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors appearance-none"
                >
                  <option value="Senior Software Engineer">Senior Software Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Lead Full Stack Architect">Lead Full Stack Architect</option>
                  <option value="Staff Platform Engineer">Staff Platform Engineer</option>
                  <option value="Data Scientist & AI Specialist">Data Scientist & AI Specialist</option>
                  <option value="Product Manager">Product Manager</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Profile Image URL (Avatar)</label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. TECHNICAL & SOFT SKILLS MATRIX */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>Technical & Soft Skills Matrix ({skills.length})</span>
          </h3>

          {/* Add Skill Tag Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. Kubernetes, Redis, Docker)"
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="btn-secondary text-xs px-4 py-2 font-bold shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Skill Tag Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 bg-slate-900 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-lg group"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 3. WORK EXPERIENCE HISTORY */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <span>Work Experience History</span>
            </h3>
            <button
              type="button"
              onClick={handleAddExperience}
              className="btn-secondary text-xs py-1.5 px-3 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Experience</span>
            </button>
          </div>

          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 relative group">
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(idx)}
                  className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[idx].title = e.target.value;
                        setExperience(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[idx].company = e.target.value;
                        setExperience(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Years / Period</label>
                    <input
                      type="text"
                      value={exp.years}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[idx].years = e.target.value;
                        setExperience(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Impact Highlights & Bullet Points</label>
                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].description = e.target.value;
                      setExperience(updated);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. EDUCATION CREDENTIALS */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <span>Education & Academic Credentials</span>
            </h3>
            <button
              type="button"
              onClick={handleAddEducation}
              className="btn-secondary text-xs py-1.5 px-3 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="space-y-4">
            {education.map((edu, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Degree / Certification</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].degree = e.target.value;
                        setEducation(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Graduation Year</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].year = e.target.value;
                        setEducation(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-sm py-3 px-8 font-bold shadow-xl shadow-indigo-600/30"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile Changes</span>
          </button>
        </div>

      </form>
    </div>
  );
}
