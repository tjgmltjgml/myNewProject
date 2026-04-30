(function () {
  const holderId = "sketch-holder";
  let instance = null;

  function makeSketch(p) {
    let seed = 0;

    p.setup = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.55);
      p.createCanvas(w, h);
      seed = p.floor(p.random(1e9));
    };

    p.draw = function () {
      p.randomSeed(seed);
      p.background(12, 12, 16);
      p.translate(p.width / 2, p.height / 2);
      p.noFill();
      for (let r = 0; r < 8; r++) {
        p.stroke(200 + r * 6, 160 - r * 10, 220 - r * 8, 220);
        p.strokeWeight(1.2);
        p.beginShape();
        const pts = 90;
        for (let i = 0; i <= pts; i++) {
          const ang = (i / pts) * p.TWO_PI;
          const rad = 80 + p.random(-18, 18) + r * 14 + p.sin(ang * 3) * 10;
          p.vertex(p.cos(ang) * rad, p.sin(ang) * rad * 1.15);
        }
        p.endShape(p.CLOSE);
      }
      p.noLoop();
    };

    p.windowResized = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.55);
      p.resizeCanvas(w, h);
      p.redraw();
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
