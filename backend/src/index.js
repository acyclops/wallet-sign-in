import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { initDb } from "./db.js";
import { startSessionCleanup } from "./services/sessionStore.js";
import { startNonceCleanup } from "./services/nonceStore.js";

import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));
app.use(express.json({ limit: "64kb" }));
app.use(cookieParser());

// init
initDb();
startSessionCleanup();
startNonceCleanup();

// routes
app.use("/auth", authRoutes);
app.use("/", profileRoutes); // /me, /profile
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
