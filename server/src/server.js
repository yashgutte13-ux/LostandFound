import dotenv from "dotenv";
import app from "./app.js";
import { connectDb } from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";

dotenv.config();

const port = process.env.PORT || 5000;

try {
  await connectDb();
  await seedAdmin();
} catch (error) {
  console.error("Failed to start API server:");
  console.error(error.message);
  process.exit(1);
}

const server = app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the old server or set a different PORT in server/.env.`);
    process.exit(1);
  }
  throw error;
});
