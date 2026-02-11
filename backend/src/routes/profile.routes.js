import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getProfile, upsertProfile } from "../db.js";

const router = express.Router();

router.get("/me", requireAuth, (req, res) => {
  return res.json({ ok: true, address: req.user.address, chainId: req.user.chainId });
});

router.get("/profile", requireAuth, (req, res) => {
  const profile = getProfile(req.user.address);
  return res.json({
    ok: true,
    profile: profile ? { displayName: profile.displayName, bio: profile.bio } : null
  });
});

router.post("/profile", requireAuth, (req, res) => {
  const { displayName, bio } = req.body || {};

  if (typeof displayName !== "string") {
    return res.status(400).json({ ok: false, error: "Display name must be a string" });
  }

  const dn = displayName.trim();
  if (dn.length < 2 || dn.length > 32) {
    return res.status(400).json({ ok: false, error: "Display name must be between 2 and 32 characters" });
  }

  let b = null;
  if (bio != null) {
    if (typeof bio !== "string") {
      return res.status(400).json({ ok: false, error: "Bio must be a string" });
    }
    const trimmed = bio.trim();
    if (trimmed.length > 160) {
      return res.status(400).json({ ok: false, error: "Bio must be 160 characters or fewer" });
    }
    b = trimmed.length ? trimmed : null;
  }

  const saved = upsertProfile(req.user.address, dn, b);
  return res.json({ ok: true, profile: saved });
});

export default router;
