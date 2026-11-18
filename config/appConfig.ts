// Pure helpers for per-environment app configuration. No Vite or filesystem access here so the
// logic can be unit tested directly (see tests/wellknown.test.ts).

export const APP_ENVIRONMENTS = ['development', 'staging', 'production'] as const;
export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

export interface AppSettings {
  environment: AppEnvironment;
  android: {
    packageName: string;
    /** SHA-256 signing certificate fingerprint(s) for this environment (public, safe to commit). */
    sha256Fingerprints: string[];
  };
  ios: {
    bundleId: string;
  };
}

export type AppSettingsOverride = {
  [K in keyof AppSettings]?: AppSettings[K] extends object ? Partial<AppSettings[K]> : AppSettings[K];
};

/** Client-safe subset exposed through `virtual:app-config`. */
export interface PublicAppConfig {
  environment: AppEnvironment;
  android: { packageName: string };
  ios: { bundleId: string };
}

const FINGERPRINT_RE = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

/**
 * Resolves the active environment. `VITE_ENVIRONMENT` wins; otherwise fall back to the Vite mode
 * (`development` for the dev server, `production` for builds).
 */
export function resolveEnvironment(envValue: string | undefined, mode: string): AppEnvironment {
  const raw = (envValue?.trim() || (mode === 'development' ? 'development' : 'production')).toLowerCase();
  if ((APP_ENVIRONMENTS as readonly string[]).includes(raw)) return raw as AppEnvironment;
  throw new Error(
    `Invalid VITE_ENVIRONMENT "${envValue}". Expected one of: ${APP_ENVIRONMENTS.join(', ')}.`,
  );
}

/** Deep-merges `override` onto `base` (plain objects only; arrays and primitives are replaced). */
export function mergeSettings<T extends object>(base: T, override: object): T {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    const current = out[key];
    if (
      value && typeof value === 'object' && !Array.isArray(value) &&
      current && typeof current === 'object' && !Array.isArray(current)
    ) {
      out[key] = mergeSettings(current, value);
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out as T;
}

/** Trims, uppercases, de-duplicates and validates a list of SHA-256 fingerprints. */
export function normalizeFingerprints(raw: readonly string[] | undefined): string[] {
  const list = (raw ?? []).map((s) => s.trim().toUpperCase()).filter(Boolean);
  for (const fp of list) {
    if (!FINGERPRINT_RE.test(fp)) {
      throw new Error(`Invalid SHA-256 fingerprint "${fp}". Expected 32 colon separated hex bytes.`);
    }
  }
  return [...new Set(list)];
}

export function toPublicConfig(settings: AppSettings): PublicAppConfig {
  return {
    environment: settings.environment,
    android: { packageName: settings.android.packageName },
    ios: { bundleId: settings.ios.bundleId },
  };
}

export function buildAssetLinks(settings: AppSettings, fingerprints: string[]) {
  return [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: settings.android.packageName,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];
}

export function buildAppleAssociation(settings: AppSettings, teamId: string) {
  return {
    applinks: {
      details: [
        {
          appIDs: [`${teamId}.${settings.ios.bundleId}`],
          components: [{ '/': '/vote/*' }],
        },
      ],
    },
  };
}
