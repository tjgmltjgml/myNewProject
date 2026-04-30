(function () {
  const holderId = "sketch-holder";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let instance = null;

  function makeSketch(p) {
    const letters = [];
    const word = "MOTION";

    p.setup = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.55);
      p.createCanvas(w, h);
      p.textFont("system-ui, sans-serif");
      p.textSize(42);
      for (let i = 0; i < word.length; i++) {
        letters.push({
          ch: word[i],
          x: 40 + i * 52,
          y: p.height / 2,
          vx: p.random(-1.2, 1.2),
          vy: p.random(-1.2, 1.2),
        });
      }
    };

    p.draw = function () {
      p.background(14, 14, 18);
      p.fill(240);
      p.noStroke();
      const t = p.millis() * 0.001;
      for (const L of letters) {
        if (!reduced) {
          L.vy += 0.04;
          L.x += L.vx;
          L.y += L.vy;
          if (L.x < 20 || L.x > p.width - 20) L.vx *= -1;
          if (L.y > p.height - 30) {
            L.y = p.height - 30;
            L.vy *= -0.72;
          }
        } else {
          L.y = p.height / 2 + p.sin(t + L.x * 0.02) * 12;
        }
        p.text(L.ch, L.x, L.y);
      }
    };

    p.windowResized = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.55);
      p.resizeCanvas(w, h);
    };
  }

  function start() {
    const el = document.getElementById(holderId);
    if (!el) return;
    if (instance) {
      instance.remove();
      instance = null;
    }
    instance = new p5(makeSketch, el);
  }

  document.getElementById("restart")?.addEventListener("click", start);
  start();
})();
