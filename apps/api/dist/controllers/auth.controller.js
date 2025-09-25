"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const Admin_1 = require("../models/Admin");
const jwt_1 = require("../utils/jwt");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.login = (0, asyncHandler_1.ah)(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password)
        return res.status(400).json({ error: "Missing credentials" });
    const admin = await Admin_1.Admin.findOne({ email });
    if (!admin || !(await admin.compare(password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = (0, jwt_1.signAdminToken)(admin.id);
    res.json({ token });
});
