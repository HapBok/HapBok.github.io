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

  const openExplorer = () => {
    if (!mobile.matches) return;
    body.classList.add('explorer-is-open');
    setExpanded(true);
  };

  const closeExplorer = () => {
    body.classList.remove('explorer-is-open');
    setExpanded(false);
  };

  triggers.forEach((trigger) => trigger.addEventListener('click', () => {
    body.classList.contains('explorer-is-open') ? closeExplorer() : openExplorer();
  }));

  closeButton?.addEventListener('click', closeExplorer);
  scrim?.addEventListener('click', closeExplorer);
  explorer?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeExplorer));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeExplorer();
  });
  mobile.addEventListener('change', () => {
    if (!mobile.matches) closeExplorer();
  });

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

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) activate(headings.indexOf(visible[0].target));
    }, { rootMargin: '-12% 0px -70% 0px', threshold: 0 });

    headings.slice(0, count).forEach((heading) => observer.observe(heading));
  }
})();
