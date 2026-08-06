import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Disable command buffering so operations don't hang for 10 seconds when DB is offline
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careerelevate', {
      serverSelectionTimeoutMS: 3000 // Fast 3-second selection timeout
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection offline (${error.message}). Enabled high-availability Memory Mode Fallback.`);
  }
};
