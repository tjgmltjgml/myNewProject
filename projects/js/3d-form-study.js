(function () {
  const holderId = "sketch-holder";
  let instance = null;

  function makeSketch(p) {
    p.setup = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.62);
      p.createCanvas(w, h, p.WEBGL);
    };

    p.draw = function () {
      p.background(18, 20, 28);
      p.ambientLight(120);
      p.directionalLight(255, 255, 255, 0.4, -0.6, -0.6);
      if (typeof p.orbitControl === "function") {
        p.orbitControl();
      } else {
        p.rotateX(0.35);
        p.rotateY(p.frameCount * 0.008);
      }
      p.noStroke();
      p.push();
      p.fill(100, 160, 255);
      p.torus(90, 28, 28, 48);
      p.pop();
      p.push();
      p.translate(0, 0, -40);
      p.fill(255, 180, 120);
      p.box(70);
      p.pop();
    };

    p.windowResized = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.62);
      p.resizeCanvas(w, h, p.WEBGL);
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
