import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin";
import { signAdminToken } from "../utils/jwt";
import { ah } from "../utils/asyncHandler";

export const login: RequestHandler = ah(async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" });
  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.compare(password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = signAdminToken(admin.id);
  res.json({ token });
});
