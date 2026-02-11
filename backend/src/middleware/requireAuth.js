import { getSession, deleteSession } from "../services/sessionStore.js";

export async function requireAuth(req, res, next) {
  const sid = req.cookies.sid;

  if (!sid) {
    return res.status(401).json({ ok: false, error: "Not authenticated"});
  }

  const session = await getSession(sid)

  if (!session) {
    return res.status(401).json({ ok: false, error: "Invalid session" });
  }

  req.user = { address: session.address, chainId: session.chainId };
  return next();
}