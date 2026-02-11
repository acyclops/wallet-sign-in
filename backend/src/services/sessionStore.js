import crypto from "crypto";

const sessions = new Map();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function createSession({ address, chainId }) {
  const sid = crypto.randomBytes(32).toString("hex");
  const now = Date.now();

  sessions.set(sid, {
    address,
    chainId,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  });

  return { sid, expiresAt: now + SESSION_TTL_MS };
}

export function getSession(sid) {
  const session = sessions.get(sid);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(sid);
    return null;
  }

  return session;
}

export function deleteSession(sid) {
  sessions.delete(sid);
}

export function cleanupSessions() {
  const now = Date.now();
  for (const [sid, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(sid);
  }
}

// optional, called once from server bootstrap
export function startSessionCleanup() {
  setInterval(cleanupSessions, 60_000).unref();
}
