import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { json, urlencoded } from "body-parser";
import authRoutes from "./routes/auth.routes";
import programRoutes from "./routes/program.routes";
import userRoutes from "./routes/user.routes";
import publicRoutes from "./routes/public";

const app = express();
app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// 1) Main CORS middleware (no path string)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  exposedHeaders: ["Authorization"],
}));

// Good practice: handle preflight early
app.options('/*', cors());
app.use(morgan("dev"));
app.use(json({ limit: "2mb" }));
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/users", userRoutes);
app.use("/api/public", publicRoutes);

app.get("/health", (_, res) => res.json({ ok: true }));
export default app;
