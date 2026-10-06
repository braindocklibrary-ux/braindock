import mongoose from 'mongoose';

const uri = "mongodb+srv://braindocklibrary_db_user:braindock123@cluster0.7dpsi7g.mongodb.net/braindock_library?retryWrites=true&w=majority&appName=Cluster0";

console.log("Connecting to MongoDB Atlas...");
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("SUCCESS! Connected to MongoDB Atlas cluster0!");
  console.log("DB Name:", mongoose.connection.name);
  await mongoose.disconnect();
  console.log("Disconnected cleanly.");
} catch (err) {
  console.error("Connection error:", err.message);
}
