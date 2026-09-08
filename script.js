// ============================================================
// Vertex Mods — ambient embers, parallax, click sparks, interactions
// ============================================================

(function(){
  "use strict";

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Ambient ember particle field ---------------- */
  const canvas = document.getElementById('emberCanvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, particles, dpr;

    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width  = window.innerWidth  * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }

    // warm ember + an occasional cool violet mote, to match the new palette
    const hues = ['255,138,61', '255,196,107', '167,139,250'];

    function makeParticle(){
      return {
        x: Math.random() * w,
        y: h + Math.random() * h * 0.3,
        r: (Math.random() * 1.6 + 0.6) * dpr,
        speed: (Math.random() * 0.5 + 0.2) * dpr,
        drift: (Math.random() - 0.5) * 0.4 * dpr,
        life: Math.random(),
        hue: hues[Math.random() < 0.8 ? (Math.random() < 0.5 ? 0 : 1) : 2]
      };
    }

    function init(){
      resize();
      const count = window.innerWidth < 700 ? 26 : 46;
      particles = Array.from({ length: count }, makeParticle);
    }

    function step(){
      ctx.clearRect(0, 0, w, h);
      for (const p of particles){
        p.y -= p.speed;
        p.x += p.drift;
        p.life += 0.004;

        const fade = Math.sin(p.life * Math.PI);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue}, ${Math.max(fade, 0) * 0.8})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        if (p.y < -20 || p.life > 1){
          Object.assign(p, makeParticle(), { y: h + 10 });
        }
      }
      requestAnimationFrame(step);
    }

    init();
    window.addEventListener('resize', () => { resize(); }, { passive: true });
    requestAnimationFrame(step);
  }

  /* ---------------- Subtle depth parallax on background glows ---------------- */
  if (!reduceMotion){
    const glows = Array.from(document.querySelectorAll('.glow[data-depth]'));
    if (glows.length){
      let targetX = 0, targetY = 0, curX = 0, curY = 0;
      let scrollY = window.scrollY;

      window.addEventListener('pointermove', (e) => {
        targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
        targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
      }, { passive: true });

      function parallaxStep(){
        // ease toward target for smooth, non-jittery motion
        curX += (targetX - curX) * 0.04;
        curY += (targetY - curY) * 0.04;

        glows.forEach((el) => {
          const depth = parseFloat(el.dataset.depth) || 0.02;
          const px = curX * 60 * depth * 10;
          const py = curY * 60 * depth * 10 + scrollY * depth * -0.6;
          el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
        });

        requestAnimationFrame(parallaxStep);
      }
      requestAnimationFrame(parallaxStep);
    }
  }

  /* ---------------- Click spark / ember burst effect ---------------- */
  const sparkCanvas = document.getElementById('sparkCanvas');
  if (sparkCanvas && !reduceMotion) {
    const sctx = sparkCanvas.getContext('2d');
    let sw, sh, sdpr, sparks = [];

    function sresize(){
      sdpr = Math.min(window.devicePixelRatio || 1, 2);
      sw = sparkCanvas.width  = window.innerWidth  * sdpr;
      sh = sparkCanvas.height = window.innerHeight * sdpr;
      sparkCanvas.style.width  = window.innerWidth + 'px';
      sparkCanvas.style.height = window.innerHeight + 'px';
    }
    sresize();
    window.addEventListener('resize', sresize, { passive: true });

    const sparkColors = [
      '255,196,90',   // gold
      '255,138,61',   // ember
      '255,110,50',   // deep ember
      '255,225,150'   // hot yellow-white
    ];

    function spawnBurst(x, y){
      const count = window.innerWidth < 700 ? 12 : 18;
      for (let i = 0; i < count; i++){
        const angle = (Math.random() * Math.PI * 2);
        const force = (Math.random() * 3.2 + 1.4) * sdpr;
        sparks.push({
          x: x * sdpr,
          y: y * sdpr,
          vx: Math.cos(angle) * force * (Math.random() * 0.6 + 0.4),
          vy: Math.sin(angle) * force - (Math.random() * 2.2 * sdpr), // initial upward-ish kick
          gravity: (0.09 + Math.random() * 0.05) * sdpr,
          r: (Math.random() * 2.2 + 1.1) * sdpr,
          life: 1,
          decay: 0.012 + Math.random() * 0.014,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)]
        });
      }
      // cap total sparks so rapid clicking stays performant
      if (sparks.length > 240) sparks.splice(0, sparks.length - 240);
    }

    function sparkStep(){
      sctx.clearRect(0, 0, sw, sh);
      for (let i = sparks.length - 1; i >= 0; i--){
        const p = sparks[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.life -= p.decay;

        if (p.life <= 0 || p.y > sh + 40){
          sparks.splice(i, 1);
          continue;
        }

        sctx.beginPath();
        sctx.fillStyle = `rgba(${p.color}, ${Math.max(p.life, 0)})`;
        sctx.arc(p.x, p.y, p.r * Math.max(p.life, 0.15), 0, Math.PI * 2);
        sctx.fill();

        // tiny glow trail for a hotter, ember-like look
        sctx.beginPath();
        sctx.fillStyle = `rgba(${p.color}, ${Math.max(p.life, 0) * 0.18})`;
        sctx.arc(p.x, p.y, p.r * 2.6, 0, Math.PI * 2);
        sctx.fill();
      }
      requestAnimationFrame(sparkStep);
    }
    requestAnimationFrame(sparkStep);

    document.addEventListener('click', (e) => {
      spawnBurst(e.clientX, e.clientY);
    });
  }

  /* ---------------- Download button feedback ---------------- */
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(message){
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  document.querySelectorAll('.download-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modName = btn.dataset.mod || 'Mod';

      // Let the anchor's default navigation proceed (direct download link),
      // just layer on the visual feedback.
      btn.classList.remove('is-success');
      btn.classList.add('is-active');

      setTimeout(() => {
        btn.classList.remove('is-active');
        btn.classList.add('is-success');
        showToast(`${modName} download started`);
      }, 160);

      setTimeout(() => {
        btn.classList.remove('is-success');
      }, 2200);
    });
  });

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------------- Scroll-reveal entrance animation ---------------- */
  const revealTargets = document.querySelectorAll(
    '.mod-card, .fabric-inner, .section-head, .faq-item, .modrinth-card, .step-card'
  );
  if ('IntersectionObserver' in window && !reduceMotion){
    revealTargets.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px) scale(0.985)';
      el.style.transition =
        `opacity .7s cubic-bezier(.22,.61,.36,1) ${((i % 4) * 0.08)}s, ` +
        `transform .7s cubic-bezier(.22,.61,.36,1) ${((i % 4) * 0.08)}s`;
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) scale(1)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(el => io.observe(el));
  }

})();
