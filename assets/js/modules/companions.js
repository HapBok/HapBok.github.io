export function initCompanions() {
  const buttons = [...document.querySelectorAll('[data-pet]')];
  if (!buttons.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const status = document.querySelector('[data-pet-status]');
  const hint = document.querySelector('[data-pet-hint]');
  const pets = buttons.map(button => {
    const sprite = button.querySelector('.pet-sprite');
    let frame = 0;
    let timer;
    let animationTimer;
    let busy = false;
    let visible = false;
    let ready = false;
    let greeted = false;
    let wanted = 0;
    const name = button.dataset.pet === 'happy' ? '해피' : '복순이';
    function setFrame(value) {
      frame = value;
      button.dataset.frame = String(frame);
      sprite.style.setProperty('--frame-x', ((frame % 5) * 25) + '%');
      sprite.style.setProperty('--frame-y', (Math.floor(frame / 5) * 100) + '%');
    }
    function pause() {
      clearTimeout(timer);
      clearTimeout(animationTimer);
      busy = false;
      button.dataset.animating = 'false';
      setFrame(0);
    }
    function allowed() { return ready && visible && !document.hidden && !reduced.matches; }
    function scheduleBlink() {
      clearTimeout(timer);
      if (!allowed()) return;
      timer = setTimeout(() => {
        if (!allowed()) return;
        if (!busy) {
          setFrame(3);
          animationTimer = setTimeout(() => { setFrame(wanted); scheduleBlink(); }, 140);
        } else scheduleBlink();
      }, 8000);
    }
    function greet(announce = false) {
      if (!ready || !visible || document.hidden || busy) return;
      if (announce && status) status.textContent = name + '가 인사합니다.';
      if (reduced.matches) return;
      busy = true;
      button.dataset.animating = 'true';
      clearTimeout(timer);
      clearTimeout(animationTimer);
      const frames = [4, 5, 6, 7, 8, 9];
      let step = 0;
      function next() {
        if (!allowed()) return pause();
        setFrame(frames[step++]);
        if (step < frames.length) animationTimer = setTimeout(next, 135);
        else animationTimer = setTimeout(() => {
          busy = false; button.dataset.animating = 'false'; setFrame(wanted); scheduleBlink();
        }, 135);
      }
      next();
    }
    function resume() {
      pause();
      if (!allowed()) return;
      if (!greeted) { greeted = true; greet(); }
      else scheduleBlink();
    }
    const atlas = new Image();
    atlas.src = button.dataset.atlas;
    atlas.decode().then(() => {
      ready = true;
      button.disabled = false;
      sprite.style.aspectRatio = String((atlas.naturalWidth / 5) / (atlas.naturalHeight / 2));
      if (hint) hint.hidden = false;
      resume();
    }).catch(() => {
      button.dataset.imageError = 'true';
      button.disabled = true;
      button.setAttribute('aria-label', name);
      // A separate still image remains available if the animation atlas fails.
      const fallback = new Image();
      fallback.src = button.dataset.atlas.replace('-sprite.png', '-neutral.png');
      fallback.decode().then(() => {
        sprite.style.backgroundImage = 'url("' + fallback.src + '")';
        sprite.style.backgroundSize = 'contain';
        sprite.style.backgroundPosition = 'center';
        delete button.dataset.imageError;
      }).catch(() => { /* Keep the accessible H/B fallback. */ });
    });
    button.addEventListener('click', () => greet(true));
    button.addEventListener('pointermove', event => {
      if (!finePointer.matches || !allowed()) return;
      const rect = button.getBoundingClientRect();
      const position = (event.clientX - rect.left) / rect.width;
      wanted = position < 0.38 ? 1 : position > 0.62 ? 2 : 0;
      if (!busy && frame !== 3) setFrame(wanted);
    });
    button.addEventListener('pointerleave', () => { wanted = 0; if (!busy) setFrame(0); });
    return { button, pause, resume, setVisible(value) { visible = value; if (value) resume(); else pause(); } };
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) pets.find(pet => pet.button === entry.target)?.setVisible(entry.isIntersecting);
    }, { threshold: 0.2 });
    pets.forEach(pet => observer.observe(pet.button));
  } else pets.forEach(pet => pet.setVisible(true));
  document.addEventListener('visibilitychange', () => pets.forEach(pet => document.hidden ? pet.pause() : pet.resume()));
  reduced.addEventListener('change', () => pets.forEach(pet => pet.resume()));
  window.addEventListener('pagehide', () => pets.forEach(pet => pet.pause()));
  window.addEventListener('pageshow', () => pets.forEach(pet => pet.resume()));
}
