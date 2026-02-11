import { apiFetch } from "./client";

export async function getMe() {
  return apiFetch("/me");
}

export async function getNonce(address) {
  // nonce doesn't need credentials, but doesn't ruin anything by being included
  return apiFetch(`/auth/nonce?address=${encodeURIComponent(address)}`, { method: "GET" });
}

export async function verifySignature(message, signature) {
  return apiFetch("/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({message, signature}),
  });
}

export async function logout() {
  return apiFetch("/auth/logout", { method: "POST" });
}