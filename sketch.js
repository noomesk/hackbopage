/* =========================================================
   HACKBO WEB — Arte generativo bioinformático
   Reacción-Difusión (Turing) + ASCII Mandelbrot Fractal
   ========================================================= */

let mode = 0;
const MODES = ['REACCIÓN-DIFUSIÓN', 'MANDELBROT_ASCII'];

// --- Gray-Scott reaction-diffusion (NO TOCAR) ---
let gridW, gridH;
let scaleFactor = 4;
let A, B, A2, B2;
let feed = 0.055, kill = 0.062;
let diffA = 1.0, diffB = 0.5;
let hueShift = 0;

// --- ASCII Mandelbrot ---
let asciiZone;
let asciiChars = " .:-=+*#%@▓▒░#$&";
let charW, charH;
let mbZoom = 1;
let mbCenterX = -0.743643887037151;
let mbCenterY = 0.13182590420533;
let mbMaxIter = 80;
let mbZoomSpeed = 1.012;
let mbResetTimer = 0;
let mbNoiseOffset = 0;
let fontSizeAscii = 9;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent(document.body);
  pixelDensity(1);
  initTuring();
  setAsciiZone();
  frameRate(60);
  updateClock();
  setInterval(updateClock, 1000);

  document.getElementById('btnRegen').addEventListener('click', regenerate);
  document.getElementById('btnMode').addEventListener('click', switchMode);
  document.getElementById('btnSave').addEventListener('click', () => saveCanvas('hackbo_pattern', 'png'));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initTuring();
  setAsciiZone();
}

function setAsciiZone() {
  let margin = 40;
  let w = width * 0.44;
  let h = height * 0.44;
  asciiZone = {
    x: width - w - margin,
    y: margin,
    w: w,
    h: h
  };
  charW = fontSizeAscii * 0.6;
  charH = fontSizeAscii * 0.95;
}

function draw() {
  if (mode === 0) drawTuring();
  else drawAsciiMandelbrot();

  document.getElementById('fpsLabel').textContent = 'FPS: ' + floor(frameRate());
}

/* ============ MODE 0: TURING PATTERNS (Gray-Scott) — SIN CAMBIOS ============ */

function initTuring() {
  gridW = floor(width / scaleFactor);
  gridH = floor(height / scaleFactor);
  A = new Float32Array(gridW * gridH).fill(1);
  B = new Float32Array(gridW * gridH).fill(0);

  for (let i = 0; i < 12; i++) {
    let cx = floor(random(gridW));
    let cy = floor(random(gridH));
    let r = floor(random(4, 14));
    for (let x = -r; x < r; x++) {
      for (let y = -r; y < r; y++) {
        let xi = (cx + x + gridW) % gridW;
        let yi = (cy + y + gridH) % gridH;
        if (x * x + y * y < r * r) {
          B[yi * gridW + xi] = 1;
        }
      }
    }
  }
  A2 = new Float32Array(A);
  B2 = new Float32Array(B);

  feed = random(0.02, 0.07);
  kill = random(0.05, 0.065);
  hueShift = random(360);

  loadPixels();
}

function idx(x, y) {
  x = (x + gridW) % gridW;
  y = (y + gridH) % gridH;
  return y * gridW + x;
}

function drawTuring() {
  for (let step = 0; step < 2; step++) {
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        let i = idx(x, y);
        let a = A[i], b = B[i];

        let lapA = A[idx(x+1,y)] + A[idx(x-1,y)] + A[idx(x,y+1)] + A[idx(x,y-1)]
                 + 0.05*(A[idx(x+1,y+1)]+A[idx(x-1,y-1)]+A[idx(x+1,y-1)]+A[idx(x-1,y+1)])
                 - 4.2*a;
        let lapB = B[idx(x+1,y)] + B[idx(x-1,y)] + B[idx(x,y+1)] + B[idx(x,y-1)]
                 + 0.05*(B[idx(x+1,y+1)]+B[idx(x-1,y-1)]+B[idx(x+1,y-1)]+B[idx(x-1,y+1)])
                 - 4.2*b;

        let reaction = a * b * b;
        A2[i] = a + (diffA * lapA * 0.2 - reaction + feed * (1 - a));
        B2[i] = b + (diffB * lapB * 0.2 + reaction - (kill + feed) * b);

        A2[i] = constrain(A2[i], 0, 1);
        B2[i] = constrain(B2[i], 0, 1);
      }
    }
    [A, A2] = [A2, A];
    [B, B2] = [B2, B];
  }

  noStroke();
  let hueBase = (hueShift + frameCount * 0.05) % 360;
  colorMode(HSB, 360, 100, 100, 255);

  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      let v = B[idx(x, y)];
      if (v > 0.02) {
        let hue = (hueBase + v * 180) % 360;
        let bright = map(v, 0, 1, 20, 100);
        fill(hue, 80, bright);
        rect(x * scaleFactor, y * scaleFactor, scaleFactor, scaleFactor);
      }
    }
  }
  colorMode(RGB, 255);
}

