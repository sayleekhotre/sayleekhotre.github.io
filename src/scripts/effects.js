// Site-wide motion + interaction layer. Plain DOM, no dependencies.
// Everything degrades: without JS the page is fully visible (see html.js gates in CSS),
// and prefers-reduced-motion skips the intro, tilt, magnet and cursor.

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/* ---------------------------------------------------------------- split text */
document.querySelectorAll('[data-split]').forEach((el) => {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  let i = 0;
  text.split(/\s+/).forEach((word, w, arr) => {
    const wSpan = document.createElement('span');
    wSpan.className = 'word';
    wSpan.setAttribute('aria-hidden', 'true');
    for (const ch of word) {
      const c = document.createElement('span');
      c.className = 'char';
      c.textContent = ch;
      c.style.setProperty('--i', String(i++));
      wSpan.appendChild(c);
    }
    el.appendChild(wSpan);
    if (w < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
  el.classList.add('is-split');
});

/* ------------------------------------------------------------ delay attrs */
document.querySelectorAll('[data-d]').forEach((el) => {
  el.style.setProperty('--d', `${parseInt(el.getAttribute('data-d'), 10) || 0}ms`);
});

/* ------------------------------------------------------------ intro + ready */
function markReady() {
  root.classList.add('ready');
  document.querySelectorAll('.hero [data-split]').forEach((el) => el.classList.add('is-in'));
}

function runIntro() {
  const counter = document.querySelector('[data-intro-count]');
  const bar = document.querySelector('.intro-bar');
  const duration = 1500;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const v = easeOutExpo(t);
    if (counter) counter.textContent = String(Math.round(v * 100)).padStart(3, '0');
    if (bar) bar.style.setProperty('--p', v.toFixed(4));
    if (t < 1) requestAnimationFrame(tick);
    else {
      root.classList.add('intro-done');
      try { sessionStorage.setItem('intro-seen', '1'); } catch (e) { /* private mode */ }
      setTimeout(markReady, 250);
      setTimeout(() => root.classList.remove('intro', 'intro-done'), 1300);
    }
  };
  requestAnimationFrame(tick);
}

if (root.classList.contains('intro')) runIntro();
else requestAnimationFrame(() => requestAnimationFrame(markReady));

/* ------------------------------------------------------------ scroll reveals */
const revealTargets = document.querySelectorAll('.reveal, .reveal-mask, main [data-split]:not(.hero [data-split])');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-in'));
}

/* ------------------------------------------------------------ counters */
const counters = document.querySelectorAll('[data-count]');
if (counters.length && 'IntersectionObserver' in window) {
  const co = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.getAttribute('data-count')) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        if (reduce) { el.textContent = target + suffix; return; }
        const start = performance.now();
        const dur = 1800;
        const step = (now) => {
          const t = Math.min(1, (now - start) / dur);
          el.textContent = String(Math.round(easeOutExpo(t) * target)).padStart(target < 10 ? 2 : 1, '0') + suffix;
          if (t < 1) requestAnimationFrame(step);
        };
        el.textContent = '00' + suffix;
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => co.observe(el));
}

/* ------------------------------------------------------------ role rotator */
document.querySelectorAll('[data-rotator]').forEach((rot) => {
  const items = [...rot.children];
  if (items.length < 2 || reduce) return;
  let i = 0;
  setInterval(() => {
    const cur = items[i];
    i = (i + 1) % items.length;
    const next = items[i];
    cur.classList.remove('is-on');
    cur.classList.add('is-off');
    next.classList.remove('is-off');
    // force the entering item to start below before sliding in
    next.style.transition = 'none';
    next.style.transform = 'translateY(110%)';
    void next.offsetWidth;
    next.style.transition = '';
    next.style.transform = '';
    next.classList.add('is-on');
  }, 2600);
});

/* ------------------------------------------------------------ live clock */
const clock = document.querySelector('[data-clock]');
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const update = () => { clock.textContent = fmt.format(new Date()); };
  update();
  setInterval(update, 20000);
}

/* ------------------------------------------------------------ scroll: progress + nav */
const progress = document.querySelector('.progress');
const nav = document.querySelector('[data-nav]');
let ticking = false;
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  if (progress) progress.style.setProperty('--p', p.toFixed(4));
  if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
