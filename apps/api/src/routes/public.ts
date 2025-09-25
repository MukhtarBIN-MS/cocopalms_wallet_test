// routes/public.ts
import { Router } from "express";
import { listPrograms } from "../controllers/program.controller";
import { createUserAndIssue } from "../controllers/user.controller";

const r = Router();

// No requireAdmin here — open for customers
r.get("/programs", listPrograms);        // just read, safe
r.post("/users", createUserAndIssue);    // creates + issues card

export default r;
