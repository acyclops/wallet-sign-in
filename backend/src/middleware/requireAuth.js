import { getSession, deleteSession } from "../services/sessionStore.js";

export function requireAuth(req, res, next) {
  const sid = req.cookies.sid;

  if (!sid) {
    return res.status(401).json({ ok: false, error: "Not authenticated"});
  }

  const session = getSession(sid)

  if (!session) {
    return res.status(401).json({ ok: false, error: "Invalid session" });
  }

  const now = Date.now();
  if (!session.expiresAt || session.expiresAt <= now) {
    deleteSession(sid);
    return res.status(401).json({ ok: false, error: "Session expired" });
  }

  req.user = { address: session.address, chainId: session.chainId };
  return next();
}