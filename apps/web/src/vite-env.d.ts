/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RELMES_PARENT_ORIGINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
