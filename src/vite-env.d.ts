/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WEBSITE_URL?: string
  readonly VITE_ANDROID_STORE_URL?: string
  readonly VITE_IOS_STORE_URL?: string
  readonly VITE_LEGAL_ENTITY_NAME?: string
  readonly VITE_PRIVACY_CONTACT_EMAIL?: string
  readonly VITE_LEGAL_BUSINESS_ADDRESS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
