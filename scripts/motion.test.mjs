import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/js/modules/motion.js', import.meta.url), 'utf8');
const { initMotion } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

test('page mascots react once on hover, pause hidden and respect reduced motion', () => {
  const names = ['document', 'matchMedia', 'setTimeout', 'clearTimeout'];
  const original = Object.fromEntries(names.map(key => [key, globalThis[key]]));
  const doc = new EventTarget(); doc.hidden = false;
  const mascot = new EventTarget(); const classes = new Set();
  mascot.classList = { add: name => classes.add(name), remove: name => classes.delete(name) };
  const reduced = new EventTarget(); reduced.matches = false;
  const timers = new Map(); let id = 0;
  doc.querySelectorAll = () => [mascot]; doc.querySelector = () => null;
  try {
    globalThis.document = doc;
    globalThis.matchMedia = query => query.includes('reduced') ? reduced : { matches: true };
    globalThis.setTimeout = callback => { timers.set(++id, callback); return id; };
    globalThis.clearTimeout = timer => timers.delete(timer);
    initMotion();
    mascot.dispatchEvent(new Event('pointerenter'));
    assert.equal(classes.has('is-reacting'), true);
    mascot.dispatchEvent(new Event('click'));
    assert.equal(timers.size, 1, 'hover followed by click must not queue animations');
    doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange'));
    assert.equal(classes.size, 0);
    assert.equal(timers.size, 0);
    doc.hidden = false; reduced.matches = true;
    mascot.dispatchEvent(new Event('pointerenter'));
    mascot.dispatchEvent(new Event('click'));
    assert.equal(classes.size, 0);
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});
