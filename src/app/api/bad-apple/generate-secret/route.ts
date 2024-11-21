import { NextResponse } from "next/server";
import crypto from "crypto";

// should use a db instead...
const secrets = new Map<string, boolean>(); // use set instead ?

export async function GET() {
  const secret = crypto.randomBytes(16).toString("hex");
  secrets.set(secret, true); // true = valid

  console.log("New secret generated:", secret);

  return NextResponse.json({ secret });
}

export const isSecretValid = (secret: string) => {
  if (secrets.has(secret) && secrets.get(secret)) {
    secrets.set(secret, false); // invalidate secret
    return true;
  }
  return false;
};
