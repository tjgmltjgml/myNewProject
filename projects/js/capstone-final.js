(function () {
  const holderId = "sketch-holder";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let instance = null;

  function makeSketch(p) {
    const n = reduced ? 50 : 160;
    let pts;

    function reset() {
      pts = [];
      for (let i = 0; i < n; i++) {
        pts.push({
          x: p.random(p.width),
          y: p.random(p.height),
          vx: 0,
          vy: 0,
        });
      }
    }

    p.setup = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.55);
      p.createCanvas(w, h);
      reset();
    };

    p.draw = function () {
      p.fill(0, 0, 0, 28);
      p.noStroke();
      p.rect(0, 0, p.width, p.height);
      const t = p.millis() * 0.00035;
      for (const q of pts) {
        const angle =
          p.noise(q.x * 0.004, q.y * 0.004, t) * p.TWO_PI * 2;
        q.vx = p.lerp(q.vx, p.cos(angle) * 1.8, 0.06);
        q.vy = p.lerp(q.vy, p.sin(angle) * 1.8, 0.06);
        q.x += reduced ? 0 : q.vx;
        q.y += reduced ? 0 : q.vy;
        if (q.x < 0) q.x = p.width;
        if (q.x > p.width) q.x = 0;
        if (q.y < 0) q.y = p.height;
        if (q.y > p.height) q.y = 0;
        p.stroke(130, 200, 255, 140);
        p.strokeWeight(1);
        p.point(q.x, q.y);
      }
    };

    p.windowResized = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.55);
      p.resizeCanvas(w, h);
      reset();
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
