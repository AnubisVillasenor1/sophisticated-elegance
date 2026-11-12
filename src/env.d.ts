/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `"true"` solo en builds de demostración; cualquier otro valor es LIVE. */
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
