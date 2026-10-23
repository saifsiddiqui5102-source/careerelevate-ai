import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  years: { type: String, default: '2022 - Present' },
  description: { type: String, default: '' }
});

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: String, default: '2022' }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  targetRole: {
    type: String,
    default: 'Senior Software Engineer'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  skills: {
    type: [String],
    default: ['React', 'Node.js', 'TypeScript', 'System Design', 'GraphQL', 'MongoDB']
  },
  experience: {
    type: [experienceSchema],
    default: [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp Solutions',
        years: '2023 - Present',
        description: 'Architected high-throughput microservices handling 10k req/sec with GraphQL & Redis.'
      }
    ]
  },
  education: {
    type: [educationSchema],
    default: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'State University of Technology',
        year: '2022'
      }
    ]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otpHash: {
    type: String,
    select: false
  },
  otpExpiresAt: {
    type: Date
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpChallengeId: {
    type: String,
    select: false
  },
  otpPurpose: {
    type: String,
    enum: ['login', 'registration'],
    default: 'registration'
  },
  lastOtpSentAt: {
    type: Date
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpiresAt: {
    type: Date
  },
  readinessScore: {
    type: Number,
    default: 75
  },
  streakDays: {
    type: Number,
    default: 1
  },
  skillsBreakdown: {
    technical: { type: Number, default: 80 },
    communication: { type: Number, default: 75 },
    problemSolving: { type: Number, default: 85 },
    leadership: { type: Number, default: 70 },
    starMethod: { type: Number, default: 80 }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Prevent double-hashing if password is already a valid bcrypt hash
  if (typeof this.password === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(this.password)) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
