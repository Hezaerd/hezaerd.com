import { v } from "convex/values";

import type { Doc } from "../_generated/dataModel";

export const FIELD_KEY_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/;

export const cmsTextConstraintsValidator = v.object({
  maxLength: v.number(),
  multiline: v.optional(v.boolean()),
});

export const cmsImageConstraintsValidator = v.object({
  aspect: v.string(),
  maxWidth: v.number(),
  priority: v.optional(v.boolean()),
});

export const cmsFieldTypeValidator = v.union(v.literal("text"), v.literal("image"));

export const cmsFieldInputValidator = v.object({
  fieldKey: v.string(),
  type: cmsFieldTypeValidator,
  constraints: v.union(cmsTextConstraintsValidator, cmsImageConstraintsValidator),
});

export const cmsFieldSchemaValidator = v.object({
  fieldKey: v.string(),
  type: cmsFieldTypeValidator,
  constraints: v.union(cmsTextConstraintsValidator, cmsImageConstraintsValidator),
  label: v.optional(v.string()),
  defaultValue: v.optional(v.string()),
  deprecated: v.optional(v.boolean()),
});

function getCmsTokenPepper(): string {
  const pepper = process.env.CMS_TOKEN_PEPPER;
  if (!pepper || pepper.trim().length === 0) {
    throw new Error("Variable Convex manquante : CMS_TOKEN_PEPPER");
  }
  return pepper.trim();
}

export function validateFieldKey(key: string): string {
  const trimmed = key.trim();
  if (!FIELD_KEY_PATTERN.test(trimmed)) {
    throw new Error("Clé de champ invalide");
  }
  return trimmed;
}

export function validateTextConstraints(
  constraints: { maxLength: number; multiline?: boolean },
): { maxLength: number; multiline?: boolean } {
  if (!Number.isFinite(constraints.maxLength) || constraints.maxLength <= 0) {
    throw new Error("maxLength invalide");
  }
  return constraints;
}

export function validateImageConstraints(constraints: {
  aspect: string;
  maxWidth: number;
  priority?: boolean;
}): { aspect: string; maxWidth: number; priority?: boolean } {
  const aspect = constraints.aspect.trim();
  if (!aspect) {
    throw new Error("aspect requis");
  }
  if (!Number.isFinite(constraints.maxWidth) || constraints.maxWidth <= 0) {
    throw new Error("maxWidth invalide");
  }
  return { ...constraints, aspect };
}

export function validateFieldInput(input: {
  fieldKey: string;
  type: "text" | "image";
  constraints: Doc<"cmsFieldSchemas">["constraints"];
}): {
  fieldKey: string;
  type: "text" | "image";
  constraints: Doc<"cmsFieldSchemas">["constraints"];
} {
  const fieldKey = validateFieldKey(input.fieldKey);
  if (input.type === "text") {
    return {
      fieldKey,
      type: input.type,
      constraints: validateTextConstraints(
        input.constraints as { maxLength: number; multiline?: boolean },
      ),
    };
  }
  return {
    fieldKey,
    type: input.type,
    constraints: validateImageConstraints(
      input.constraints as { aspect: string; maxWidth: number; priority?: boolean },
    ),
  };
}

export async function hashDeployToken(plaintext: string): Promise<string> {
  const pepper = getCmsTokenPepper();
  const data = new TextEncoder().encode(`${pepper}:${plaintext}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

export function buildSnapshotFields(
  schemas: Array<Doc<"cmsFieldSchemas">>,
  values: Array<Doc<"cmsFieldValues">>,
): Record<string, string> {
  const valueByKey = new Map(values.map((entry) => [entry.fieldKey, entry.draftValue]));
  const fields: Record<string, string> = {};

  for (const schema of schemas) {
    if (schema.deprecated) {
      continue;
    }

    const draftValue = valueByKey.get(schema.fieldKey);
    if (draftValue !== undefined) {
      fields[schema.fieldKey] = draftValue;
      continue;
    }

    if (schema.defaultValue !== undefined) {
      fields[schema.fieldKey] = schema.defaultValue;
      continue;
    }

    if (schema.type === "text") {
      fields[schema.fieldKey] = "";
      continue;
    }

    throw new Error(`Valeur manquante pour ${schema.fieldKey}`);
  }

  return fields;
}

export function snapshotsEqual(
  left: Record<string, string>,
  right: Record<string, string>,
): boolean {
  const leftKeys = [...Object.keys(left)].sort();
  const rightKeys = [...Object.keys(right)].sort();
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (let index = 0; index < leftKeys.length; index += 1) {
    const key = leftKeys[index]!;
    if (key !== rightKeys[index]) {
      return false;
    }
    if (left[key] !== right[key]) {
      return false;
    }
  }
  return true;
}

export function validateDraftTextValue(
  schema: Doc<"cmsFieldSchemas">,
  value: string,
): string {
  if (schema.type !== "text") {
    throw new Error("Champ non texte");
  }
  const trimmed = value.trim();
  const constraints = schema.constraints as { maxLength: number; multiline?: boolean };
  if (trimmed.length > constraints.maxLength) {
    throw new Error(`Texte trop long (max ${constraints.maxLength})`);
  }
  return trimmed;
}

export function buildPublishedSnapshotKey(slug: string, version: number): string {
  return `cms/${slug}/published/v${version}.json`;
}

export function buildLatestSnapshotKey(slug: string): string {
  return `cms/${slug}/published/latest.json`;
}

export function buildSnapshotJson(input: {
  version: number;
  publishedAt: number;
  fields: Record<string, string>;
}): string {
  return JSON.stringify({
    version: input.version,
    publishedAt: input.publishedAt,
    fields: input.fields,
  });
}

export function generateDeployTokenPlaintext(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
