// ==========================================
// LANDING PAGE - p5.js Sketch
// ==========================================
// Questo sketch gestisce l'intro animato (alienati)
// Al termine del zoom, setta window.landingPageComplete = true

let tex, slide1, slide2, slide3, myFont;
let fontLoaded = false;

const texts = [
  "'Alienato' è l'individuo che ha perduto il controllo della propria identità risultando estraneo a se stesso ...\n\n...o alla realtà.",
  "Nel XIX secolo i soggetti alienati venivano rinchiusi in strutture sanitarie riabilitative: i frenocomi.\n\nO comunemente noti come \"manicomi\".",
  "Frenocomio    dei     Caratteri", 
  "A  L  I  E  N  A  T  I"
];

// CONFIGURAZIONE PARAMETRI
const config = {
  positions: {
    slide1: { textX: 0.08, textY: 0.35, imgX: 0.85, imgY: 0.5 },
    slide2: { textX: 0.55, textY: 0.35, imgX: 0.0,  imgY: 0.0 },
    slide3: { 
      titoloX: 0.5, titoloY: 0.6, 
      alienatiX: 0.5, alienatiY: 0.66, 
      imgX: 0.5, imgY: 0.3 
    }
  },

  slide3AlienatiSize: 0.02,
  slide3TitoloSize: 0.014,
  
  typewriterSpeed: 0.25,
  fadeStep: 0.05,
  blinkSpeed: 0.08,
  blinkAlphaMin: 100,
  blinkAlphaMax: 255,
  
  slideMargin: 0.08,
  slide1TextSize: 0.01,
  slide1TextLeading: 0.020,
  slide1ImgScale: 1.15,
  slide2TextSize: 0.01,
  slide2TextLeading: 0.020,
  
  zoomSpeed: 0.015,
  zoomScaleFactor: 5,
  zoomTargetYFactor: 0.35,

  btnWidth: 0.2,
  btnHeight: 0.06,
  btnTextSize: 0.01
};

let currentSlide = 0;
let fadeProgress = 0;
let isFading = false;
let fadeDirection = 1;
let slideAlpha = 255;
let typewriterIndex = 0;
let isZooming = false;
let zoomProgress = 0;

function preload() {
  tex = loadImage("assets/img/sfondo.jpeg");
  slide1 = loadImage("assets/img/slide1_img.png");
  slide2 = loadImage("assets/img/slide2_img.png");
  slide3 = loadImage("assets/img/slide3_img.png");
  myFont = loadFont("assets/font/DoctorSaidMono-Regular(1).ttf", () => { fontLoaded = true; });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(fontLoaded ? myFont : 'Courier New');
  imageMode(CENTER);
}

function draw() {
  background(245, 245, 240);
  if (!isZooming) {
    drawBackgroundTexture();
    handleFade();
    handleTypewriter();
    drawCurrentSlide();
  } else {
    drawZoomAnimation();
  }
}

function drawBackgroundTexture() {
  push();
  tint(255, 80);
  image(tex, width / 2, height / 2, width * 1.5, height * 1.5);
  pop();
}

function handleFade() {
  if (isFading) {
    fadeProgress += config.fadeStep;
    if (fadeDirection === 1) {
      slideAlpha = 255 * (1 - fadeProgress);
      if (fadeProgress >= 1) {
        fadeProgress = 0;
        fadeDirection = -1;
        currentSlide++;
        typewriterIndex = 0;
      }
    } else {
      slideAlpha = 255 * fadeProgress;
      if (fadeProgress >= 1) {
        isFading = false;
        fadeProgress = 0;
        fadeDirection = 1;
        slideAlpha = 255;
      }
    }
  }
}

function handleTypewriter() {
  let fullText = (currentSlide === 2) ? texts[2] + texts[3] : texts[currentSlide];
  if (!isFading && typewriterIndex < fullText.length) {
    typewriterIndex += config.typewriterSpeed;
  }
}

function drawCurrentSlide() {
  push();
  tint(255, slideAlpha);
  if (currentSlide === 0) drawSlide1();
  if (currentSlide === 1) drawSlide2();
  if (currentSlide === 2) drawSlide3();
  pop();
}

function drawSlide1() {
  const p = config.positions.slide1;
  const colW = (width - (width * config.slideMargin) * 3) / 2;

  push();
  fill(0, slideAlpha);
  noStroke();
  textSize(width * config.slide1TextSize);
  textLeading(width * config.slide1TextLeading);
  textAlign(LEFT, CENTER);
  text(texts[0].substring(0, floor(typewriterIndex)), 
       width * p.textX, height * p.textY, colW, height * 0.5);
  pop();

  const imgW = width * 0.37;
  const imgH = (slide1.height / slide1.width) * imgW;
  image(slide1, width * p.imgX, height * p.imgY, imgW, imgH);
  drawBlinkPrompt(typewriterIndex >= texts[0].length && !isFading);
}

