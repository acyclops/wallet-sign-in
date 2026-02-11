import ProfileCard from "./components/ProfileCard";
import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";
import "./styles/ui.css";

function shortAddr(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function App() {
  const { status, user, error, setError, hasInjected, signIn, logout } = useAuth();
  const isAuthed = status === "done" && !!user?.address;
  const profile = useProfile(isAuthed);

  const buttonText = (() => {
    switch (status) {
      case "idle": return "Sign In";
      case "connecting": return "Connecting…";
      case "getting-nonce": return "Getting nonce…";
      case "signing": return "Waiting for signature…";
      case "verifying": return "Verifying…";
      case "checking": return "Checking session…";
      case "done": return "Signed in";
      default: return "Sign In";
    }
  })();

  return (
    <div className="page">
      <div className="shell">
        <div className="card">
          <div className="header">
            <h1>Wallet Signature Login</h1>
          </div>

          <div className="row">
            <button
              className="btn btnPrimary"
              onClick={() => {
                setError("");
                signIn();
              }}
              disabled={status !== "idle"}
              title={!hasInjected ? "Install MetaMask (or similar)" : ""}
            >
              {buttonText}
            </button>

            {isAuthed && (
              <button className="btn btnGhost" onClick={logout}>
                Logout
              </button>
            )}
          </div>

          {!hasInjected && (
            <div className="notice">
              No injected wallet found. Install MetaMask (or similar) to test.
            </div>
          )}

          {isAuthed && (
            <div className="pillRow">
              <span className="pill">Authenticated</span>
              <span className="mono">{shortAddr(user.address)}</span>
              <span className="pill">Chain {user.chainId ?? "?"}</span>
            </div>
          )}

          {(error || profile.error) && (
            <div className="error">
              {error || profile.error}
            </div>
          )}

          {isAuthed && (
            <ProfileCard
              profile={profile.profile}
              displayName={profile.displayName}
              setDisplayName={profile.setDisplayName}
              bio={profile.bio}
              setBio={profile.setBio}
              status={profile.status}
              onSave={profile.save}
            />
          )}
        </div>
      </div>
    </div>
  );
}
