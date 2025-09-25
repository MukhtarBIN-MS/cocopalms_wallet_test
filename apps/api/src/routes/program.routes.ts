import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { createProgram, listPrograms, removeProgram } from "../controllers/program.controller";

const r = Router();
r.use(requireAdmin);
r.get("/", listPrograms);
r.post("/", createProgram);
r.delete("/:id", removeProgram);
export default r;
