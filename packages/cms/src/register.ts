export type CmsTextField = {
  fieldKey: string;
  type: "text";
  constraints: { maxLength: number; multiline?: boolean };
};

export type CmsImageField = {
  fieldKey: string;
  type: "image";
  constraints: { aspect: string; maxWidth: number; priority?: boolean };
};

export type CmsField = CmsTextField | CmsImageField;

type RegisterSchemaResponse = {
  registered: number;
  deprecated: number;
};

export async function registerFields(input: {
  slug: string;
  fields: CmsField[];
  convexSiteUrl: string;
  deployToken: string;
}): Promise<RegisterSchemaResponse> {
  const baseUrl = input.convexSiteUrl.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/cms/register-schema`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.deployToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      slug: input.slug,
      fields: input.fields,
    }),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(
      `registerFields failed (${response.status}): ${bodyText || response.statusText}`,
    );
  }

  let payload: RegisterSchemaResponse;
  try {
    payload = JSON.parse(bodyText) as RegisterSchemaResponse;
  } catch {
    throw new Error(`registerFields failed: invalid JSON response (${bodyText})`);
  }

  if (
    typeof payload.registered !== "number" ||
    typeof payload.deprecated !== "number"
  ) {
    throw new Error(`registerFields failed: unexpected response shape (${bodyText})`);
  }

  return payload;
}
