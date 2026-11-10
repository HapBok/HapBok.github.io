import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/js/modules/reading-tools.js', import.meta.url), 'utf8');
const { initReadingTools } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

test('copy preserves raw code and announces clipboard rejection', async () => {
  const documentOriginal = globalThis.document;
  const clipboardOriginal = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const timerOriginal = globalThis.setTimeout;
  const nodes = [];
  let copied;
  class Element {
    children = []; handlers = {}; className = ''; textContent = '';
    constructor(tag) { this.tagName = tag; nodes.push(this); }
    append(...items) { this.children.push(...items); }
    before() {}
    closest() { return null; }
    setAttribute() {}
    addEventListener(name, callback) { this.handlers[name] = callback; }
  }
  const pre = new Element('pre');
  const code = new Element('code');
  code.className = 'language-js';
  code.textContent = "const x = '<script>not HTML</script>';\n";
  pre.querySelector = () => code;
  const body = { querySelectorAll: selector => selector === 'pre' ? [pre] : [] };
  globalThis.document = {
    querySelector: selector => selector === '[data-post-body]' ? body : null,
    createElement: tag => new Element(tag),
  };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
    clipboard: { writeText: async value => { copied = value; } },
  } });
  globalThis.setTimeout = () => 0;
  try {
    initReadingTools();
    const button = nodes.find(node => node.className === 'code-copy');
    const status = nodes.find(node => node.className === 'sr-only');
    await button.handlers.click();
    assert.equal(copied, code.textContent);
    assert.equal(button.textContent, '✓ 복사됨');
    navigator.clipboard.writeText = async () => { throw new Error('Permission denied'); };
    await button.handlers.click();
    assert.equal(button.textContent, '복사 실패');
    assert.match(status.textContent, /직접 선택/);
  } finally {
    globalThis.document = documentOriginal;
    globalThis.setTimeout = timerOriginal;
    if (clipboardOriginal) Object.defineProperty(globalThis, 'navigator', clipboardOriginal);
    else delete globalThis.navigator;
  }
});
