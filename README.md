# Wallet Authentication with SIWE + Redis

This project is a full implementation of Sign-In With Ethereum (SIWE) using a Redis-backed session layer and HttpOnly cookies.

I built this to demonstrate a production ready wallet auth flow. Not just signature verification, but proper nonce handling, session persistence, and clean frontend state management.

## Overview

When a user logs in, the frontend requests a nonce tied to their wallet address. The backend generates a nonce, stores it in Redis with a short TTL, and returns it to the client.

The wallet signs a SIWE message containing the address, chainId, and nonce. The backend verifies the signature, validates the domain and nonce, consumes the nonce, and creates a Redis-backed session. A secure HttpOnly cookie is then set to persist authentication.

On page reload, the frontend calls `/me`, which validates the session in Redis and restores the authenticated user.

Logout deletes the Redis session and clears the cookie.

Redis enforces TTL on both nonces and sessions, so expiration is automatic and does not rely on in-memory state.

## Stack

React (Vite), Express, SIWE, Ethers.js, Redis, Node.js
