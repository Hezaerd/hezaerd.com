/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_WORKOS_CLIENT_ID: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_BRAND_URL?: string;
  readonly VITE_PORTFOLIO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
