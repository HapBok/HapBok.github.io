export function initReadingTools() {
  const body = document.querySelector('[data-post-body]');
  if (!body) return;
  body.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code');
    const root = pre.closest('.highlighter-rouge') || pre;
    const wrapper = document.createElement('section');
    wrapper.className = 'code-block';
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    const label = document.createElement('span');
    const language = (root.className + ' ' + (code?.className || '')).match(/language-([\w+-]+)/)?.[1] || 'text';
    label.textContent = language.toUpperCase();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = '복사';
    button.setAttribute('aria-label', '코드 복사');
    const status = document.createElement('span');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    let reset;
    button.addEventListener('click', async () => {
      clearTimeout(reset);
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText((code || pre).textContent);
        button.textContent = '✓ 복사됨';
        status.textContent = '코드를 복사했습니다.';
      } catch {
        button.textContent = '복사 실패';
        status.textContent = '복사하지 못했습니다. 코드를 직접 선택해 복사해 주세요.';
      }
      reset = setTimeout(() => { button.textContent = '복사'; status.textContent = ''; }, 2200);
    });
    toolbar.append(label, button, status);
    root.before(wrapper);
    wrapper.append(toolbar, root);
    pre.tabIndex = 0;
    pre.setAttribute('aria-label', language + ' 코드');
  });
  body.querySelectorAll('table').forEach(table => {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', '가로로 스크롤할 수 있는 표');
    table.before(wrapper);
    wrapper.append(table);
  });

  const viewer = document.querySelector('[data-image-viewer]');
  if (viewer && typeof viewer.showModal === 'function') {
    const enlarged = viewer.querySelector('img');
    const caption = viewer.querySelector('.viewer-caption');
    let trigger;
    body.querySelectorAll('img').forEach(image => {
      if (image.closest('a, button')) return;
      const button = document.createElement('button');
      button.className = 'image-expand';
      button.type = 'button';
      button.setAttribute('aria-label', (image.alt || '본문 이미지') + ' 크게 보기');
      image.before(button);
      button.append(image);
      button.addEventListener('click', () => {
        trigger = button;
        enlarged.src = image.currentSrc || image.src;
        enlarged.alt = image.alt;
        caption.textContent = image.alt;
        viewer.showModal();
        document.body.classList.add('viewer-is-open');
      });
    });
    viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', event => {
      if (event.target !== viewer) return;
      const box = viewer.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) viewer.close();
    });
    viewer.addEventListener('close', () => {
      document.body.classList.remove('viewer-is-open');
      enlarged.removeAttribute('src');
      trigger?.focus({ preventScroll: true });
    });
  }
  const ending = document.querySelector('[data-reveal-once]');
  if (ending && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        ending.classList.add('is-revealed');
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(ending);
  }
}
