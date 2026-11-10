import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/js/modules/companions.js', import.meta.url), 'utf8');
const { initCompanions } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

test('pet interactions pause offscreen, prevent overlapping greetings, and respect reduced motion', async () => {
  const original = Object.fromEntries(['document', 'window', 'matchMedia', 'Image', 'IntersectionObserver', 'setTimeout', 'clearTimeout'].map(key => [key, globalThis[key]]));
  const timers = new Map(); let timerId = 0; let observer;
  class Pet extends EventTarget {
    dataset = { pet: 'happy', atlas: '/happy.png' };
    sprite = { style: { setProperty() {} } };
    querySelector() { return this.sprite; }
    setAttribute() {}
    getBoundingClientRect() { return { left: 0, width: 200 }; }
  }
  const pet = new Pet();
  const documentMock = new EventTarget();
  documentMock.hidden = false;
  documentMock.querySelectorAll = () => [pet];
  documentMock.querySelector = () => ({ hidden: true, textContent: '' });
  const reduced = new EventTarget(); reduced.matches = false;
  const fine = { matches: true };
  try {
    globalThis.document = documentMock;
    globalThis.window = new EventTarget();
    globalThis.matchMedia = query => query.includes('reduced-motion') ? reduced : fine;
    globalThis.Image = class { naturalWidth = 2000; naturalHeight = 800; decode() { return Promise.resolve(); } };
    globalThis.IntersectionObserver = class { constructor(callback) { observer = callback; } observe() {} };
    globalThis.window.IntersectionObserver = globalThis.IntersectionObserver;
    globalThis.setTimeout = callback => { const id = ++timerId; timers.set(id, callback); return id; };
    globalThis.clearTimeout = id => timers.delete(id);
    initCompanions();
    await Promise.resolve();
    observer([{ target: pet, isIntersecting: true }]);
    assert.equal(pet.dataset.animating, 'true');
    assert.equal(pet.dataset.frame, '4');
    const timerCount = timers.size;
    pet.dispatchEvent(new Event('click'));
    pet.dispatchEvent(new Event('click'));
    assert.equal(timers.size, timerCount, 'repeated click must not queue greetings');
    observer([{ target: pet, isIntersecting: false }]);
    assert.equal(pet.dataset.frame, '0');
    assert.equal(timers.size, 0, 'offscreen must cancel animation and blink timers');
    observer([{ target: pet, isIntersecting: true }]);
    assert.equal(timers.size, 1, 'returning schedules a blink without repeating the entry greeting');
    pet.dispatchEvent(new Event('pointerenter'));
    assert.equal(pet.dataset.animating, 'true', 'hover must greet, not just track a pointer');
    assert.equal(pet.dataset.frame, '4');
    pet.dispatchEvent(new Event('pointerenter'));
    assert.equal(timers.size, 1, 'hover must not queue duplicate greetings');
    documentMock.hidden = true;
    documentMock.dispatchEvent(new Event('visibilitychange'));
    assert.equal(timers.size, 0, 'hidden tab must cancel timers');
    documentMock.hidden = false;
    reduced.matches = true;
    reduced.dispatchEvent(new Event('change'));
    pet.dispatchEvent(new Event('click'));
    assert.equal(pet.dataset.frame, '0');
    assert.equal(timers.size, 0, 'reduced motion must remain static');
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});
