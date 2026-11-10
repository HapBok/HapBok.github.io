export function initToc() {
  const body = document.querySelector('[data-post-body]');
  const toc = document.querySelector('[data-toc]');
  if (!body || !toc) return;
  const headings = [...body.querySelectorAll('h2, h3')];
  if (!headings.length) return;
  const list = toc.querySelector('[data-toc-list]');
  const details = toc.querySelector('details');
  const mobileSlot = document.querySelector('[data-mobile-toc]');
  const desktopSlot = toc.parentElement;
  const compact = matchMedia('(max-width: 1399px)');
  const ids = new Set([...document.querySelectorAll('[id]')].filter(item => !headings.includes(item)).map(item => item.id));
  const links = [];
  headings.forEach((heading, index) => {
    const base = heading.id || heading.textContent.trim().normalize('NFC').toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s+/g, '-') || 'section-' + (index + 1);
    let id = base;
    let suffix = 2;
    while (ids.has(id)) id = base + '-' + suffix++;
    ids.add(id);
    heading.id = id;
    const item = document.createElement('li');
    if (heading.tagName === 'H3') item.className = 'toc-subheading';
    const link = document.createElement('a');
    link.href = '#' + encodeURIComponent(id);
    link.textContent = heading.textContent;
    link.addEventListener('click', () => {
      heading.classList.remove('section-target');
      requestAnimationFrame(() => heading.classList.add('section-target'));
    });
    item.append(link);
    list.append(item);
    links.push(link);
  });
  toc.hidden = false;
  function positionToc() {
    if (compact.matches) { mobileSlot?.append(toc); details.open = false; }
    else { desktopSlot.append(toc); details.open = true; }
  }
  positionToc();
  compact.addEventListener('change', positionToc);

  let active = -1;
  let scheduled = false;
  function update() {
    scheduled = false;
    const header = document.querySelector('.site-header')?.getBoundingClientRect().height || 76;
    let current = 0;
    headings.forEach((heading, index) => {
      if (heading.getBoundingClientRect().top <= header + 36) current = index;
    });
    if (scrollY > 0 && Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 3) current = headings.length - 1;
    if (active === current) return;
    active = current;
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('hashchange', schedule);
  addEventListener('load', schedule, { once: true });
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(body);
  document.fonts?.ready.then(schedule);
  schedule();
}
