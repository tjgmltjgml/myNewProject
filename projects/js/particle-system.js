(function () {
  const holderId = "sketch-holder";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let instance = null;

  function makeSketch(p) {
    const particles = [];
    const N = reduced ? 40 : 140;

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.pos = p.createVector(p.random(p.width), p.random(p.height * 0.4));
        this.vel = p.createVector(p.random(-0.8, 0.8), p.random(0.4, 2.2));
        this.life = p.random(80, 200);
      }
      update() {
        this.vel.y += 0.03;
        this.pos.add(this.vel);
        this.life--;
        if (this.life < 0 || this.pos.y > p.height + 10) this.reset();
      }
      draw() {
        p.noStroke();
        p.fill(180, 200, 255, p.map(this.life, 0, 200, 40, 200));
        p.circle(this.pos.x, this.pos.y, 3);
      }
    }

    p.setup = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.55);
      p.createCanvas(w, h);
      for (let i = 0; i < N; i++) particles.push(new Particle());
    };

    p.draw = function () {
      p.fill(0, 0, 0, 35);
      p.noStroke();
      p.rect(0, 0, p.width, p.height);
      for (const q of particles) {
        q.update();
        q.draw();
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
