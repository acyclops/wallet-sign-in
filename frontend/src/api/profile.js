import { apiFetch } from "./client";

export async function getProfile() {
  return apiFetch("/profile");
}

export async function saveProfile({ displayName, bio }) {
  return apiFetch("/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName, bio }),
  });
}