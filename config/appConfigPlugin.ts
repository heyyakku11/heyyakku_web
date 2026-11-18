import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import {
  // buildAppleAssociation, // TODO(ios): re-enable together with the Apple Team ID below.
  buildAssetLinks,
  mergeSettings,
  normalizeFingerprints,
  resolveEnvironment,
  toPublicConfig,
  type AppSettings,
  type AppSettingsOverride,
} from './appConfig.ts';

const VIRTUAL_ID = 'virtual:app-config';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const WELL_KNOWN = {
  assetlinks: '/.well-known/assetlinks.json',
  // aasa: '/.well-known/apple-app-site-association', // TODO(ios): needs the Apple Team ID.
} as const;

const readJson = <T>(file: string): T =>
  JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8')) as T;

/**
 * Picks `config/appsettings.{env}.json` (env from VITE_ENVIRONMENT, else the Vite mode), merges it over
 * `config/appsettings.json`, exposes the result as `virtual:app-config`, and generates the
 * `.well-known` association files for the active environment.
 */
export function appConfigPlugin(): Plugin {
  let settings: AppSettings;
  let fingerprints: string[] = [];
  // TODO(ios): Apple Team ID is not available yet, so the iOS association file is not generated.
  // let teamId = 'REPLACE_WITH_APPLE_TEAM_ID';

  const files = () => ({
    [WELL_KNOWN.assetlinks]: JSON.stringify(buildAssetLinks(settings, fingerprints), null, 2),
    // [WELL_KNOWN.aasa]: JSON.stringify(buildAppleAssociation(settings, teamId), null, 2),
  });

  return {
    name: 'app-config',

    config(_, { mode }) {
      // Runs before env files are injected into import.meta.env; resolve everything here.
      const env = loadEnv(mode, process.cwd(), 'VITE_');
      const environment = resolveEnvironment(env.VITE_ENVIRONMENT ?? process.env.VITE_ENVIRONMENT, mode);
      const base = readJson<AppSettings>('./appsettings.json');
      const overlay =
        environment === 'production'
          ? {}
          : readJson<AppSettingsOverride>(`./appsettings.${environment}.json`);
      settings = mergeSettings(base, overlay);
      settings.environment = environment;

      // Fingerprints are defined in config/appsettings*.json (public values, safe to commit).
      fingerprints = normalizeFingerprints(settings.android.sha256Fingerprints);
      if (fingerprints.length === 0) {
        console.warn(
          `[app-config] No android.sha256Fingerprints in appsettings for "${environment}"; assetlinks.json will have none.`,
        );
      }
      // teamId = env.VITE_APPLE_TEAM_ID ?? process.env.VITE_APPLE_TEAM_ID ?? teamId;
      console.log(`[app-config] environment=${environment} android=${settings.android.packageName}`);
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },

    load(id) {
      if (id !== RESOLVED_ID) return null;
      return `export const appConfig = ${JSON.stringify(toPublicConfig(settings))};`;
    },

    // Dev server: serve the generated association files.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0];
        const body = (files() as Record<string, string>)[path];
        if (!body) return next();
        res.setHeader('Content-Type', 'application/json');
        res.end(body);
      });
    },

    // Build: emit them into dist/.well-known.
    generateBundle() {
      for (const [path, source] of Object.entries(files())) {
        this.emitFile({ type: 'asset', fileName: path.slice(1), source });
      }
    },
  };
}
