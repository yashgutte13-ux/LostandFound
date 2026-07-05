import mongoose from "mongoose";

export async function connectDb() {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:");
    console.error(err);
    throw err;
  }
}