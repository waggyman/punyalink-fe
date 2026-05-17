/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_BASE_DOMAIN?: string;
  readonly VITE_DEV_TENANT?: string;
  readonly VITE_APEX_HOSTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
