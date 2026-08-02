(() => {
  'use strict';

  // ---- scroll progress bar ----
  const bar = document.getElementById('progressBar');
  const onScrollProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScrollProgress, { passive: true });
  onScrollProgress();

  // ---- split headings into words ----
  const splitHeading = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let idx = 0;
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'w';
          span.style.setProperty('--d', `${idx * 40}ms`);
          span.textContent = part;
          frag.appendChild(span);
          idx++;
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
  };
  document.querySelectorAll('.chapter h2, .epilogue h2').forEach(splitHeading);

  // ---- reveal on scroll ----
  const targets = document.querySelectorAll('.chapter, .prologue, .epilogue');
  const apply = (el) => {
    el.classList.add('reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    io.observe(el);
  };
  targets.forEach(apply);

  // ---- parallax on chapter inner ----
  const chapters = document.querySelectorAll('.chapter');
  const onScrollParallax = () => {
    chapters.forEach((s) => {
      const rect = s.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      const inner = s.querySelector('.chapter-inner');
      if (inner) inner.style.transform = `translateY(${offset * -0.05}px)`;
    });
  };
  window.addEventListener('scroll', onScrollParallax, { passive: true });
  onScrollParallax();

  // ---- global particle canvas ----
  const fx = document.getElementById('fx');
  const fctx = fx.getContext('2d');
  let W, H, parts = [];

  const rand = (a, b) => a + Math.random() * (b - a);

  const resizeFx = () => {
    W = fx.width = innerWidth * devicePixelRatio;
    H = fx.height = innerHeight * devicePixelRatio;
    fx.style.width = '100%';
    fx.style.height = '100%';
  };

  const makePart = (init) => ({
    x: rand(0, W),
    y: init ? rand(0, H) : -10,
    r: rand(0.6, 2.2) * devicePixelRatio,
    vy: rand(0.05, 0.25) * devicePixelRatio,
    vx: rand(-0.15, 0.15) * devicePixelRatio,
    a: rand(0.08, 0.35),
    hue: Math.random() < 0.75 ? '#d9b26a' : '#7a9bb5',
  });

  const initFx = () => {
    resizeFx();
    const count = Math.min(110, Math.floor(W / 14));
    parts = Array.from({ length: count }, () => makePart(true));
  };

  const tickFx = () => {
    fctx.clearRect(0, 0, W, H);
    parts.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.y / 180 + p.x / 90) * 0.12;
      if (p.y > H + 10) Object.assign(p, makePart(false));
      fctx.beginPath();
      fctx.globalAlpha = p.a;
      fctx.fillStyle = p.hue;
      fctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      fctx.fill();
    });
    fctx.globalAlpha = 1;
    requestAnimationFrame(tickFx);
  };
  window.addEventListener('resize', initFx);
  initFx();
  tickFx();

  // ---- hero feather canvas ----
  const canvas = document.getElementById('feathers');
  const ctx = canvas.getContext('2d');
  let feathers = [];

  const resize = () => {
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
  };

  const makeFeather = (init) => ({
    x: rand(0, canvas.width),
    y: init ? rand(0, canvas.height) : -20,
    r: rand(0.8, 3.2) * devicePixelRatio,
    vy: rand(0.15, 0.6) * devicePixelRatio,
    vx: rand(-0.3, 0.3) * devicePixelRatio,
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.02, 0.02),
    a: rand(0.1, 0.45),
  });

  const init = () => {
    resize();
    const count = Math.min(90, Math.floor(canvas.width / 16));
    feathers = Array.from({ length: count }, () => makeFeather(true));
  };

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#d9b26a';
    feathers.forEach((f) => {
      f.y += f.vy;
      f.x += f.vx + Math.sin(f.y / 120) * 0.3;
      f.rot += f.vr;
      if (f.y > canvas.height + 20) Object.assign(f, makeFeather(false));
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.globalAlpha = f.a;
      ctx.beginPath();
      ctx.ellipse(0, 0, f.r * 2.4, f.r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  };

  window.addEventListener('resize', init);
  init();
  tick();
})();
