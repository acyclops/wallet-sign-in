import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { initDb } from "./db.js";

import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import { ensureRedis } from "./services/redis.js";

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));
app.use(express.json({ limit: "64kb" }));
app.use(cookieParser());

// routes
app.use("/auth", authRoutes); // /auth/verify, /auth/nonce, /auth/logout
app.use("/", profileRoutes); // /me, /profile
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

initDb();

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

ensureRedis().catch((err) => {
  console.error("Redis init failed:", err);
});
