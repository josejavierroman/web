(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var html = document.documentElement;
  if (!("IntersectionObserver" in window)) return;
  html.classList.add("js");

  // Elementos que aparecen al hacer scroll (con escalonado dentro de cada grupo)
  var groups = [
    "section:not(.hero) .eyebrow", "section:not(.hero) h2", "section:not(.hero) .intro", ".pull", ".profile .text p",
    ".stat", ".info", ".card", ".steps li", ".job", ".award", ".sust-grid div", ".tl li", ".skills h3", ".skills .tags",
    ".value", ".quote", ".contact .actions"
  ];
  groups.forEach(function (sel) {
    var parents = new Map();
    document.querySelectorAll(sel).forEach(function (el) {
      var p = el.parentElement, n = parents.get(p) || 0;
      parents.set(p, n + 1);
      el.classList.add("reveal");
      el.style.setProperty("--i", Math.min(n, 6));
    });
  });

  // Contadores animados
  function countUp(el) {
    var node = el.firstChild;
    if (!node || node.nodeType !== 3) return;
    var m = node.nodeValue.match(/^([~+]?)(\d{1,3}(?:\.\d{3})*)(?!\d)(.*)$/);
    if (!m) return;
    var prefix = m[1], raw = m[2], suffix = m[3];
    var target = parseInt(raw.replace(/\./g, ""), 10);
    var useDots = raw.indexOf(".") > -1;
    if (isNaN(target) || reduce) return;
    var start = null, dur = 1600;
    function fmt(v) { return useDots ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : String(v); }
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      node.nodeValue = prefix + fmt(Math.round(target * e)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    node.nodeValue = prefix + "0" + suffix;
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      el.classList.add("in");
      el.querySelectorAll && el.querySelectorAll("b[data-count]").forEach(countUp);
      if (el.matches("b[data-count]")) countUp(el);
      io.unobserve(el);
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".stat b, .sust-grid b, .badge b").forEach(function (b) { b.setAttribute("data-count", ""); });
  document.querySelectorAll(".reveal, .info, .gantt, .cycle").forEach(function (el) { io.observe(el); });
  setTimeout(function () { var bb = document.querySelector(".badge b"); if (bb) countUp(bb); }, 1000);

  // Barra de progreso, sombra de cabecera y enlace activo del menú
  var bar = document.querySelector(".progress"), header = document.querySelector("header");
  var links = Array.prototype.slice.call(document.querySelectorAll("nav a"));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
    header.classList.toggle("scrolled", h.scrollTop > 10);
    var current = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < 120) current = i; });
    links.forEach(function (a, i) { a.classList.toggle("active", i === current); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

document.getElementById("y").textContent = new Date().getFullYear();

// Correo de contacto compuesto en el navegador (los robots de spam no lo leen en el HTML)
(function () {
  var a = document.getElementById("mail");
  if (!a) return;
  var addr = a.getAttribute("data-u") + "@" + a.getAttribute("data-d");
  a.setAttribute("href", "mailto:" + addr);
  var t = a.querySelector(".mail-txt");
  if (t) t.textContent = addr;
})();
