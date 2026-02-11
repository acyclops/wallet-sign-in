export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export async function apiFetch(path, options = {}) {
  const resp = await fetch(`${BACKEND_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  let data = null;
  try {
    data = await resp.json();
  } catch {
    // ignore
  }

  return { resp, data };
}