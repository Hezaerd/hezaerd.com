import type { HttpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { validateFieldInput, validateFieldKey } from "./lib/cms";

const registerSchemaBodyValidator = {
  slug: (value: unknown): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error("slug requis");
    }
    return value.trim();
  },
  fields: (value: unknown): Array<{
    fieldKey: string;
    type: "text" | "image";
    constraints: { maxLength: number; multiline?: boolean } | {
      aspect: string;
      maxWidth: number;
      priority?: boolean;
    };
  }> => {
    if (!Array.isArray(value)) {
      throw new Error("fields requis");
    }
    return value.map((entry) => {
      if (!entry || typeof entry !== "object") {
        throw new Error("Champ invalide");
      }
      const field = entry as Record<string, unknown>;
      if (typeof field.fieldKey !== "string" || typeof field.type !== "string") {
        throw new Error("Champ invalide");
      }
      if (field.type !== "text" && field.type !== "image") {
        throw new Error("Type de champ invalide");
      }
      if (!field.constraints || typeof field.constraints !== "object") {
        throw new Error("Contraintes requises");
      }
      return validateFieldInput({
        fieldKey: field.fieldKey,
        type: field.type,
        constraints: field.constraints as never,
      });
    });
  },
};

function parseBearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function registerCmsRoutes(http: HttpRouter): void {
  http.route({
    path: "/cms/register-schema",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const token = parseBearerToken(request);
      if (!token) {
        return jsonResponse({ error: "Authorization Bearer requis" }, 401);
      }

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: "JSON invalide" }, 400);
      }

      if (!body || typeof body !== "object") {
        return jsonResponse({ error: "Corps de requête invalide" }, 400);
      }

      const payload = body as Record<string, unknown>;

      let slug: string;
      let fields: Array<ReturnType<typeof validateFieldInput>>;
      try {
        slug = registerSchemaBodyValidator.slug(payload.slug);
        fields = registerSchemaBodyValidator.fields(payload.fields);
        for (const field of fields) {
          validateFieldKey(field.fieldKey);
        }
      } catch (error) {
        return jsonResponse(
          { error: error instanceof Error ? error.message : "Payload invalide" },
          400,
        );
      }

      const tokenCheck = await ctx.runQuery(internal.cmsInternal.resolveDeployToken, {
        tokenPlaintext: token,
        slug,
      });

      if (!tokenCheck.ok) {
        return jsonResponse({ error: tokenCheck.error ?? "Token deploy invalide" }, tokenCheck.status ?? 401);
      }

      try {
        const result = await ctx.runMutation(internal.cmsInternal.registerSchema, {
          slug,
          fields,
        });
        return jsonResponse(result, 200);
      } catch (error) {
        return jsonResponse(
          { error: error instanceof Error ? error.message : "Enregistrement échoué" },
          400,
        );
      }
    }),
  });
}
