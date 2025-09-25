"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/public.ts
const express_1 = require("express");
const program_controller_1 = require("../controllers/program.controller");
const user_controller_1 = require("../controllers/user.controller");
const r = (0, express_1.Router)();
// No requireAdmin here — open for customers
r.get("/programs", program_controller_1.listPrograms); // just read, safe
r.post("/users", user_controller_1.createUserAndIssue); // creates + issues card
exports.default = r;