onScroll();

/* ------------------------------------------------------------ nav indicator */
const navLinks = document.querySelector('[data-nav-links]');
if (navLinks) {
  const indicator = navLinks.querySelector('.nav-indicator');
  const links = [...navLinks.querySelectorAll('a[data-section]')];
  const onHome = !!document.getElementById('hero');
  const moveTo = (a) => {
    if (!indicator) return;
    if (!a) { indicator.style.setProperty('--o', '0'); return; }
    const box = navLinks.getBoundingClientRect();
    const r = a.getBoundingClientRect();
    indicator.style.setProperty('--x', `${r.left - box.left}px`);
    indicator.style.setProperty('--w', `${r.width}px`);
    indicator.style.setProperty('--o', '1');
  };
  let active = null;
  const setActive = (a) => {
    active = a;
    links.forEach((l) => l.classList.toggle('is-active', l === a));
    moveTo(a);
  };
  links.forEach((a) => {
    a.addEventListener('mouseenter', () => moveTo(a));
    a.addEventListener('focus', () => moveTo(a));
  });
  navLinks.addEventListener('mouseleave', () => moveTo(active));

  if (onHome && 'IntersectionObserver' in window) {
    const sections = links.map((a) => document.getElementById(a.dataset.section)).filter(Boolean);
    const so = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(links.find((l) => l.dataset.section === e.target.id) || null);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => so.observe(s));
    const hero = document.getElementById('hero');
    if (hero) {
      new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(null); }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
    }
  }
  window.addEventListener('resize', () => moveTo(active));
}

/* ------------------------------------------------------------ theme toggle */
document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'light' ? '#f6f5f1' : '#07070c');
  });
});

/* ------------------------------------------------------------ mobile menu */
const menuBtn = document.querySelector('[data-menu-toggle]');
if (menuBtn) {
  const setMenu = (open) => {
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  document.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
}

/* ------------------------------------------------------------ pointer effects */
if (finePointer && !reduce) {
  root.classList.add('has-cursor');
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const label = ring && ring.querySelector('.cursor-label');
  const light = document.querySelector('.cursor-light');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my, lx = mx, ly = my;
  let seen = false;

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!seen) { rx = lx = mx; ry = ly = my; seen = true; }
  }, { passive: true });
  document.addEventListener('pointerleave', () => { root.classList.remove('has-cursor'); });
  document.addEventListener('pointerenter', () => { root.classList.add('has-cursor'); });
  window.addEventListener('pointerdown', () => root.classList.add('cursor-down'));
  window.addEventListener('pointerup', () => root.classList.remove('cursor-down'));

  const loop = () => {
    rx = lerp(rx, mx, 0.2); ry = lerp(ry, my, 0.2);
    lx = lerp(lx, mx, 0.08); ly = lerp(ly, my, 0.08);
    if (dot) dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    if (light) light.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  document.addEventListener('pointerover', (e) => {
    const t = e.target instanceof Element ? e.target.closest('a, button, [data-cursor]') : null;
    const text = t && t.getAttribute('data-cursor');
    root.classList.toggle('cursor-hover', !!t && !text);
    root.classList.toggle('cursor-label', !!text);
    if (label) label.textContent = text || '';
  });

  // Magnetic buttons
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const inner = el.querySelector('.btn-label');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
      if (inner) inner.style.transform = `translate(${x * 0.12}px, ${y * 0.16}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
      if (inner) inner.style.transform = '';
    });
  });

  // Spotlight (cards, capability tiles, contact rows) + 3D tilt on work cards
  document.querySelectorAll('.card, [data-spot]').forEach((el) => {
    const tilt = el.hasAttribute('data-tilt');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      if (tilt) {
        el.style.transition = 'transform 0.15s linear, background 0.4s, box-shadow 0.5s';
        el.style.transform = `perspective(1200px) rotateX(${(0.5 - py) * 5}deg) rotateY(${(px - 0.5) * 6}deg) translateY(-6px)`;
      }
    });
    el.addEventListener('pointerleave', () => {
      if (tilt) {
        el.style.transition = '';
        el.style.transform = '';
      }
    });
  });
}
