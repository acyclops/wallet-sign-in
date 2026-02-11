export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export async function apiFetch(path, options = {}) {
  // Just include credentials by default, will not break routes where they are unnecessary
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