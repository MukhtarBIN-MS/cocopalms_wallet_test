"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const jwt_1 = require("../utils/jwt");
const requireAdmin = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const token = header.slice(7);
        const payload = (0, jwt_1.verifyToken)(token);
        if (payload.role !== "admin")
            throw new Error("Not admin");
        req.adminId = payload.sub;
        next();
    }
    catch {
        res.status(401).json({ error: "Unauthorized" });
    }
};
exports.requireAdmin = requireAdmin;
