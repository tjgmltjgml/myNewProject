(function () {
  const holderId = "sketch-holder";
  let instance = null;
  const COLS = 45;
  const ROWS = 28;

  function makeSketch(p) {
    let cell = 10;
    let grid;
    let next;

    function randomize() {
      for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
          grid[i][j] = p.floor(p.random(2));
        }
      }
    }

    p.setup = function () {
      const el = document.getElementById(holderId);
      const maxW = Math.min(720, el ? el.clientWidth - 8 : 640);
      cell = p.floor(maxW / COLS);
      const w = cell * COLS;
      const h = cell * ROWS;
      p.createCanvas(w, h);
      p.pixelDensity(1);
      grid = [];
      next = [];
      for (let i = 0; i < COLS; i++) {
        grid[i] = [];
        next[i] = [];
        for (let j = 0; j < ROWS; j++) {
          grid[i][j] = 0;
          next[i][j] = 0;
        }
      }
      randomize();
      p.frameRate(12);
    };

    p.draw = function () {
      p.background(20);
      p.noStroke();
      for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
          const v = grid[i][j];
          p.fill(v ? 160 : 40, v ? 200 : 45, v ? 255 : 55);
          p.rect(i * cell, j * cell, cell - 1, cell - 1);
        }
      }
      for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
          let n = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              if (di === 0 && dj === 0) continue;
              const ni = (i + di + COLS) % COLS;
              const nj = (j + dj + ROWS) % ROWS;
              n += grid[ni][nj];
            }
          }
          const alive = grid[i][j];
          if (alive && (n < 2 || n > 3)) next[i][j] = 0;
          else if (!alive && n === 3) next[i][j] = 1;
          else next[i][j] = alive;
        }
      }
      const tmp = grid;
      grid = next;
      next = tmp;
    };

    p.windowResized = function () {
      const el = document.getElementById(holderId);
      const maxW = Math.min(720, el ? el.clientWidth - 8 : 640);
      cell = p.floor(maxW / COLS);
      p.resizeCanvas(cell * COLS, cell * ROWS);
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
