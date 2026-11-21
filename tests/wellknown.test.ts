import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  APP_ENVIRONMENTS,
  buildAppleAssociation,
  buildAssetLinks,
  mergeSettings,
  normalizeFingerprints,
  resolveEnvironment,
  toPublicConfig,
  type AppEnvironment,
  type AppSettings,
} from '../config/appConfig.ts';

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const vercel = JSON.parse(read('vercel.json')) as {
  rewrites: { source: string; destination: string }[];
  headers: { source: string; headers: { key: string; value: string }[] }[];
};

const FP = 'B7:99:7D:1C:6C:0B:55:03:5F:62:68:73:B9:2C:9B:38:12:7E:8D:3D:91:CF:35:FE:2E:DF:65:CF:A0:84:E7:8C';

const loadSettings = (env: AppEnvironment): AppSettings => {
  const base = JSON.parse(read('config/appsettings.json')) as AppSettings;
  const overlay =
    env === 'production' ? {} : (JSON.parse(read(`config/appsettings.${env}.json`)) as object);
  return { ...mergeSettings(base, overlay), environment: env };
};

test('each environment resolves to its own Android package and iOS bundle id', () => {
  const expected = {
    production: 'com.yakku.app',
    development: 'com.yakku.app.dev',
    staging: 'com.yakku.app.staging',
  } as const;
  for (const env of APP_ENVIRONMENTS) {
    const s = loadSettings(env);
    assert.equal(s.environment, env);
    assert.equal(s.android.packageName, expected[env]);
    assert.equal(s.ios.bundleId, expected[env]);
  }
});

test('environment resolution: VITE_ENVIRONMENT wins, otherwise the Vite mode, unknown values rejected', () => {
  assert.equal(resolveEnvironment('staging', 'production'), 'staging');
  assert.equal(resolveEnvironment(' Development ', 'production'), 'development');
  assert.equal(resolveEnvironment(undefined, 'development'), 'development');
  assert.equal(resolveEnvironment('', 'production'), 'production');
  assert.throws(() => resolveEnvironment('qa', 'production'), /Invalid VITE_ENVIRONMENT/);
});

test('fingerprints are defined in the appsettings files and are valid', () => {
  for (const env of ['development', 'staging'] as const) {
    const fps = normalizeFingerprints(loadSettings(env).android.sha256Fingerprints);
    assert.deepEqual(fps, [FP], env);
  }
  // Production has no committed fingerprint yet; it must still be a valid (possibly empty) list.
  assert.doesNotThrow(() => normalizeFingerprints(loadSettings('production').android.sha256Fingerprints));
});

test('mergeSettings deep merges without mutating the base', () => {
  const base = { a: { b: 1, c: 2 }, d: 'x' };
  const merged = mergeSettings(base, { a: { b: 9 } });
  assert.deepEqual(merged, { a: { b: 9, c: 2 }, d: 'x' });
  assert.equal(base.a.b, 1);
});

test('fingerprints are normalised and validated', () => {
  assert.deepEqual(normalizeFingerprints(undefined), []);
  assert.deepEqual(normalizeFingerprints([FP.toLowerCase()]), [FP]);
  assert.deepEqual(normalizeFingerprints([FP, ` ${FP} `]), [FP]);
  assert.throws(() => normalizeFingerprints(['not-a-fingerprint']), /Invalid SHA-256 fingerprint/);
  assert.throws(() => normalizeFingerprints([FP.slice(0, -3)]), /Invalid SHA-256 fingerprint/);
});

test('generated assetlinks.json targets the environment package with the given fingerprints', () => {
  const links = buildAssetLinks(loadSettings('development'), [FP]);
  assert.equal(links[0].target.namespace, 'android_app');
  assert.equal(links[0].target.package_name, 'com.yakku.app.dev');
  assert.deepEqual(links[0].target.sha256_cert_fingerprints, [FP]);
});

test('generated apple-app-site-association covers /vote and legacy /vote/* for the environment bundle', () => {
  const aasa = buildAppleAssociation(loadSettings('staging'), 'ABCDE12345');
  const detail = aasa.applinks.details[0];
  assert.deepEqual(detail.appIDs, ['ABCDE12345.com.yakku.app.staging']);
  assert.deepEqual(detail.components, [{ '/': '/vote' }, { '/': '/vote/*' }]);
});

test('public config exposes only environment, package and bundle id', () => {
  const pub = toPublicConfig(loadSettings('production'));
  assert.deepEqual(pub, {
    environment: 'production',
    android: { packageName: 'com.yakku.app' },
    ios: { bundleId: 'com.yakku.app' },
  });
});

test('SPA fallback rewrite never captures /.well-known or /api', () => {
  const spa = vercel.rewrites.find((r) => r.destination === '/index.html');
  assert.ok(spa);
  const re = new RegExp(`^${spa.source}$`);
  assert.ok(re.test('/vote/0cbe6985-219f-4ed7-b780-b93fe2be5fe1'));
  assert.ok(!re.test('/.well-known/assetlinks.json'));
  assert.ok(!re.test('/.well-known/apple-app-site-association'));
  assert.ok(!re.test('/api/poll'));
});

test('association files are served as application/json', () => {
  for (const file of ['assetlinks.json', 'apple-app-site-association']) {
    const rule = vercel.headers.find((h) => h.source === `/.well-known/${file}`);
    assert.ok(rule, file);
    assert.ok(rule.headers.some((h) => h.key === 'Content-Type' && h.value === 'application/json'));
  }
});
