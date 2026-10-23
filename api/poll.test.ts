import assert from 'node:assert/strict';
import { test } from 'node:test';
import { escapeHtml, isShareable, isUuid, parsePollEnvelope, renderPreviewHtml } from './poll.ts';

const ID = '0cbe6985-219f-4ed7-b780-b93fe2be5fe1';
const envelope = (over: Record<string, unknown> = {}) => ({
  success: true,
  message: 'ok',
  data: {
    contentType: 'POLL',
    contentId: ID,
    shareCode: 'aB3dE5gH7k',
    question: 'Q <b>"x"</b>?',
    status: 'active',
    poll: { pollType: 'question', media: null },
    ...over,
  },
});

test('isUuid', () => {
  assert.equal(isUuid(ID), true);
  assert.equal(isUuid('nope'), false);
  assert.equal(isUuid(null), false);
});

test('escapeHtml escapes all special characters', () => {
  assert.equal(escapeHtml(`<a href="x" t='y'>&`), '&lt;a href=&quot;x&quot; t=&#39;y&#39;&gt;&amp;');
});

test('parsePollEnvelope reads data and rejects malformed bodies', () => {
  assert.equal(parsePollEnvelope(envelope())?.id, ID);
  assert.equal(parsePollEnvelope({ success: false }), null);
  assert.equal(parsePollEnvelope({ success: true, data: null }), null);
  assert.equal(parsePollEnvelope(envelope({ contentId: 'bad' })), null);
});

test('isShareable only allows published polls', () => {
  assert.equal(isShareable(parsePollEnvelope(envelope())!), true);
  assert.equal(isShareable(parsePollEnvelope(envelope({ status: 'draft' }))!), false);
});

test('rendered HTML escapes the question and carries OG tags', () => {
  const html = renderPreviewHtml({
    poll: parsePollEnvelope(envelope()),
    pollId: 'aB3dE5gH7k',
    siteUrl: 'https://yakku.example',
  });
  assert.ok(html.includes('<meta property="og:title" content="Q &lt;b&gt;&quot;x&quot;&lt;/b&gt;?">'));
  assert.ok(html.includes(`<meta property="og:url" content="https://yakku.example/poll/aB3dE5gH7k">`));
  assert.ok(html.includes('og:image" content="https://yakku.example/yakku_hero.png"'));
  assert.ok(html.includes(`href="https://yakku.example/vote/aB3dE5gH7k"`));
  assert.ok(!html.includes('<b>'));
});

test('generic preview leaks no poll data', () => {
  const html = renderPreviewHtml({ poll: null, pollId: ID, siteUrl: 'https://yakku.example' });
  assert.ok(!html.includes('Q '));
  assert.ok(html.includes('noindex'));
});
