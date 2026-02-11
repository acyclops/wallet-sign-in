import crypto from "crypto";
import { redis, ensureRedis } from "./redis.js";

const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 24 * 7);

function sessionKey(sid) {
  return `siwe-test:session:${sid}`;
}

export async function createSession({ address, chainId }) {
  await ensureRedis();

  const sid = crypto.randomBytes(32).toString("hex");
  const createdAt = Date.now();

  const payload = JSON.stringify({ address, chainId, createdAt });

  await redis.set(sessionKey(sid), payload, { EX: SESSION_TTL_SECONDS });

  const expiresAt = createdAt + SESSION_TTL_SECONDS * 1000;
  return { sid, expiresAt };
}

export async function deleteSession(sid) {
  await ensureRedis();

  await redis.del(sessionKey(sid));
}

export async function getSession(sid) {
  await ensureRedis();

  if (!sid) return null;
  const raw = await redis.get(sessionKey(sid));
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    // corrupted session, delete
    await redis.del(sessionKey(sid));
    return null;
  }
}
