import { useEffect, useState } from "react";
import { getProfile, saveProfile as apiSaveProfile } from "../api/profile";

export function useProfile(isAuthed) {
  const [profile, setProfile] = useState(null); // null or { displayName, bio }
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | saving | saved
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError("");
      setStatus("loading");

      try {
        const { resp, data } = await getProfile();
        if (cancelled) return;

        if (resp.ok && data?.ok) {
          const p = data.profile;
          setProfile(p);
          setDisplayName(p?.displayName || "");
          setBio(p?.bio || "");
          setStatus("idle");
          return;
        }

        setStatus("idle");
        setError(data?.error || "Failed to load profile");
      } catch (e) {
        if (!cancelled) {
          setStatus("idle");
          setError(e?.message || "Failed to load profile");
        }
      }
    }

    if (isAuthed) load();
    else {
      setProfile(null);
      setDisplayName("");
      setBio("");
      setStatus("idle");
      setError("");
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  async function save() {
    setError("");
    setStatus("saving");

    try {
      const { resp, data } = await apiSaveProfile({ displayName, bio });
      if (!resp.ok || !data?.ok) throw new Error(data?.error || "Failed to save profile");

      setProfile(data.profile);
      setDisplayName(data.profile?.displayName || "");
      setBio(data.profile?.bio || "");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1000);
    } catch (e) {
      setStatus("idle");
      setError(e?.message || "Failed to save profile");
    }
  }

  return {
    profile,
    displayName,
    setDisplayName,
    bio,
    setBio,
    status,
    error,
    save,
  };
}