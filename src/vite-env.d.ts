/// <reference types="vite/client" />

declare module 'virtual:app-config' {
  /** Active environment's settings, generated from config/appsettings*.json. */
  export const appConfig: {
    readonly environment: 'development' | 'staging' | 'production'
    readonly android: { readonly packageName: string }
    readonly ios: { readonly bundleId: string }
  }
}

interface ImportMetaEnv {
  readonly VITE_ENVIRONMENT?: 'development' | 'staging' | 'production'
  readonly VITE_API_BASE_URL: string
  readonly VITE_WEBSITE_URL?: string
  readonly VITE_ANDROID_STORE_URL?: string
  readonly VITE_IOS_STORE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
