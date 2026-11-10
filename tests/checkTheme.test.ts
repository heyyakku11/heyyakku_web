import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCheckTheme } from '../src/lib/checkTheme.ts';
import { parseWeeklyChecks } from '../src/lib/checkApi.ts';

const legacy = { title: 'Loyalty Check', backgroundColor: '#FFEFC2', sticker: 'Say it plain' };

const vibe = {
  checkType: 'VIBE_CHECK',
  isLegacy: false,
  config: {
    heading: 'Vibe Check',
    backgroundColor: '#ECE3FF',
    labelColor: '#111111',
    questionColor: '#222222',
    accentColor: '#7B4DD0',
    stickerLabel: 'Read the room',
    optionBackgroundColor: '#333333',
    optionTextColor: '#FAFAFA',
  },
};

test('the card is driven by the backend theme', () => {
  const t = resolveCheckTheme(vibe, legacy);
  assert.equal(t.checkType, 'VIBE_CHECK');
  assert.equal(t.heading, 'Vibe Check');
  assert.equal(t.background, '#ECE3FF');
  assert.equal(t.headingColor, '#111111');
  assert.equal(t.questionColor, '#222222');
  assert.equal(t.sticker, 'Read the room');
  assert.equal(t.optionBackground, '#333333');
  assert.equal(t.optionText, '#FAFAFA');
});

test('missing optional properties fall back safely (sticker follows accent)', () => {
  const { optionBackgroundColor: _a, optionTextColor: _b, ...rest } = vibe.config;
  const t = resolveCheckTheme({ ...vibe, config: rest }, legacy);
  assert.equal(t.stickerColor, '#7B4DD0');
  assert.equal(t.optionBackground, '#FFFFFF');
  assert.equal(t.optionText, '#21191D');
});

test('malformed colors fall back and a valid two-stop gradient is used', () => {
  const bad = resolveCheckTheme({ config: { ...vibe.config, accentColor: 'nope', backgroundGradient: ['#FFFFFF'] } }, legacy);
  assert.equal(bad.accent, '#D02E62');
  assert.equal(bad.background, '#ECE3FF');

  const good = resolveCheckTheme({ config: { ...vibe.config, backgroundGradient: ['#FFFFFF', '#000000'] } }, legacy);
  assert.equal(good.background, 'linear-gradient(180deg, #FFFFFF, #000000)');
});

test('legacy checks and unusable themes render from the flat fields', () => {
  for (const raw of [undefined, null, {}, { config: 'x' }]) {
    const t = resolveCheckTheme(raw, legacy);
    assert.equal(t.heading, 'Loyalty Check');
    assert.equal(t.background, '#FFEFC2');
    assert.equal(t.sticker, 'Say it plain');
    assert.equal(t.checkType, null);
  }
});

test('parseWeeklyChecks attaches a resolved theme to each check', () => {
  const body = {
    success: true,
    data: [
      { id: 'a', title: 'Vibe Check', question: 'Q?', backgroundColor: '#ECE3FF', sticker: 's', options: [{ id: 'o', text: 'Yes' }], used: false, theme: vibe },
      { id: 'b', title: 'Old', question: 'Q?', backgroundColor: '#FFEFC2', sticker: 'x', options: [{ id: 'o', text: 'Yes' }], used: false },
    ],
  };
  const checks = parseWeeklyChecks(body)!;
  assert.equal(checks[0].theme.checkType, 'VIBE_CHECK');
  assert.equal(checks[1].theme.heading, 'Old');
  assert.equal(checks[1].theme.background, '#FFEFC2');
});
