import { RequestHandler } from "express";
import { verifyToken } from "../utils/jwt";

export const requireAdmin: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });
  try {
    const token = header.slice(7);
    const payload = verifyToken(token);
    if (payload.role !== "admin") throw new Error("Not admin");
    (req as any).adminId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};
