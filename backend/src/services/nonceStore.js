import crypto from "crypto";

const nonces = new Map();
const NONCE_TTL_MS = 5 * 60 * 1000;

export function issueNonce(address) {
  const nonce = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + NONCE_TTL_MS;

  nonces.set(address.toLowerCase(), { nonce, expiresAt });
  
  return { nonce, expiresAt };
}

export function getNonceEntry(address) {
  const key = address.toLowerCase();
  const entry = nonces.get(key);
  if (!entry) return false;

  return entry;
}

export function consumeNonce(address, nonce) {
  const entry = getNonceEntry(address);
  const key = address.toLowerCase();

  if (entry.expiresAt <= Date.now()) {
    nonces.delete(key);
    return false;
  }

  if (entry.nonce !== nonce) return false;

  nonces.delete(key);
  return true;
}

export function startNonceCleanup() {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of nonces.entries()) {
      if (!v || v.expiresAt <= now) nonces.delete(k);
    }
  }, 60_000).unref();
}
