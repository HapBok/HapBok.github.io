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
})();
