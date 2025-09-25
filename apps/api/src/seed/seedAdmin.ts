import "../db/mongoose";
import { Admin } from "../models/Admin";
import { env } from "../config/env";
import bcrypt from "bcryptjs";

(async () => {
  const existing = await Admin.findOne({ email: env.ADMIN_EMAIL });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    process.exit(0);
  }
  const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await Admin.create({ email: env.ADMIN_EMAIL, passwordHash: hash });
  console.log("Admin created:", env.ADMIN_EMAIL);
  process.exit(0);
})();
