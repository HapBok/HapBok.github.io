(() => {
  const body = document.body;
  const explorer = document.querySelector('.site-explorer');
  const scrim = document.querySelector('.explorer-scrim');
  const triggers = document.querySelectorAll('.mobile-menu-toggle, .activity-button--menu');
  const closeButton = document.querySelector('.explorer-close');
  const mobile = window.matchMedia('(max-width: 780px)');

  const setExpanded = (expanded) => {
    triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', String(expanded)));
  };

  const closeMobileExplorer = () => {
    body.classList.remove('explorer-is-open');
  };

  const toggleExplorer = () => {
    if (mobile.matches) {
      body.classList.toggle('explorer-is-open');
      setExpanded(body.classList.contains('explorer-is-open'));
      return;
    }

    body.classList.toggle('explorer-is-collapsed');
    setExpanded(!body.classList.contains('explorer-is-collapsed'));
  };

  const syncExplorer = () => {
    closeMobileExplorer();
    if (mobile.matches) {
      body.classList.remove('explorer-is-collapsed');
      setExpanded(false);
      return;
    }
    setExpanded(!body.classList.contains('explorer-is-collapsed'));
  };

  triggers.forEach((trigger) => trigger.addEventListener('click', toggleExplorer));

  closeButton?.addEventListener('click', closeMobileExplorer);
  scrim?.addEventListener('click', closeMobileExplorer);
  explorer?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileExplorer));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileExplorer();
  });
  mobile.addEventListener('change', syncExplorer);
  syncExplorer();

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
