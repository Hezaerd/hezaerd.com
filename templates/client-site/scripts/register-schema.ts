import { registerFields } from "@hezaerd/cms/register";

import { CMS_FIELDS, CMS_SLUG } from "../src/cms/fields.ts";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variable manquante : ${name}`);
  }
  return value;
}

const result = await registerFields({
  slug: process.env.CMS_SLUG?.trim() || CMS_SLUG,
  fields: CMS_FIELDS,
  convexSiteUrl: requireEnv("CONVEX_SITE_URL"),
  deployToken: requireEnv("CMS_DEPLOY_TOKEN"),
});

console.log(JSON.stringify(result));
