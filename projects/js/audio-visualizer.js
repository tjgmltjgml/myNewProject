(function () {
  const holderId = "sketch-holder";
  const overlay = document.getElementById("media-overlay");
  const startBtn = document.getElementById("start-media");
  let instance = null;
  let mic = null;
  let fft = null;

  function makeSketch(p) {
    p.setup = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.55);
      p.createCanvas(w, h);
      p.colorMode(p.HSB, 360, 100, 100);
      mic = new p5.AudioIn();
      fft = new p5.FFT(0.75, 128);
      fft.setInput(mic);
      mic.start();
    };

    p.draw = function () {
      p.background(10, 10, 14);
      if (!fft) return;
      const spectrum = fft.analyze();
      p.noStroke();
      const barW = p.width / spectrum.length;
      for (let i = 0; i < spectrum.length; i++) {
        const amp = spectrum[i];
        const hh = p.map(amp, 0, 255, 4, p.height * 0.95);
        const hue = p.map(i, 0, spectrum.length, 200, 280);
        p.fill(hue % 360, 70, 80);
        p.rect(i * barW, p.height - hh, barW - 1, hh);
      }
    };

    p.windowResized = function () {
      const el = document.getElementById(holderId);
      const w = Math.min(720, el ? el.clientWidth - 8 : 640);
      const h = Math.floor(w * 0.55);
      p.resizeCanvas(w, h);
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

  function teardown() {
    if (instance) {
      instance.remove();
      instance = null;
    }
    mic = null;
    fft = null;
  }

  document.getElementById("restart")?.addEventListener("click", () => {
    teardown();
    startSketch();
  });

  startBtn?.addEventListener("click", () => {
    overlay?.setAttribute("hidden", "");
    startSketch();
  });
})();
