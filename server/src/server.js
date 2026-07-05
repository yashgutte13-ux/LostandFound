import dotenv from "dotenv";
import app from "./app.js";
import { connectDb } from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";

dotenv.config();

const port = process.env.PORT || 5000;

try {
  console.log("🚀 Starting application...");
  console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
  console.log("PORT:", process.env.PORT);

  await connectDb();
  console.log("✅ Database connected");

  await seedAdmin();
  console.log("✅ Admin seeded");
} catch (error) {
  console.error("❌ Startup failed:");
  console.error(error); // <-- print full error, not just message
  process.exit(1);
}

const server = app.listen(port, () => {
  console.log(`API running on port ${port}`);
});

server.on("error", (error) => {
  console.error(error);
});