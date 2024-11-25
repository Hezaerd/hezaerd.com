import crypto from "crypto";

const secrets = new Map<string, boolean>();

export function generateSecret(): string {
  const secret = crypto.randomBytes(16).toString("hex");
  secrets.set(secret, true); // true = valid

  console.log("New secret generated:", secret);

  return secret;
}

export function isSecretValid(secret: string): boolean {
  if (secrets.has(secret) && secrets.get(secret)) {
    secrets.set(secret, false); // invalidate secret

    console.log(`Secret ${secret} consumed`);

    // print all valid secrets
    console.log("Valid secrets:");
    for (const [secret, valid] of secrets) {
      if (valid) {
        console.log(secret);
      }
    }

    return true;
  }
  return false;
}
