(function () {
  const holderId = "sketch-holder";
  const overlay = document.getElementById("media-overlay");
  const startBtn = document.getElementById("start-media");
  let instance = null;

  function makeSketch(p) {
    let video;

    p.setup = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(480, el ? el.clientWidth - 8 : 480);
      const h = Math.floor(w * 0.75);
      p.createCanvas(w, h);
      video = p.createCapture(p.VIDEO, () => {
        video.size(p.width, p.height);
        video.hide();
      });
    };

    p.draw = function () {
      p.background(0);
      if (!video || !video.width) {
        p.fill(200);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.text("Starting camera…", p.width / 2, p.height / 2);
        return;
      }
      p.image(video, 0, 0, p.width, p.height);
      p.loadPixels();
      for (let i = 0; i < p.pixels.length; i += 16) {
        p.pixels[i] = p.pixels[i] * 1.2;
        p.pixels[i + 2] = p.min(255, p.pixels[i + 2] * 1.15);
      }
      p.updatePixels();
    };

    p.windowResized = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(480, el ? el.clientWidth - 8 : 480);
      const h = Math.floor(w * 0.75);
      p.resizeCanvas(w, h);
      if (video) video.size(p.width, p.height);
    };
  }

  function startSketch() {
    const el = document.getElementById(holderId);
    if (!el) return;
    if (instance) {
      instance.remove();
      instance = null;
    }
    instance = new p5(makeSketch, el);
  }

  document.getElementById("restart")?.addEventListener("click", () => {
    if (instance) {
      instance.remove();
      instance = null;
    }
    startSketch();
  });

  startBtn?.addEventListener("click", () => {
    overlay?.setAttribute("hidden", "");
    startSketch();
  });
})();
