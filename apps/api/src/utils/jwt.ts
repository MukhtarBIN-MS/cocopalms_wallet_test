import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function signAdminToken(adminId: string) {
  return jwt.sign({ sub: adminId, role: "admin" }, env.JWT_SECRET, {
    expiresIn: "1d",
  });
}
export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as { sub: string; role: string };
}
