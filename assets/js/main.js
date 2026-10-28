(() => {
  const body = document.body;
  const menuButton = document.querySelector('.menu-toggle');
  const closeButton = document.querySelector('.sidebar-close');
  const scrim = document.querySelector('.sidebar-scrim');
  const sidebar = document.querySelector('.site-sidebar');
  const desktop = window.matchMedia('(min-width: 1080px)');

  const closeMenu = () => {
    if (desktop.matches) body.classList.add('sidebar-collapsed');
    else body.classList.remove('sidebar-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    if (desktop.matches) body.classList.remove('sidebar-collapsed');
    else body.classList.add('sidebar-open');
    menuButton?.setAttribute('aria-expanded', 'true');
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = desktop.matches
      ? !body.classList.contains('sidebar-collapsed')
      : body.classList.contains('sidebar-open');
    isOpen ? closeMenu() : openMenu();
  });

  closeButton?.addEventListener('click', closeMenu);
  scrim?.addEventListener('click', closeMenu);
  sidebar?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (!desktop.matches) closeMenu();
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
})();
