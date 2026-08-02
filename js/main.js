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

  // ---- hero feather canvas ----
  const canvas = document.getElementById('feathers');
  const ctx = canvas.getContext('2d');
  let W, H, feathers = [];

  const rand = (a, b) => a + Math.random() * (b - a);

  const resize = () => {
    W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    H = canvas.height = canvas.offsetHeight * devicePixelRatio;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  };

  const makeFeather = (init) => ({
    x: rand(0, W),
    y: init ? rand(0, H) : -20,
    r: rand(0.8, 3.2) * devicePixelRatio,
    vy: rand(0.15, 0.6) * devicePixelRatio,
    vx: rand(-0.3, 0.3) * devicePixelRatio,
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.02, 0.02),
    a: rand(0.1, 0.45),
  });

  const init = () => {
    resize();
    const count = Math.min(90, Math.floor(W / 16));
    feathers = Array.from({ length: count }, () => makeFeather(true));
  };

  const tick = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#d9b26a';
    feathers.forEach((f) => {
      f.y += f.vy;
      f.x += f.vx + Math.sin(f.y / 120) * 0.3;
      f.rot += f.vr;
      if (f.y > H + 20) Object.assign(f, makeFeather(false));
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.globalAlpha = f.a;
      ctx.beginPath();
      ctx.ellipse(0, 0, f.r * 2.4, f.r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(tick);
  };

  window.addEventListener('resize', init);
  init();
  tick();
})();
