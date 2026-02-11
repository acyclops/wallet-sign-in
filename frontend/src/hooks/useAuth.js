import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { buildSiweMessage } from "../lib/walletMessage";
import { getMe, getNonce, verifySignature, logout as apiLogout } from "../api/auth";

export function useAuth() {
  const [status, setStatus] = useState("checking"); // checking | idle | connecting | getting-nonce | signing | verifying | done
  const [user, setUser] = useState(null); // { address, chainId } | null
  const [error, setError] = useState("");

  const hasInjected = typeof window !== "undefined" && !!window.ethereum;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { resp, data } = await getMe();
        if (cancelled) return;

        if (resp.ok && data?.ok) {
          setUser(data);
          setStatus("done");
        } else {
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("idle");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn() {
    setError("");

    if (!hasInjected) {
      setError("No injected wallet found (install MetaMask or a compatible wallet).");
      return;
    }

    try {
      setStatus("connecting");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      setStatus("getting-nonce");
      const { resp: nonceResp, data: nonceData } = await getNonce(address);
      if (!nonceResp.ok || !nonceData?.ok) throw new Error(nonceData?.error || "Failed to fetch nonce");

      const nonce = nonceData.nonce;
      const message = buildSiweMessage({ address, chainId, nonce });

      setStatus("signing");
      const signature = await signer.signMessage(message);

      setStatus("verifying");
      const { resp: verifyResp, data: verifyData } = await verifySignature(message, signature);

      if (!verifyResp.ok || !verifyData?.ok) throw new Error(verifyData?.error || "Verification failed");

      setUser(verifyData);
      setStatus("done");
    } catch (e) {
      setError(e?.message || "Something went wrong");
      setUser(null);
      setStatus("idle");
    }
  }

  async function logout() {
    setError("");
    try {
      const { resp } = await apiLogout();
      if (!resp.ok) throw new Error("Logout failed");
      setUser(null);
      setStatus("idle");
    } catch (e) {
      setError(e?.message || "Failed to logout");
    }
  }

  return { status, user, error, setError, hasInjected, signIn, logout };
}