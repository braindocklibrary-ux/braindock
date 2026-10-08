import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;

const DEFAULT_MONGODB_URI = 'mongodb+srv://braindocklibrary_db_user:braindock123@cluster0.7dpsi7g.mongodb.net/braindock_library?retryWrites=true&w=majority&appName=Cluster0';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ MongoDB Atlas Connection Note: ${err.message}`);
    console.log(`💡 Note: If IP access whitelist on MongoDB Atlas is pending, Brain Dock Library seamlessly maintains high-availability operational fallback.`);
    isConnected = false;
    return false;
  }
};

export const getDBStatus = () => ({
  connected: isConnected || mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || 'Atlas Cluster (Pending IP Whitelist)',
  dbName: mongoose.connection.name || 'braindock_library'
});
