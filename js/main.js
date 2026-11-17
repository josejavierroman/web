(() => {
  'use strict';
  const html = document.documentElement;
  const header = document.querySelector('header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  const media = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const prefersReduced = () => Boolean(media && media.matches);
  const year = document.getElementById('y');
  if (year) year.textContent = new Date().getFullYear();

  if (toggle && nav) {
    const close = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
      const opened = toggle.getAttribute('aria-expanded') === 'true';
      nav.classList.toggle('is-open', !opened);
      toggle.setAttribute('aria-expanded', String(!opened));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); }
    });
    html.classList.add('has-menu');
  }

  const progress = document.querySelector('.reading-progress span');
  const links = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  let scrollPending = false;
  const updateScroll = () => {
    scrollPending = false;
    const top = window.scrollY || html.scrollTop || 0;
    const total = Math.max(0, html.scrollHeight - window.innerHeight);
    if (progress) progress.style.transform = `scaleX(${total ? Math.min(1, top / total) : 0})`;
    if (header) header.classList.toggle('is-scrolled', top > 12);
    const boundary = (header ? header.getBoundingClientRect().height : 76) + 65;
    let selected = -1;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= boundary) selected = index;
    });
    links.forEach((link, index) => {
      const active = index === selected;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const requestScroll = () => {
    if (!scrollPending) { scrollPending = true; window.requestAnimationFrame(updateScroll); }
  };
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);
  window.addEventListener('load', requestScroll, { once: true });
  updateScroll();

  const counters = Array.from(document.querySelectorAll('[data-counter]'));
  const frames = new Map();
  const started = new WeakSet();
  const numberText = (number, prefix = '') => prefix + String(number).replace(/\B(?=(\d{3})+(?!\d))/g, html.lang === 'es' ? '.' : ',');
  const finishCounter = counter => {
    const node = counter.querySelector('.counter-value');
    if (node) node.textContent = numberText(Number(counter.dataset.counter), counter.dataset.prefix || '');
    if (frames.has(counter)) window.cancelAnimationFrame(frames.get(counter));
    frames.delete(counter);
  };
  const animateCounter = counter => {
    if (started.has(counter)) return;
    started.add(counter);
    const node = counter.querySelector('.counter-value');
    const target = Number(counter.dataset.counter);
    if (!node || !Number.isFinite(target) || target < 0 || prefersReduced() || document.hidden) {
      finishCounter(counter); return;
    }
    const prefix = counter.dataset.prefix || '';
    let start = null;
    const step = time => {
      if (prefersReduced() || document.hidden) { finishCounter(counter); return; }
      if (start === null) start = time;
      const fraction = Math.min(1, (time - start) / 1300);
      const eased = 1 - Math.pow(1 - fraction, 3);
      node.textContent = numberText(Math.round(target * eased), prefix);
      if (fraction < 1) frames.set(counter, window.requestAnimationFrame(step));
      else finishCounter(counter);
    };
    frames.set(counter, window.requestAnimationFrame(step));
  };

  let observer;
  const revealNodes = [];
  const failOpen = () => {
    html.classList.remove('has-motion');
    revealNodes.forEach(node => node.classList.add('is-visible'));
    counters.forEach(finishCounter);
    if (observer) observer.disconnect();
  };
  if (!prefersReduced() && 'IntersectionObserver' in window) {
    try {
      const selector = '.hero .eyebrow,.hero h1,.hero-claim,.hero .lead,.now,.hero .actions,.portrait,.section .eyebrow,.section h2,.section .intro,.profile-text>p,.scale-item,.area,.case,.company-heading,.company-period,.company-note,.role,.quote,.steps li,.education-list li,.contact-links';
      const perParent = new Map();
      document.querySelectorAll(selector).forEach(node => {
        if (node.closest('.case') && !node.classList.contains('case')) return;
        const index = perParent.get(node.parentElement) || 0;
        perParent.set(node.parentElement, index + 1);
        node.classList.add('reveal', `reveal-delay-${Math.min(index, 4)}`);
        revealNodes.push(node);
      });
      observer = new IntersectionObserver(entries => {
        try {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            entry.target.querySelectorAll('[data-counter]').forEach(animateCounter);
            observer.unobserve(entry.target);
          });
        } catch (_) { failOpen(); }
      }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });
      revealNodes.forEach(node => observer.observe(node));
      html.classList.add('has-motion');
      window.addEventListener('error', failOpen, { once: true });
      window.addEventListener('unhandledrejection', failOpen, { once: true });
    } catch (_) { failOpen(); }
  }
  if (media) {
    const changed = () => { if (prefersReduced()) failOpen(); };
    if (media.addEventListener) media.addEventListener('change', changed);
    else if (media.addListener) media.addListener(changed);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) frames.forEach((_, counter) => finishCounter(counter));
  });
})();
