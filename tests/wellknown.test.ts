import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const vercel = JSON.parse(read('vercel.json')) as {
  rewrites: { source: string; destination: string }[];
  headers: { source: string; headers: { key: string; value: string }[] }[];
};

test('assetlinks.json is valid and targets the Android app', () => {
  const links = JSON.parse(read('public/.well-known/assetlinks.json'));
  assert.equal(links[0].target.namespace, 'android_app');
  assert.equal(links[0].target.package_name, 'com.example.yakku');
  for (const fp of links[0].target.sha256_cert_fingerprints) {
    assert.match(fp, /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/);
  }
});

test('apple-app-site-association is valid JSON limited to /vote/*', () => {
  const aasa = JSON.parse(read('public/.well-known/apple-app-site-association'));
  const detail = aasa.applinks.details[0];
  assert.match(detail.appIDs[0], /\.com\.example\.yakku$/);
  assert.deepEqual(detail.components, [{ '/': '/vote/*' }]);
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
