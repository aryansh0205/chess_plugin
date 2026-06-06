import mongoose from "mongoose";

export async function connectDb(): Promise<boolean> {
  const uri = process.env.MONGO_URI?.trim();
  if (!uri) {
    console.warn(
      "[api] MONGO_URI is not set. Copy apps/api/.env.example to apps/api/.env and set MONGO_URI.",
    );
    return false;
  }
  if (mongoose.connection.readyState === 1) return true;
  try {
    await mongoose.connect(uri);
    console.log("[api] MongoDB connected");
    return true;
  } catch (e) {
    console.error("[api] MongoDB connection failed:", e);
    return false;
  }
}

export function isDbReady(): boolean {
  return mongoose.connection.readyState === 1;
}
