import User from "../models/User.js";

export async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) return;

  const exists = await User.findOne({ email });
  if (exists) return;

  await User.create({
    name: "Campus Admin",
    email,
    password,
    role: "admin"
  });

  console.log(`Seeded admin user ${email}`);
}
