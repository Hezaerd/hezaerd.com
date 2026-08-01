/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  /** Optional override for Convex HTTP actions URL (defaults to VITE_CONVEX_URL with .cloud → .site). */
  readonly VITE_CONVEX_SITE_URL?: string;
  readonly VITE_WORKOS_CLIENT_ID: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_BRAND_URL?: string;
  readonly VITE_PORTFOLIO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
