import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/js/modules/navigation.js', import.meta.url), 'utf8');
const { initNavigation } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

test('desktop collapse, category disclosure and mobile Escape stay independent', () => {
  const originals = Object.fromEntries(['document', 'matchMedia', 'localStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  class Element extends EventTarget {
    attributes = new Map(); hidden = false; inert = false;
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name); }
    focus() { document.activeElement = this; }
    getClientRects() { return [1]; }
    closest() { return null; }
  }
  const menu = new Element(), toggle = new Element(), close = new Element(), scrim = new Element();
  const folder = new Element(), panel = new Element();
  folder.setAttribute('aria-controls', 'folder-development');
  folder.setAttribute('data-folder-title', '개발');
  folder.setAttribute('aria-expanded', 'false'); panel.hidden = true;
  menu.querySelectorAll = selector => selector === '.folder-toggle' ? [folder] : [close, folder];
  menu.contains = item => item === close || item === folder;
  const compact = new EventTarget(); compact.matches = false;
  const classes = new Set(['layout--archive']);
  const storage = new Map();
  const documentMock = new EventTarget();
  documentMock.body = { classList: {
    contains: name => classes.has(name),
    toggle: (name, value) => value ? classes.add(name) : classes.delete(name),
  } };
  documentMock.querySelector = selector => ({ '#site-menu': menu, '.menu-toggle': toggle, '.menu-close': close, '.menu-scrim': scrim })[selector];
  documentMock.getElementById = () => panel;
  Object.defineProperty(globalThis, 'document', { configurable: true, value: documentMock });
  Object.defineProperty(globalThis, 'matchMedia', { configurable: true, value: () => compact });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) } });
  try {
    initNavigation();
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    assert.equal(menu.inert, false);
    folder.dispatchEvent(new Event('click'));
    assert.equal(panel.hidden, false);
    assert.equal(folder.getAttribute('aria-expanded'), 'true');
    assert.equal(folder.getAttribute('aria-label'), '개발 게시글 접기');
    folder.dispatchEvent(new Event('click'));
    assert.equal(panel.hidden, true);
    toggle.dispatchEvent(new Event('click'));
    assert.equal(menu.inert, true);
    assert.equal(classes.has('sidebar-is-collapsed'), true);
    assert.equal(storage.get('hapbok-sidebar-collapsed'), 'true');
    toggle.dispatchEvent(new Event('click'));
    assert.equal(menu.inert, false);
    assert.equal(storage.get('hapbok-sidebar-collapsed'), 'false');
    compact.matches = true;
    compact.dispatchEvent(new Event('change'));
    assert.equal(menu.inert, true);
    toggle.dispatchEvent(new Event('click'));
    assert.equal(menu.inert, false);
    assert.equal(scrim.hidden, false);
    folder.dispatchEvent(new Event('click'));
    assert.equal(menu.inert, false, 'expanding a folder must not dismiss the drawer');
    const escape = new Event('keydown', { cancelable: true });
    Object.defineProperty(escape, 'key', { value: 'Escape' });
    documentMock.dispatchEvent(escape);
    assert.equal(menu.inert, true);
    assert.equal(document.activeElement, toggle);
    compact.matches = false;
    compact.dispatchEvent(new Event('change'));
    assert.equal(menu.inert, false, 'mobile dismissal must not overwrite desktop preference');
  } finally {
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
});
