export function initNavigation() {
  const menu = document.querySelector('#site-menu');
  const toggle = document.querySelector('.menu-toggle');
  const close = document.querySelector('.menu-close');
  const scrim = document.querySelector('.menu-scrim');
  if (!menu || !toggle || !close || !scrim) return;
  const compact = matchMedia('(max-width: 1023px)');
  let opened = false;
  toggle.hidden = false;
  close.hidden = false;

  function sync() {
    const inactive = compact.matches ? !opened : !document.body.classList.contains('layout--archive');
    menu.inert = inactive;
    menu.setAttribute('aria-hidden', String(inactive));
    toggle.setAttribute('aria-expanded', String(opened));
    toggle.setAttribute('aria-label', opened ? '메뉴 닫기' : '메뉴 열기');
    document.body.classList.toggle('menu-is-open', opened && compact.matches);
    scrim.hidden = !opened || !compact.matches;
  }
  function dismiss(restore = true) {
    const wasOpen = opened;
    opened = false;
    if (wasOpen && restore && compact.matches) toggle.focus({ preventScroll: true });
    sync();
  }
  toggle.addEventListener('click', () => {
    if (opened) return dismiss();
    opened = true;
    sync();
    close.focus({ preventScroll: true });
  });
  close.addEventListener('click', () => dismiss());
  scrim.addEventListener('click', () => dismiss());
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) dismiss(false);
  });
  document.addEventListener('keydown', event => {
    if (!opened) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss();
    }
    if (event.key !== 'Tab') return;
    const focusable = [...menu.querySelectorAll('a[href], button:not([hidden])')]
      .filter(node => node.getClientRects().length && !node.disabled);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || !menu.contains(document.activeElement))) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !menu.contains(document.activeElement))) {
      event.preventDefault(); first?.focus();
    }
  });
  compact.addEventListener('change', () => {
    const focusWasInside = menu.contains(document.activeElement);
    dismiss(false);
    if (focusWasInside && menu.inert) toggle.focus({ preventScroll: true });
  });
  sync();
}
