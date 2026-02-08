/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENGINE_COUNT?: string;
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