function drawSlide2() {
  const p = config.positions.slide2;
  const colW = (width - (width * config.slideMargin) * 3) / 2;

  push();
  imageMode(CORNER);
  const imgW = colW * 1.2;
  const imgH = (slide2.height / slide2.width) * imgW;
  image(slide2, width * p.imgX, height * p.imgY, imgW, imgH);
  imageMode(CENTER);
  pop();

  push();
  fill(0, slideAlpha);
  noStroke();
  textSize(width * config.slide2TextSize);
  textLeading(width * config.slide2TextLeading);
  textAlign(LEFT, CENTER);
  text(texts[1].substring(0, floor(typewriterIndex)), 
       width * p.textX, height * p.textY, colW, height * 0.5);
  pop();
  drawBlinkPrompt(typewriterIndex >= texts[1].length && !isFading);
}

function drawSlide3() {
  const p = config.positions.slide3;
  let progress = floor(typewriterIndex);

  // Titolo "Frenocomio"
  push();
  fill(0, slideAlpha);
  noStroke();
  textSize(width * config.slide3TitoloSize);
  textAlign(CENTER, CENTER);
  text(texts[2].substring(0, progress), width * p.titoloX, height * p.titoloY);
  pop();

  // "ALIENATI" indipendente
  if (progress > texts[2].length) {
    push();
    fill(0, slideAlpha);
    noStroke();
    textSize(width * config.slide3AlienatiSize);
    textAlign(CENTER, CENTER);
    text(texts[3].substring(0, progress - texts[2].length), 
         width * p.alienatiX, height * p.alienatiY);
    pop();
  }

  // IMMAGINE SENZA OPACITÀ
  const imgW = width * 0.45;
  const imgH = (slide3.height / slide3.width) * imgW;
  image(slide3, width * p.imgX, height * p.imgY, imgW, imgH);
  
  drawSlide3Button(imgW, imgH, width * p.imgX, height * p.imgY);
}

function drawBlinkPrompt(show) {
  if (!show) return;
  const blinkAlpha = map(sin(frameCount * config.blinkSpeed), -1, 1, config.blinkAlphaMin, config.blinkAlphaMax);
  push();
  fill(50, 50, 50, blinkAlpha * 0.5);
  noStroke();
  textSize(width * 0.009);
  textAlign(CENTER, CENTER);
  text("clicca per continuare", width / 2, height * 0.95);
  pop();
}

function drawSlide3Button(imgW, imgH, imgX, imgY) {
  const btnX = imgX;
  const btnY = imgY + imgH / 2 + height * 0.36;
  const btnW = width * config.btnWidth;
  const btnH = height * config.btnHeight;

  const hover = mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 &&
                mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2;

  push();
  stroke(0, slideAlpha);
  strokeWeight(2);
  fill(hover ? [0, slideAlpha] : [245, 245, 240, slideAlpha]);
  rectMode(CENTER);
  rect(btnX, btnY, btnW, btnH);
  noStroke();
  fill(hover ? [245, 245, 240, slideAlpha] : [0, slideAlpha]);
  textSize(width * config.btnTextSize);
  textAlign(CENTER, CENTER);
  text("ESPLORA", btnX, btnY);
  pop();
  cursor(hover ? HAND : ARROW);
}

function drawZoomAnimation() {
  background(245, 245, 240);
  zoomProgress += config.zoomSpeed;
  const scaleVal = 1 + zoomProgress * config.zoomScaleFactor;
  const fadeVal = pow(map(zoomProgress, 0.7, 1, 0, 1, true), 2);
  const imgW = width * 0.4;
  const imgH = (slide3.height / slide3.width) * imgW;
  const targetY = imgH * config.zoomTargetYFactor;
  const offsetY = -map(zoomProgress, 0, 1, 0, targetY * scaleVal);

  push();
  translate(width / 2, height / 2 + offsetY);
  scale(scaleVal);
  tint(255, 255 * (1 - fadeVal));
  image(slide3, 0, 0, imgW, imgH);
  pop();

  noStroke();
  fill(0, 255 * fadeVal);
  rect(0, 0, width, height);
  
  // === IMPORTANTE: Quando lo zoom finisce, segnala al gioco principale ===
  if (zoomProgress >= 1) {
    console.log('✅ Landing page zoom completato - segnalo al gioco');
    
    // Nascondi il canvas di p5
    const p5Canvas = document.querySelector('canvas');
    if (p5Canvas) {
      p5Canvas.style.display = 'none';
    }
    
    // Segnala al gioco che la landing è completa
    window.landingPageComplete = true;
    
    // Ferma p5
    noLoop();
  }
}

function mousePressed() {
  handleNextSlide();
}

function keyPressed() {
  if (key === ' ' || keyCode === 32) {
    handleNextSlide();
  }
}

function handleNextSlide() {
  if (isZooming) return;
  if (currentSlide === 2) {
    const p = config.positions.slide3;
    const imgW = width * 0.45;
    const imgH = (slide3.height / slide3.width) * imgW;
    const btnX = width * p.imgX;
    const btnY = height * p.imgY + imgH / 2 + height * 0.36;
    const btnW = width * config.btnWidth;
    const btnH = height * config.btnHeight;

    if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 &&
        mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) {
      isZooming = true;
      zoomProgress = 0;
    }
  } else if (currentSlide < 2 && !isFading) {
    isFading = true;
    fadeProgress = 0;
    fadeDirection = 1;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
