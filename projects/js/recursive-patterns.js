(function () {
  const holderId = "sketch-holder";
  let instance = null;

  function branch(p, len, depth) {
    p.line(0, 0, 0, -len);
    p.translate(0, -len);
    if (depth <= 0) {
      p.translate(0, len);
      return;
    }
    p.push();
    p.rotate(-0.45);
    branch(p, len * 0.68, depth - 1);
    p.pop();
    p.push();
    p.rotate(0.45);
    branch(p, len * 0.68, depth - 1);
    p.pop();
    p.translate(0, len);
  }

  function makeSketch(p) {
    p.setup = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.55);
      p.createCanvas(w, h);
    };

    p.draw = function () {
      p.background(18, 20, 28);
      p.stroke(200, 220, 255);
      p.strokeWeight(2);
      p.translate(p.width / 2, p.height - 24);
      branch(p, p.min(p.width, p.height) * 0.22, 10);
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
