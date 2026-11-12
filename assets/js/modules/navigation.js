export function initNavigation() {
  const menu = document.querySelector('#site-menu');
  const toggle = document.querySelector('.menu-toggle');
  const close = document.querySelector('.menu-close');
  const scrim = document.querySelector('.menu-scrim');
  if (!menu || !toggle || !close || !scrim) return;
  const compact = matchMedia('not all and (min-width: 1024px)');
  const eligible = document.body.classList.contains('layout--archive');
  let collapsed = false;
  try { collapsed = localStorage.getItem('hapbok-sidebar-collapsed') === 'true'; } catch {}
  let mobileOpen = false;
  toggle.hidden = false;
  close.hidden = false;
  const open = () => compact.matches ? mobileOpen : eligible && !collapsed;

  function sync() {
    const visible = open();
    menu.inert = !visible;
    menu.setAttribute('aria-hidden', String(!visible));
    toggle.setAttribute('aria-expanded', String(visible));
    const label = compact.matches ? '메뉴' : '사이드바';
    toggle.setAttribute('aria-label', label + (visible ? ' 닫기' : ' 열기'));
    close.setAttribute('aria-label', label + ' 닫기');
    document.body.classList.toggle('sidebar-is-collapsed', !compact.matches && eligible && collapsed);
    document.body.classList.toggle('menu-is-open', compact.matches && mobileOpen);
    scrim.hidden = !(compact.matches && mobileOpen);
  }
  function dismiss(restore = true) {
    const wasOpen = open();
    if (compact.matches) mobileOpen = false;
    else {
      collapsed = true;
      try { localStorage.setItem('hapbok-sidebar-collapsed', 'true'); } catch {}
    }
    if (wasOpen && restore) toggle.focus({ preventScroll: true });
    sync();
  }
  toggle.addEventListener('click', () => {
    if (open()) return dismiss();
    if (compact.matches) mobileOpen = true;
    else {
      collapsed = false;
      try { localStorage.setItem('hapbok-sidebar-collapsed', 'false'); } catch {}
    }
    sync();
    if (compact.matches) close.focus({ preventScroll: true });
  });
  close.addEventListener('click', () => dismiss());
  scrim.addEventListener('click', () => dismiss());
  menu.addEventListener('click', event => {
    if (compact.matches && event.target.closest('a')) dismiss(false);
  });
  document.addEventListener('keydown', event => {
    if (!open()) return;
    if (event.key === 'Escape' && (compact.matches || menu.contains(document.activeElement))) {
      event.preventDefault(); dismiss();
    }
    if (event.key !== 'Tab' || !compact.matches) return;
    const focusable = [...menu.querySelectorAll('a[href], button:not([hidden])')]
      .filter(node => node.getClientRects().length && !node.disabled);
    const first = focusable[0]; const last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || !menu.contains(document.activeElement))) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !menu.contains(document.activeElement))) {
      event.preventDefault(); first?.focus();
    }
  });
  compact.addEventListener('change', () => {
    const wasInside = menu.contains(document.activeElement);
    mobileOpen = false;
    if (wasInside && !(eligible && !collapsed && !compact.matches)) toggle.focus({ preventScroll: true });
    sync();
  });
  menu.querySelectorAll('.folder-toggle').forEach(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    const label = button.getAttribute('data-folder-title');
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', label + ' 게시글 ' + (expanded ? '접기' : '펼치기'));
      panel.hidden = !expanded;
    });
  });
  sync();
}
