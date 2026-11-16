(() => {
 const toggle = document.querySelector('.menu-toggle');
 const nav = document.getElementById('primary-nav');
 const close = () => { if (!toggle || !nav) return; nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
 if (toggle && nav) { toggle.addEventListener('click', () => { const opened = toggle.getAttribute('aria-expanded') === 'true'; nav.classList.toggle('is-open', !opened); toggle.setAttribute('aria-expanded', String(!opened)); }); nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close)); document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }); }
 const year = document.getElementById('y'); if (year) year.textContent = new Date().getFullYear();
})();
