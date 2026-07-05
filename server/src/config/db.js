import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is required");
  }

  const timeoutMs = Number(process.env.MONGO_TIMEOUT_MS || 10000);
  mongoose.set("strictQuery", true);

  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`MongoDB connection timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  const connection = mongoose.connect(uri, {
    serverSelectionTimeoutMS: timeoutMs,
    connectTimeoutMS: timeoutMs
  });

  await Promise.race([connection, timeout]);
  clearTimeout(timeoutId);
  console.log("MongoDB connected");
}
