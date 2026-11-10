export function initMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const objects = [...document.querySelectorAll('[data-reactive-character]')];
  objects.forEach(button => {
    let busy = false;
    let timer;
    const react = () => {
      if (reduced.matches || document.hidden || busy) return;
      busy = true;
      button.classList.add('is-reacting');
      timer = setTimeout(() => { button.classList.remove('is-reacting'); busy = false; }, 760);
    };
    button.addEventListener('pointerenter', () => { if (fine.matches) react(); });
    button.addEventListener('focus', react);
    button.addEventListener('click', react);
    const stop = () => { clearTimeout(timer); button.classList.remove('is-reacting'); busy = false; };
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    reduced.addEventListener('change', () => { if (reduced.matches) stop(); });
  });

  const visual = document.querySelector('[data-cover-visual]');
  if (!visual) return;
  let scheduled = false;
  let x = 0; let y = 0;
  function reset() {
    x = 0; y = 0;
    visual.style.setProperty('--cover-x', '0px');
    visual.style.setProperty('--cover-y', '0px');
    visual.style.setProperty('--cover-rotate', '0deg');
  }
  visual.addEventListener('pointermove', event => {
    if (reduced.matches || !fine.matches || document.hidden) return;
    const rect = visual.getBoundingClientRect();
    x = (event.clientX - rect.left) / rect.width - 0.5;
    y = (event.clientY - rect.top) / rect.height - 0.5;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (reduced.matches || document.hidden) return reset();
      visual.style.setProperty('--cover-x', (x * 14).toFixed(2) + 'px');
      visual.style.setProperty('--cover-y', (y * 10).toFixed(2) + 'px');
      visual.style.setProperty('--cover-rotate', (x * 2).toFixed(2) + 'deg');
    });
  });
  visual.addEventListener('pointerleave', reset);
  reduced.addEventListener('change', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
}
