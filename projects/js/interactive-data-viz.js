(function () {
  const holderId = "sketch-holder";
  let instance = null;
  let rows = [];

  function makeSketch(p) {
    p.preload = function () {
      p.loadJSON("data/sample-stats.json", (data) => {
        rows = Array.isArray(data) ? data : [];
      });
    };

    p.setup = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.55);
      p.createCanvas(w, h);
    };

    p.draw = function () {
      p.background(16, 18, 26);
      if (!rows.length) return;
      const pad = 36;
      const maxV = Math.max(...rows.map((r) => r.value), 1);
      const barAreaW = p.width - pad * 2;
      const bw = barAreaW / rows.length;
      const mx = p.constrain(p.mouseX, pad, p.width - pad);
      p.stroke(80, 100, 160);
      p.line(mx, pad, mx, p.height - pad);

      for (let i = 0; i < rows.length; i++) {
        const x = pad + i * bw;
        const h = p.map(rows[i].value, 0, maxV, 8, p.height - pad * 2);
        const target = p.map(mx, x, x + bw, 0, 1);
        const hover = p.constrain(target, 0, 1);
        p.noStroke();
        const c1 = p.color(70, 120, 240);
        const c2 = p.color(255, 110, 170);
        p.fill(p.lerpColor(c1, c2, hover));
        p.rect(x + 4, p.height - pad - h, bw - 8, h, 4, 4, 0, 0);
        p.fill(200);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(11);
        p.text(rows[i].label, x + bw / 2, p.height - pad + 6);
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
