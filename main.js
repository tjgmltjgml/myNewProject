/**
 * Home: hero background sketch, smooth nav, gallery tag filter.
 * p5.js is loaded from CDN in index.html before this script.
 */

(function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* —— Smooth scroll for in-page nav —— */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      history.pushState(null, "", id);
    });
  });

  /* —— Gallery filter —— */
  const cards = document.querySelectorAll(".gallery-card[data-tags]");
  const filterBtns = document.querySelectorAll(".filter-btn[data-filter]");

  function setFilter(tag) {
    filterBtns.forEach((btn) => {
      const pressed = btn.dataset.filter === tag;
      btn.setAttribute("aria-pressed", pressed ? "true" : "false");
    });
    cards.forEach((card) => {
      const tags = (card.dataset.tags || "").toLowerCase().split(/\s+/);
      const show = tag === "all" || tags.includes(tag.toLowerCase());
      card.hidden = !show;
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setFilter(btn.dataset.filter || "all");
    });
  });

  setFilter("all");

  /* —— Hero background sketch (global p5) —— */
  const heroMount = document.getElementById("hero-canvas");
  if (!heroMount || typeof p5 === "undefined") return;

  const sketch = function (p) {
    let t = 0;

    p.setup = function () {
      const w = heroMount.offsetWidth || window.innerWidth;
      const h = heroMount.offsetHeight || Math.min(window.innerHeight, 720);
      p.createCanvas(w, h);
      p.pixelDensity(Math.min(2, p.displayDensity()));
    };

    p.windowResized = function () {
      const w = heroMount.offsetWidth || window.innerWidth;
      const h = heroMount.offsetHeight || Math.min(window.innerHeight, 720);
      p.resizeCanvas(w, h);
    };

    p.draw = function () {
      p.clear();
      if (prefersReducedMotion) {
        p.background(0, 0, 0, 8);
        p.noStroke();
        p.fill(37, 99, 235, 40);
        p.circle(p.width * 0.5, p.height * 0.45, p.min(p.width, p.height) * 0.35);
        return;
      }

      t += 0.003;
      const cols = Math.floor(p.width / 48) + 1;
      const rows = Math.floor(p.height / 48) + 1;
      p.noStroke();
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * 48;
          const y = j * 48;
          const n = p.noise(i * 0.12 + t, j * 0.12, t * 0.5);
          const a = p.map(n, 0, 1, 8, 55);
          p.fill(37, 99, 235, a);
          p.circle(x, y, 4 + n * 10);
        }
      }
    };
  };

  new p5(sketch, heroMount);
})();
