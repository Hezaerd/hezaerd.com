import type { CmsField } from "@hezaerd/cms";

/** Override per client repo — must match Portal `clients.slug`. */
export const CMS_SLUG = "demo-client";

export const CMS_FIELDS: CmsField[] = [
  { fieldKey: "hero.title", type: "text", constraints: { maxLength: 80 } },
  {
    fieldKey: "hero.photo",
    type: "image",
    constraints: { aspect: "16/9", maxWidth: 1920, priority: true },
  },
];
