import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { createProgram, listPrograms, removeProgram, updateProgram } from "../controllers/program.controller";

const r = Router();
r.use(requireAdmin);
r.get("/", listPrograms);
r.post("/", createProgram);
r.delete("/:id", removeProgram);
r.put("/:id", updateProgram);
export default r;
