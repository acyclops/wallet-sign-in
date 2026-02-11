export default function ProfileCard({
  profile,
  displayName,
  setDisplayName,
  bio,
  setBio,
  status,
  onSave,
}) {
  const disabled = status === "loading" || status === "saving";

  return (
    <div className="panel">
      <div className="panelHeader">
        <div>
          <h2>Profile</h2>
          <p className="muted">
            {profile ? "" : "No profile yet — create one"}
          </p>
        </div>

        <div className="right">
          <span className="muted small">
            {status === "loading" ? "Loading…" : status === "saved" ? "Saved" : ""}
          </span>
        </div>
      </div>

      <div className="field">
        <label>Display name</label>
        <input
          className="input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Alex"
          disabled={disabled}
        />
      </div>

      <div className="field">
        <label>Bio (optional)</label>
        <textarea
          className="textarea"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Short bio…"
          rows={3}
          disabled={disabled}
        />
      </div>

      <div className="row">
        <button className="btn btnPrimary" onClick={onSave} disabled={disabled}>
          {status === "saving" ? "Saving…" : "Save profile"}
        </button>
      </div>
    </div>
  );
}
