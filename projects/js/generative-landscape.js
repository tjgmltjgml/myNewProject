(function () {
  const holderId = "sketch-holder";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let instance = null;

  function makeSketch(p) {
    let w = 640;
    let h = 400;
    let fly = 0;

    p.setup = function () {
      const el = document.getElementById(holderId);
      w = Math.min(720, el ? el.clientWidth - 8 : 640);
      h = Math.floor(w * 0.55);
      p.createCanvas(w, h);
      p.noiseSeed(p.random(9999));
    };

    p.draw = function () {
      p.background(12, 14, 22);
      if (reduced) {
        p.stroke(80, 120, 200);
        p.noFill();
        for (let x = 0; x < p.width; x += 8) {
          const y = p.map(p.noise(x * 0.01), 0, 1, p.height * 0.3, p.height * 0.7);
          p.line(x, p.height, x, y);
        }
        return;
      }
      fly += 0.012;
      p.stroke(90, 140, 255, 180);
      p.noFill();
      const rows = 48;
      for (let y = 0; y < rows; y++) {
        p.beginShape();
        for (let x = 0; x < p.width; x += 6) {
          const n = p.noise(x * 0.006, y * 0.08 + fly, fly * 0.3);
          const yy = p.map(n, 0, 1, p.height * 0.35, p.height * 0.92);
          p.vertex(x, yy - y * 2.2);
        }
        p.endShape();
      }
    };

    p.windowResized = function () {
      const el = document.getElementById(holderId);
      w = Math.min(720, el ? el.clientWidth - 8 : 640);
      h = Math.floor(w * 0.55);
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
