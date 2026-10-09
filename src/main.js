import './styles.css';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Navigation (mobil aufklappbar) */
const nav = document.querySelector('.nav');
const toggle = nav?.querySelector('.nav__toggle');
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav?.querySelectorAll('.nav__list a').forEach((a) => a.addEventListener('click', () => {
  toggle?.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav?.classList.contains('is-open')) {
    toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); toggle.focus();
  }
});

/* Header über dem Hero transparent, danach solide */
const header = document.querySelector('[data-header]');
const hero = document.querySelector('.hero');
const rail = document.querySelector('.rail');
if (hero && header) {
  let ticking = false;
  const update = () => {
    ticking = false;
    const past = window.scrollY > hero.offsetHeight - header.offsetHeight - 40;
    header.classList.toggle('is-solid', past);
    rail?.classList.toggle('is-visible', window.scrollY > hero.offsetHeight * 0.6);
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

/* Wegweiser: aktiven Abschnitt markieren */
const railLinks = new Map([...document.querySelectorAll('[data-rail]')].map((a) => [a.dataset.rail, a]));
if (railLinks.size) {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      railLinks.forEach((a) => a.removeAttribute('aria-current'));
      railLinks.get(en.target.id)?.setAttribute('aria-current', 'true');
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('[data-section]').forEach((s) => io.observe(s));
}

/* Geführter Ablauf: aktiver Schritt + Fortschritt (Fallback ohne Scroll-Timeline) */
const process = document.querySelector('.process');
if (process) {
  const links = [...process.querySelectorAll('[data-step-link]')];
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      links.forEach((l) => {
        if (l.dataset.stepLink === en.target.dataset.step) l.setAttribute('aria-current', 'step');
        else l.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-40% 0px -55% 0px' });
  process.querySelectorAll('[data-step]').forEach((s) => io.observe(s));
  if (!CSS.supports('animation-timeline: view()')) {
    const bar = process.querySelector('.process__bar');
    const onScroll = () => {
      const r = process.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      bar.style.setProperty('--p', p.toFixed(3));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}

/* Vorher-Nachher-Regler */
document.querySelectorAll('[data-ba]').forEach((fig) => {
  const range = fig.querySelector('.ba__range');
  const set = (v) => {
    const val = Math.round(Math.min(100, Math.max(0, Number(v))));
    range.value = String(val);
    fig.style.setProperty('--pos', `${val}%`);
    range.setAttribute('aria-valuetext', `${val} % Vorher, ${100 - val} % Nachher`);
    fig.querySelectorAll('[data-ba-set]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.baSet) === val)));
  };
  range.addEventListener('input', () => set(range.value));
  fig.querySelectorAll('[data-ba-set]').forEach((b) => b.addEventListener('click', () => {
    const target = Number(b.dataset.baSet);
    if (reduceMotion.matches) { set(target); return; }
    const from = Number(range.value); const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 450); const e = 1 - Math.pow(1 - k, 3);
      set(from + (target - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }));
  set(range.value);
});

/* Anfrage-Assistent nur laden, wenn vorhanden */
const wizard = document.querySelector('[data-wizard]');
if (wizard) import('./wizard.js').then((m) => m.initWizard(wizard, reduceMotion));