/* ============ MODE 1: MANDELBROT EN ASCII ============ */
/* Fractal de Mandelbrot renderizado con caracteres ASCII,
   zoom infinito animado + ruido para "grano" tipo terminal */

function drawAsciiMandelbrot() {
  background(4, 6, 10, 40);

  push();
  translate(asciiZone.x, asciiZone.y);

  drawHudFrame();

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, asciiZone.w, asciiZone.h);
  drawingContext.clip();

  // --- Zoom infinito con reset cíclico ---
  mbZoom *= mbZoomSpeed;
  mbResetTimer++;
  if (mbZoom > 80000 || mbResetTimer > 900) {
    mbZoom = 1;
    mbResetTimer = 0;
    // Cambia ligeramente el punto de interés para variar el patrón
    let targets = [
      [-0.743643887037151, 0.13182590420533],
      [-0.7453, 0.1127],
      [-0.16, 1.0405],
      [0.28693186889504513, 0.014286693904085048],
      [-1.25066, 0.02012]
    ];
    let t = random(targets);
    mbCenterX = t[0];
    mbCenterY = t[1];
  }

  mbNoiseOffset += 0.01;

  colorMode(HSB, 360, 100, 100, 255);
  textFont('monospace');
  textSize(fontSizeAscii);
  textAlign(LEFT, TOP);
  noStroke();

  let numCols = floor(asciiZone.w / charW);
  let numRows = floor(asciiZone.h / charH);

  let baseHue = (frameCount * 0.3) % 360;

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      // Mapear posición de pantalla al plano complejo
      let scaleC = 3.0 / mbZoom;
      let aspect = asciiZone.w / asciiZone.h;

      let cx = mbCenterX + (col / numCols - 0.5) * scaleC * aspect;
      let cy = mbCenterY + (row / numRows - 0.5) * scaleC;

      let iter = mandelbrotIter(cx, cy, mbMaxIter);
      let n = iter / mbMaxIter;

      // Ruido sutil para textura "viva" tipo grano de señal
      let grain = noise(col * 0.15, row * 0.15, mbNoiseOffset) * 0.15;
      let val = constrain(n + grain, 0, 1);

      if (iter < mbMaxIter) {
        let charIndex = floor(val * (asciiChars.length - 1));
        let ch = asciiChars.charAt(charIndex);

        let hue = (baseHue + val * 260) % 360;
        let bright = map(val, 0, 1, 30, 100);
        let alpha = map(val, 0, 1, 90, 255);

        fill(hue, 75, bright, alpha);
        text(ch, col * charW, row * charH);
      } else {
        // Puntos que "pertenecen" al conjunto: casi negro con un punto tenue
        fill(280, 40, 15, 120);
        text('.', col * charW, row * charH);
      }
    }
  }

  colorMode(RGB, 255);
  drawingContext.restore();
  pop();
}

function mandelbrotIter(cx, cy, maxIter) {
  let x = 0, y = 0;
  let iter = 0;
  while (x * x + y * y <= 4 && iter < maxIter) {
    let xtemp = x * x - y * y + cx;
    y = 2 * x * y + cy;
    x = xtemp;
    iter++;
  }
  return iter;
}

function drawHudFrame() {
  noFill();
  stroke(0, 255, 179, 180);
  strokeWeight(1);
  rect(0, 0, asciiZone.w, asciiZone.h);

  let cornerLen = 14;
  stroke(255, 0, 200, 220);
  strokeWeight(2);
  line(0, 0, cornerLen, 0); line(0, 0, 0, cornerLen);
  line(asciiZone.w, 0, asciiZone.w - cornerLen, 0); line(asciiZone.w, 0, asciiZone.w, cornerLen);
  line(0, asciiZone.h, cornerLen, asciiZone.h); line(0, asciiZone.h, 0, asciiZone.h - cornerLen);
  line(asciiZone.w, asciiZone.h, asciiZone.w - cornerLen, asciiZone.h); line(asciiZone.w, asciiZone.h, asciiZone.w, asciiZone.h - cornerLen);

  noStroke();
  fill(0, 255, 179, 200);
  textFont('monospace');
  textSize(9);
  textAlign(LEFT, TOP);
  text('MANDELBROT_SET :: zoom×' + nf(mbZoom, 1, 1), 4, -16);
  textAlign(RIGHT, TOP);
  fill(255, 0, 200, 180);
  text('z→z²+c', asciiZone.w - 4, -16);
}

/* ============ CONTROLES ============ */

function regenerate() {
  if (mode === 0) {
    initTuring();
  } else {
    mbZoom = 1;
    mbResetTimer = 0;
    setAsciiZone();
  }
}

function switchMode() {
  mode = (mode + 1) % 2;
  document.getElementById('modeLabel').textContent = 'MODO: ' + MODES[mode];
  if (mode === 0) initTuring();
  if (mode === 1) {
    setAsciiZone();
    background(4, 6, 10);
  }
}

function updateClock() {
  const el = document.getElementById('clock');
  if (el) {
    const now = new Date();
    el.textContent = now.toTimeString().split(' ')[0];
  }
}

function keyPressed() {
  if (key === ' ') regenerate();
  if (key === 'm' || key === 'M') switchMode();
}