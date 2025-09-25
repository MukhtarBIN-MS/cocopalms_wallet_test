import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { listUsers, createUserAndIssue } from "../controllers/user.controller";

const r = Router();
r.use(requireAdmin);
r.get("/", listUsers);
r.post("/", createUserAndIssue);
export default r;
