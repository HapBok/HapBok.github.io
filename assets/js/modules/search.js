const normalise = value => String(value || '').normalize('NFC').toLocaleLowerCase('ko-KR');
const node = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

export function initSearch() {
  const archive = document.querySelector('[data-archive]');
  if (!archive) return;
  const input = archive.querySelector('[data-search-input]');
  const records = archive.querySelector('[data-records]');
  const status = archive.querySelector('#search-status');
  const empty = archive.querySelector('[data-search-empty]');
  if (!input || !records || !status || !empty) return;
  const originals = [...records.childNodes].map(item => item.cloneNode(true));
  const scope = archive.dataset.category;
  let indexPromise;
  let sequence = 0;
  input.disabled = false;

  async function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(document.body.dataset.searchUrl)
        .then(response => {
          if (!response.ok) throw new Error('Search index unavailable');
          return response.json();
        })
        .then(posts => {
          if (!Array.isArray(posts)) throw new Error('Invalid search index');
          return posts.filter(post => !scope || post.category === scope)
            .sort((a, b) => String(b.date).localeCompare(String(a.date)));
        })
        .catch(error => { indexPromise = null; throw error; });
    }
    return indexPromise;
  }
  function announce(text) {
    status.hidden = false;
    status.textContent = text;
  }
  function syncAddress(query) {
    const url = new URL(location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }
  function excerpt(post, terms) {
    const description = String(post.description || '');
    const content = String(post.content || description).replace(/\s+/g, ' ').trim();
    const match = terms.map(term => normalise(content).indexOf(term)).find(offset => offset >= 0);
    if (match === undefined || normalise(description).includes(terms[0])) return description || content.slice(0, 150);
    const start = Math.max(0, match - 35);
    const end = Math.min(content.length, start + 150);
    return (start ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '');
  }
  function render(posts, terms) {
    const list = node('ol', 'archive-list');
    for (const post of posts) {
      const row = node('li', 'archive-item');
      row.dataset.postUrl = post.url;
      const time = node('time', '', String(post.date).replaceAll('-', '.'));
      time.dateTime = post.date;
      const copy = node('div', 'archive-copy');
      const heading = node('h3');
      const link = node('a', '', post.title);
      link.href = post.url;
      heading.append(link);
      const meta = node('div', 'record-meta');
      const category = node('a', '', post.categoryTitle);
      category.href = post.categoryUrl;
      meta.append(category);
      if (post.tags?.length) meta.append(node('span', 'record-tags', post.tags.join(' · ')));
      for (const key of ['platform', 'field', 'difficulty']) {
        if (post[key]) meta.append(node('span', '', post[key]));
      }
      copy.append(heading, node('p', '', excerpt(post, terms)), meta);
      row.append(time, copy);
      list.append(row);
    }
    records.replaceChildren(list);
    records.hidden = posts.length === 0;
    empty.hidden = posts.length !== 0;
  }
  async function search() {
    const ticket = ++sequence;
    const query = input.value.trim();
    syncAddress(query);
    if (!query) {
      records.replaceChildren(...originals.map(item => item.cloneNode(true)));
      records.hidden = false;
      empty.hidden = true;
      status.hidden = true;
      status.textContent = '';
      return;
    }
    announce('기록을 찾고 있습니다.');
    empty.hidden = true;
    try {
      const posts = await loadIndex();
      if (ticket !== sequence) return;
      const terms = normalise(query).split(/\s+/);
      const matches = posts.filter(post => {
        const haystack = normalise([post.title, post.description, post.content].join(' '));
        return terms.every(term => haystack.includes(term));
      });
      render(matches, terms);
      announce(matches.length + '개의 기록을 찾았습니다.');
    } catch {
      if (ticket !== sequence) return;
      records.hidden = false;
      records.replaceChildren(...originals.map(item => item.cloneNode(true)));
      empty.hidden = true;
      announce('검색 정보를 불러오지 못했습니다. 다시 입력하거나 아래 목록을 이용해 주세요.');
    }
  }
  input.addEventListener('input', search);
  const initialQuery = new URL(location.href).searchParams.get('q');
  if (initialQuery) { input.value = initialQuery; search(); }
  function focusFromHash() {
    if (location.hash === '#search') input.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', focusFromHash);
  focusFromHash();
}
