(() => {
  const body = document.body;
  const explorer = document.querySelector('.site-explorer');
  const scrim = document.querySelector('.explorer-scrim');
  const explorerTriggers = document.querySelectorAll('.mobile-menu-toggle, .activity-button--explorer');
  const searchTrigger = document.querySelector('.activity-button--search');
  const closeButton = document.querySelector('.explorer-close');
  const searchPanel = document.querySelector('.search-panel');
  const searchInput = document.querySelector('.search-input');
  const searchResults = document.querySelector('.search-results');
  const mobile = window.matchMedia('(max-width: 780px)');

  const setExplorerExpanded = (expanded) => {
    explorerTriggers.forEach((trigger) => {
      trigger.setAttribute('aria-expanded', String(expanded));
      trigger.setAttribute('aria-label', expanded ? '탐색기 숨기기' : '탐색기 열기');
      trigger.classList.toggle('is-active', expanded);
    });
  };

  const setSearchExpanded = (expanded) => {
    searchTrigger?.setAttribute('aria-expanded', String(expanded));
    searchTrigger?.setAttribute('aria-label', expanded ? '검색 닫기' : '검색 열기');
    searchTrigger?.classList.toggle('is-active', expanded);
    searchPanel?.setAttribute('aria-hidden', String(!expanded));
  };

  const closeMobileExplorer = () => {
    body.classList.remove('explorer-is-open');
  };

  const toggleExplorer = () => {
    if (body.classList.contains('explorer-mode-search')) setSearchMode(false);

    if (mobile.matches) {
      body.classList.toggle('explorer-is-open');
      setExplorerExpanded(body.classList.contains('explorer-is-open'));
      return;
    }

    body.classList.toggle('explorer-is-collapsed');
    setExplorerExpanded(!body.classList.contains('explorer-is-collapsed'));
  };

  const syncExplorer = () => {
    closeMobileExplorer();
    if (mobile.matches) {
      body.classList.remove('explorer-is-collapsed');
      setExplorerExpanded(false);
      return;
    }
    setExplorerExpanded(!body.classList.contains('explorer-is-collapsed'));
  };

  const categoryLabels = {
    development: '개발',
    ctf: 'CTF · Wargame',
    'bug-bounty': 'BugBounty',
    'blog-docs': '블로그 · 기술문서',
    'analysis-conference': '논문 · 컨퍼런스',
    'contest-certificate': '공모전 · 자격증',
  };

  let searchIndex = [];
  try {
    const searchIndexElement = document.getElementById('post-search-index');
    searchIndex = searchIndexElement ? JSON.parse(searchIndexElement.textContent) : [];
  } catch {
    searchIndex = [];
  }

  const normalise = (value) => value.toLocaleLowerCase('ko-KR');
  const excerpt = (value, limit = 120) => {
    const compact = value.replace(/\s+/g, ' ').trim();
    return compact.length > limit ? `${compact.slice(0, limit)}…` : compact;
  };

  const renderSearchResults = (query = '') => {
    if (!searchResults) return;
    searchResults.replaceChildren();
    const term = normalise(query.trim());

    if (!term) {
      const message = document.createElement('p');
      message.className = 'search-empty';
      message.textContent = '검색어를 입력하면 일치하는 기록을 보여줍니다.';
      searchResults.append(message);
      return;
    }

    const matches = searchIndex.filter((post) => normalise(`${post.title} ${post.description} ${post.content}`).includes(term)).slice(0, 20);
    if (!matches.length) {
      const message = document.createElement('p');
      message.className = 'search-empty';
      message.textContent = '일치하는 게시글이 없습니다.';
      searchResults.append(message);
      return;
    }

    matches.forEach((post) => {
      const result = document.createElement('a');
      result.className = 'search-result';
      result.href = post.url;

      const meta = document.createElement('span');
      meta.className = 'search-result-meta';
      meta.textContent = `${categoryLabels[post.category] || '기록'} · ${post.date}`;

      const title = document.createElement('strong');
      title.textContent = post.title;

      const description = document.createElement('small');
      description.textContent = excerpt(post.description || post.content);

      result.append(meta, title, description);
      searchResults.append(result);
    });
  };

  const setSearchMode = (enabled) => {
    body.classList.toggle('explorer-mode-search', enabled);
    setSearchExpanded(enabled);

    if (!enabled) return;
    body.classList.remove('explorer-is-collapsed');
    if (mobile.matches) body.classList.add('explorer-is-open');
    setExplorerExpanded(true);
    renderSearchResults(searchInput?.value || '');
    window.setTimeout(() => searchInput?.focus(), 0);
  };

  explorerTriggers.forEach((trigger) => trigger.addEventListener('click', toggleExplorer));
  searchTrigger?.addEventListener('click', () => setSearchMode(!body.classList.contains('explorer-mode-search')));
  searchInput?.addEventListener('input', (event) => renderSearchResults(event.target.value));

  closeButton?.addEventListener('click', closeMobileExplorer);
  scrim?.addEventListener('click', closeMobileExplorer);
  explorer?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileExplorer));
  searchResults?.addEventListener('click', closeMobileExplorer);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && body.classList.contains('explorer-mode-search')) {
      setSearchMode(false);
      return;
    }
    if (event.key === 'Escape') closeMobileExplorer();
  });
  mobile.addEventListener('change', syncExplorer);
  syncExplorer();
  setSearchExpanded(false);

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
