
import "server-only";

import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import { cookies } from "next/headers";

const COOKIE_NAME = "pennypilot_session";
const SESSION_SECONDS = 60 * 60 * 24;

export function verifyPassword(password) {
  const stored = process.env.PENNYPILOT_LOGIN_PASSWORD_HASH;

  if (!stored || typeof password !== "string") {
    return false;
  }

  const [salt, hash] = stored.split(":");

  if (!salt || !hash || !/^[0-9a-f]{32}$/i.test(salt)) {
    return false;
  }

  try {
    const expected = Buffer.from(hash, "hex");
    const actual = scryptSync(password, Buffer.from(salt, "hex"), 64);

    return (
      expected.length === actual.length &&
      timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}

function sign(payload) {
  const secret = process.env.PENNYPILOT_SESSION_SECRET;

  if (!secret) {
    throw new Error("Session secret is not configured");
  }

  return createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

export function createSessionToken() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${expires}.${nonce}`;

  return `${payload}.${sign(payload)}`;
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expires, nonce, signature] = parts;

  if (!/^\d+$/.test(expires)) return false;
  if (!/^[0-9a-f]{32}$/.test(nonce)) return false;
  if (!/^[0-9a-f]{64}$/.test(signature)) return false;

  if (Number(expires) <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  try {
    const expected = Buffer.from(sign(`${expires}.${nonce}`), "hex");
    const received = Buffer.from(signature, "hex");

    return timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}

export const sessionCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  },
};
