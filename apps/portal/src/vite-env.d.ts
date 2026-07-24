/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_PORTAL_ROLE?: "operator" | "client";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
