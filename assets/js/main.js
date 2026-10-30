(() => {
  const body = document.body;
  const sidebar = document.querySelector('.site-explorer');
  const tree = document.querySelector('.file-tree');
  const searchPanel = document.querySelector('.search-panel');
  const searchInput = document.querySelector('.search-input');
  const searchResults = document.querySelector('.search-results');
  const explorerLabel = document.querySelector('.explorer-label');
  const searchLabel = document.querySelector('.search-label');
  const explorerButton = document.querySelector('.activity-button--explorer');
  const searchButton = document.querySelector('.activity-button--search');
  const mobileButton = document.querySelector('.mobile-menu-toggle');
  const mobile = window.matchMedia('(max-width: 780px)');
  let view = mobile.matches ? 'hidden' : 'explorer';

  const setView = (nextView, focusSearch = false) => {
    view = nextView;
    const visible = view !== 'hidden';
    const searching = view === 'search';
    body.dataset.sidebarView = view;
    body.classList.toggle('explorer-is-collapsed', !mobile.matches && !visible);
    body.classList.toggle('explorer-is-open', mobile.matches && visible);
    sidebar.inert = !visible;
    sidebar.setAttribute('aria-hidden', String(!visible));
    tree.hidden = view !== 'explorer';
    searchPanel.hidden = !searching;
    explorerLabel.hidden = searching;
    searchLabel.hidden = !searching;

    [[explorerButton, 'explorer', '탐색기'], [searchButton, 'search', '검색']].forEach(([button, mode, label]) => {
      button?.setAttribute('aria-expanded', String(view === mode));
      button?.setAttribute('aria-label', label + (view === mode ? ' 숨기기' : ' 열기'));
      button?.classList.toggle('is-active', view === mode);
    });
    mobileButton?.setAttribute('aria-expanded', String(visible));
    mobileButton?.setAttribute('aria-label', visible ? '사이드바 닫기' : '탐색기 열기');
    if (searching) renderSearchResults(searchInput.value);
    if (searching && focusSearch) searchInput.focus({ preventScroll: true });
  };

  const categoryLabels = {
    development: '개발', ctf: 'CTF · Wargame', 'bug-bounty': 'BugBounty',
    'blog-docs': '블로그 · 기술문서', 'analysis-conference': '논문 · 컨퍼런스',
    'contest-certificate': '공모전 · 자격증',
  };
  let searchIndex = [];
  let searchIndexValid = true;
  try {
    searchIndex = JSON.parse(document.getElementById('post-search-index')?.textContent || '[]');
  } catch {
    searchIndexValid = false;
  }
  const normalise = (value) => String(value || '').normalize('NFC').toLocaleLowerCase('ko-KR');
  const excerpt = (post, term) => {
    const content = String(post.content || post.description || '').replace(/\s+/g, ' ').trim();
    const match = normalise(content).indexOf(term);
    const start = Math.max(0, match - 35);
    const end = Math.min(content.length, Math.max(start + 125, match + term.length + 35));
    return (start ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '');
  };

  const renderSearchResults = (query = '') => {
    searchResults.replaceChildren();
    const term = normalise(query.trim());
    const message = (text) => {
      const paragraph = document.createElement('p');
      paragraph.className = 'search-empty';
      paragraph.textContent = text;
      searchResults.append(paragraph);
    };
    if (!searchIndexValid) return message('검색 정보를 불러오지 못했습니다. 페이지를 새로고침해 주세요.');
    if (!term) return message('검색어를 입력하면 일치하는 기록을 보여줍니다.');
    const matches = searchIndex.filter((post) => normalise(post.title + ' ' + post.description + ' ' + post.content).includes(term));
    if (!matches.length) return message('일치하는 게시글이 없습니다.');
    message(matches.length + '개의 기록');
    matches.forEach((post) => {
      const result = document.createElement('a');
      result.className = 'search-result';
      result.href = post.url;
      const meta = document.createElement('span');
      meta.className = 'search-result-meta';
      meta.textContent = (categoryLabels[post.category] || '기록') + ' · ' + post.date;
      const title = document.createElement('strong');
      title.textContent = post.title;
      const description = document.createElement('small');
      description.textContent = excerpt(post, term);
      result.append(meta, title, description);
      searchResults.append(result);
    });
  };

  explorerButton?.addEventListener('click', () => setView(view === 'explorer' ? 'hidden' : 'explorer'));
  searchButton?.addEventListener('click', () => setView(view === 'search' ? 'hidden' : 'search', true));
  mobileButton?.addEventListener('click', () => setView(view === 'hidden' ? 'explorer' : 'hidden'));
  const closeSidebar = () => {
    const returnFocus = view === 'search' ? searchButton : explorerButton;
    setView('hidden');
    returnFocus?.focus({ preventScroll: true });
  };
  document.querySelector('.explorer-close')?.addEventListener('click', closeSidebar);
  document.querySelector('.explorer-scrim')?.addEventListener('click', closeSidebar);
  sidebar?.addEventListener('click', (event) => {
    if (mobile.matches && event.target.closest('a')) setView('hidden');
  });
  searchInput?.addEventListener('input', () => renderSearchResults(searchInput.value));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && view !== 'hidden') closeSidebar();
  });
  mobile.addEventListener('change', () => setView(mobile.matches ? 'hidden' : 'explorer'));
  document.querySelectorAll('.tree-toggle').forEach((button) => {
    const label = button.getAttribute('aria-label').replace(/ 접기$/, '');
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', label + (expanded ? ' 접기' : ' 펼치기'));
      document.getElementById(button.getAttribute('aria-controls')).hidden = !expanded;
    });
  });
  setView(view);
  const headings = [...document.querySelectorAll('.post-body h2')];
  const outlineItems = [...document.querySelectorAll('.page-outline [data-outline-index]')];

  if (headings.length && outlineItems.length) {
    const count = Math.min(headings.length, outlineItems.length);
    const activate = (index) => {
      outlineItems.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === index));
    };

    headings.slice(0, count).forEach((heading, index) => {
      const id = heading.id || `section-${index + 1}`;
      heading.id = id;
      const item = outlineItems[index];
      const link = document.createElement('a');
      link.href = `#${id}`;
      link.textContent = item.textContent;
      item.replaceChildren(link);
    });

    const visibleHeadings = headings.slice(0, count);
    const updateOutline = () => {
      const chromeHeight = document.querySelector('.editor-chrome')?.getBoundingClientRect().height || 0;
      const markerLine = chromeHeight + 24;
      let activeIndex = 0;

      visibleHeadings.forEach((heading, index) => {
        if (heading.getBoundingClientRect().top <= markerLine) activeIndex = index;
      });
      activate(activeIndex);
    };

    let ticking = false;
    const requestOutlineUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateOutline();
        ticking = false;
      });
    };

    window.addEventListener('scroll', requestOutlineUpdate, { passive: true });
    window.addEventListener('resize', requestOutlineUpdate);
    requestOutlineUpdate();
  }
})();
