import express from "express";
import { verifyMessage } from "ethers";
import { SiweMessage } from "siwe";
import { issueNonce, consumeNonce, getNonceEntry } from "../services/nonceStore.js";
import { createSession, deleteSession } from "../services/sessionStore.js";

const router = express.Router();

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";

function normalizeAddress(addr) {
  if (!addr || typeof addr !== "string") return null;
  return addr.trim().toLowerCase();
}

router.post("/logout", (req, res) => {
  const sid = req.cookies.sid;
  if (sid) deleteSession(sid);

  res.clearCookie("sid", {
    sameSite: isProd ? "none" : "lax",
    secure: isProd
  });

  return res.json({ ok: true });
});

router.get("/nonce", (req, res) => {
  const address = normalizeAddress(req.query.address);
  if (!address) {
    return res.status(400).json({ ok: false, error: "Missing address" });
  }

  const { nonce, expiresAt } = issueNonce(address);

  return res.json({ ok: true, address, nonce, expiresAt });
});

router.post("/verify", async (req, res) => {
  try {
    const { message, signature } = req.body || {};

    if (!message || !signature) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const siwe = new SiweMessage(message);

    const address = String(siwe.address || "").toLowerCase();
    if (!address) {
        return res.status(400).json({ ok: false, error: "Invalid SIWE message: missing address"});
    }

    const nonce = siwe.nonce;
    if (!nonce) {
        return res.status(400).json({ ok: false, error: "Invalid SIWE message: missing nonce"});
    }

    const chainId = siwe.chainId;
    if (!chainId) {
        return res.status(400).json({ ok: false, error: "Invalid SIWE message: missing chainId"});
    }

    const entry = getNonceEntry(address);
    if (!entry) {
        return res.status(400).json({ ok: false, error: "No nonce issued for this address"});
    }
    if (entry.nonce !== nonce) {
        return res.status(400).json({ ok: false, error: "Nonce mismatch"});
    }

    // Grab domain, set SIWE_DOMAIN to frontend URL once deployed
    const expectedDomain = process.env.SIWE_DOMAIN || "localhost:5173";

    // Verify signature
    await siwe.verify({
        signature,
        domain: expectedDomain,
        nonce,
    });

    // Consume nonce once verifcation succeeds
    consumeNonce(address, nonce);

    const { sid, expiresAt } = createSession({ 
        address: address, 
        chainId 
    });

    res.cookie("sid", sid, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: expiresAt - Date.now(),
      path: "/"
    });

    return res.json({ ok: true, address: address, chainId: chainId ?? null });
  } catch (err) {
    // This catches siwe.verify errors since it throws on failure
    return res.status(400).json({ ok: false, error: err?.message || "SIWE verification failed" });
  }
});

export default router;
