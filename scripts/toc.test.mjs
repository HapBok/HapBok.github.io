import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/js/modules/toc.js', import.meta.url), 'utf8');
const { initToc } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

test('outline survives responsive moves, disambiguates headings and follows the current section', () => {
  const keys = ['document', 'matchMedia', 'requestAnimationFrame', 'addEventListener', 'window', 'scrollY', 'innerHeight'];
  const originals = Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  class Element extends EventTarget {
    children = []; attributes = new Map(); id = ''; hidden = false; scrollTop = 0;
    textContent = ''; top = 0; height = 24;
    classList = { add() {}, remove() {} };
    constructor(tag) { super(); this.tagName = tag; }
    append(node) {
      if (node.parentElement) node.parentElement.children = node.parentElement.children.filter(item => item !== node);
      this.children.push(node); node.parentElement = this;
    }
    setAttribute(name, value) { this.attributes.set(name, value); }
    removeAttribute(name) { this.attributes.delete(name); }
    getAttribute(name) { return this.attributes.get(name); }
    getBoundingClientRect() { return { top: this.top, bottom: this.top + this.height, height: this.height }; }
  }
  const headings = [new Element('H2'), new Element('H3'), new Element('H2')];
  headings.forEach((heading, index) => { heading.textContent = '반복 제목'; heading.top = 200 + index * 400; });
  const body = { querySelectorAll: () => headings };
  const toc = new Element('ASIDE'), list = new Element('OL'), details = new Element('DETAILS');
  const desktop = new Element('DIV'), mobile = new Element('DIV');
  desktop.append(toc); toc.hidden = true; toc.top = 100; toc.height = 300;
  toc.querySelector = selector => selector === 'details' ? details : list;
  const compact = new EventTarget(); compact.matches = false;
  const viewport = new EventTarget(), frames = [];
  let mediaQuery;
  const documentMock = {
    querySelector: selector => ({ '[data-post-body]': body, '[data-toc]': toc, '[data-mobile-toc]': mobile,
      '.site-header': { getBoundingClientRect: () => ({ height: 76 }) } })[selector],
    querySelectorAll: () => [{ id: '반복-제목' }],
    createElement: tag => new Element(tag.toUpperCase()),
    documentElement: { scrollHeight: 3000 },
  };
  const values = {
    document: documentMock, matchMedia: query => { mediaQuery = query; return compact; },
    requestAnimationFrame: callback => frames.push(callback), addEventListener: viewport.addEventListener.bind(viewport),
    window: {}, scrollY: 0, innerHeight: 800,
  };
  for (const [key, value] of Object.entries(values)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  const flush = () => { while (frames.length) frames.shift()(); };
  try {
    initToc(); flush();
    assert.equal(mediaQuery, '(max-width: 1279px)');
    assert.equal(toc.hidden, false);
    assert.equal(details.open, true);
    assert.equal(toc.parentElement, desktop);
    assert.deepEqual(headings.map(item => item.id), ['반복-제목-2', '반복-제목-3', '반복-제목-4']);
    const links = list.children.map(item => item.children[0]);
    assert.equal(list.children[1].className, 'toc-subheading');
    assert.equal(links[0].getAttribute('aria-current'), 'location');
    headings[0].top = -400; headings[1].top = 90;
    viewport.dispatchEvent(new Event('scroll')); flush();
    assert.equal(links[1].getAttribute('aria-current'), 'location');
    assert.equal(links[0].getAttribute('aria-current'), undefined);
    compact.matches = true; compact.dispatchEvent(new Event('change'));
    assert.equal(toc.parentElement, mobile);
    assert.equal(details.open, false);
    assert.equal(list.children.length, 3);
    assert.equal(links[1].getAttribute('aria-current'), 'location');
    links[1].top = 600; toc.scrollTop = 0;
    compact.matches = false; compact.dispatchEvent(new Event('change'));
    viewport.dispatchEvent(new Event('resize')); flush();
    assert.equal(toc.parentElement, desktop);
    assert.equal(details.open, true);
    assert.ok(toc.scrollTop > 0, 'an active entry below the rail is brought back into view after resizing');
    globalThis.scrollY = 2200;
    viewport.dispatchEvent(new Event('scroll')); flush();
    assert.equal(links[2].getAttribute('aria-current'), 'location');
    assert.equal(links[1].getAttribute('aria-current'), undefined);
  } finally {
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
});
