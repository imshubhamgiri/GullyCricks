import mongoose from "mongoose";

export async function connectDB(uri?: string): Promise<void> {
  if (!uri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
