import { SiweMessage } from "siwe";

export function buildSiweMessage({ address, chainId, nonce }) {
  const domain = window.location.host;
  const uri = window.location.origin;

  const siweMessage = new SiweMessage({
    domain,
    address,
    statement: "Sign in to wallet-signing",
    uri,
    version: "1",
    chainId,
    nonce,
  });

  return siweMessage.prepareMessage();
}