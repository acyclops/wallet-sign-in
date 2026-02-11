import crypto from "crypto";
import { redis, ensureRedis } from "./redis.js";

const NONCE_TTL_SECONDS = Number(process.env.NONCE_TTL_SECONDS || 300);

function nonceKey(address) {
  return `nonce:${address}`;
}

export async function issueNonce(address) {
  await ensureRedis();

  const nonce = crypto.randomBytes(16).toString("hex");
  const key = nonceKey(address);

  await redis.set(key, nonce, { EX: NONCE_TTL_SECONDS });

  const expiresAt = Date.now() + NONCE_TTL_SECONDS * 1000;
  return { nonce, expiresAt };
}

export async function getNonceEntry(address) {
  await ensureRedis();

  const key = nonceKey(address);
  const nonce = await redis.get(key);
  if (!nonce) return null;

  const ttl = await redis.ttl(key);
  const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : null;

  return { nonce, expiresAt };
}

export async function consumeNonce(address, expectedNonce) {
  await ensureRedis();

  const key = nonceKey(address);

  // Try GETDEL to do this atomically
  let stored;
  try {
    stored = await redis.sendCommand(["GETDEL", key]);
  } catch {
    // fallback if GETDEL doesn't work
    stored = await redis.get(key);
    if (stored) await redis.del(key);
  }

  if (!stored) return { ok: false, error: "No nonce issued for this address" };
  if (stored !== expectedNonce) return { ok: false, error: "Nonce mismatch" };

  return { ok: true };
}
