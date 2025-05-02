let mic, video;
let fluxLevel, logicMode;
let grid = [];
let cols, rows;

let lastVol = 0;
let colorPalette;
let currentColor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noStroke();
  parseURLParams();

  mic = new p5.AudioIn();
  mic.start();

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  colorPalette = [
    color(255, 100, 200), // magenta
    color(0, 255, 255),   // cyan
    color(255, 255, 100), // yellow
    color(150, 255, 150), // lime
    color(200, 100, 255)  // purple
  ];
  currentColor = random(colorPalette);

  initGrid();
}

function initGrid() {
  cols = floor(windowWidth / 50);
  rows = floor(windowHeight / 50);
  grid = [];

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      grid.push({
        x: (x + 0.5) * width / cols,
        y: (y + 0.7) * height / rows,
        angle: random(TWO_PI),
        speed: random(0.005, 0.02)
      });
    }
  }
}

function draw() {
  tint(255, 30);
  image(video, 0, 0, width, height);

  let vol = mic.getLevel();
  let t = millis() * 0.01;

  if (vol > 0.05 && vol > lastVol + 0.01) {
    currentColor = random(colorPalette);
  }
  lastVol = vol;

  for (let i = 0; i < grid.length; i++) {
    let g = grid[i];
    let size = map(vol, 0, 0.2, 10, 100) * (
      fluxLevel === 'high' ? 1.5 :
      fluxLevel === 'low' ? 0.7 : 1
    );
    let a = g.angle + t * g.speed * 100;

    push();
    translate(g.x, g.y);

    if (logicMode === 'scan') rotate(a);
    if (logicMode === 'invert') scale(sin(a + t));
    if (logicMode === 'fold') rotate(sin(g.x * 0.01 + t));

    fill(currentColor);
    drawHeart(0, 0, size * 0.5);
    pop();
  }
}

function drawHeart(x, y, s) {
  beginShape();
  for (let angle = 0; angle < TWO_PI; angle += 0.1) {
    let xx = 16 * pow(sin(angle), 3);
    let yy = -(
      13 * cos(angle) -
      5 * cos(2 * angle) -
      2 * cos(3 * angle) -
      cos(4 * angle)
    );
    vertex(x + xx * s * 0.05, y + yy * s * 0.05);
  }
  endShape(CLOSE);
}

function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  logicMode = params.get("logic") || "fold";
  fluxLevel = params.get("flux") || "med";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}
