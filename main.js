// =====================================================================================
// 변수 선언
// =====================================================================================
const CANVAS_SIZE = 800;
const UI_HEIGHT = 170;
const BASE_CANVAS_Y = 72;

let strokeIndex = 0;
let brushSize = 25;
let currentWeight = 1;
let hanji, krGuideImg;

let paintLayer;
let mainCanvas;
let canvasOffsetX = 0;
let canvasOffsetY = BASE_CANVAS_Y;

let undoStack = [];
let redoStack = [];

// =====================================================================================
// 언어별 가이드라인 구성 vertex 좌표설정
// =====================================================================================
// 한글은 이미지로 대체
const guideLines = {
  none: [],
  cn: [
    [
      { x: 400, y: 280 },
      { x: 400, y: 450 },
      { x: 400, y: 650 },
      { x: 400, y: 720 },
      { x: 350, y: 670 },
      { x: 320, y: 640 },
    ],
    [
      { x: 250, y: 460 },
      { x: 300, y: 440 },
      { x: 350, y: 430 },
      { x: 330, y: 500 },
      { x: 280, y: 580 },
      { x: 220, y: 650 },
    ],
    [{ x: 550, y: 400 }, { x: 500, y: 440 }, { x: 460, y: 490 }],
    [{ x: 450, y: 530 }, { x: 500, y: 580 }, { x: 570, y: 650 }, { x: 630, y: 700 }],
  ],
  jp: [
    [
      { x: 320, y: 400 },
      { x: 320, y: 450 },
      { x: 320, y: 500 },
      { x: 330, y: 550 },
      { x: 350, y: 580 },
      { x: 380, y: 600 },
    ],
    [{ x: 480, y: 420 }, { x: 480, y: 480 }, { x: 470, y: 520 }, { x: 450, y: 540 }],
  ],
};

// 기본 화면은  guide off로 설정
let currentGuide = "none";

// UI 버튼 슬라이더, 컬러피커 변수 설정
let btnUndo, btnRedo, btnClear, btnKR, btnCN, btnJP, btnNone, btnColorMode, btnSave;
let sizeSlider, sizeLabel, colorPicker;
let isRainbowMode = true;

// =====================================================================================
// 스케치 시작 전 이미지 로딩
// =====================================================================================
function preload() {
  // 한지 배경 이미지
  hanji = loadImage(
    "hanji.jpg",
    () => {},
    () => console.log("한지 로드 실패")
  );
  // 한글 가이드 이미지
  krGuideImg = loadImage(
    "guide_kr.png",
    () => {},
    () => console.log("가이드 이미지 로드 실패")
  );
}

// =====================================================================================
// 초기 설정
// =====================================================================================
function setup() {
  mainCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  mainCanvas.elt.setAttribute("aria-label", "InkFlow drawing canvas");
  colorMode(HSB, 360, 100, 100, 100);

  // 붓질 전용 레이어 생성 -> save image 위함
  paintLayer = createGraphics(CANVAS_SIZE, CANVAS_SIZE);
  paintLayer.colorMode(HSB, 360, 100, 100, 100);
  paintLayer.clear(); // 보이지 않도록 투명하게 초기화

  // UI 버튼 생성
  setupButtons();
  updateLayout();
}

// =====================================================================================
// 메인 루프
// =====================================================================================
function draw() {
  // 배경 이미지 로드 실패 시 한지와 비슷한 배경 색 설정
  if (hanji && hanji.width > 0) image(hanji, 0, 0, width, height);
  else background(35, 4, 94); // 따뜻한 크림색 fallback

  drawGuide(); // 가이드라인 생성
  image(paintLayer, 0, 0); // 붓질 레이어
  drawCanvasUI(); // 가장 위 레이어

  // 슬라이더 값 갱신 및 텍스트 반영
  brushSize = sizeSlider.value();
  sizeLabel.html("Brush Size: " + brushSize);

  // 커서 제어 (화살표/십자)
  cursor(mouseY < UI_HEIGHT ? ARROW : CROSS);

  // 그리기 로직
  if (!mouseIsPressed || mouseY < UI_HEIGHT) return;

  // 획 굵기 결정 위한 마우스 이동 거리 계산
  let d = dist(mouseX, mouseY, pmouseX, pmouseY);

  // 거리가 멀수록 얇게 매핑
  currentWeight = lerp(
    currentWeight,
    constrain(map(d, 0, 25, brushSize, brushSize * 0.1), 1, brushSize),
    0.35
  );

  // 투명도 : 빠를수록 투명해짐
  let alphaValue = constrain(map(d, 0, 25, 85, 30), 30, 85);

  // 색상 결정 - 무지개 / 컬러피커
  let finalH, finalS, finalB;
  let useRGB = false;
  let finalR, finalG, finalBrgb;

  if (isRainbowMode) {
    const rainbowHues = [0, 30, 55, 120, 195, 230, 275, 315];
    finalH = rainbowHues[strokeIndex % rainbowHues.length]; // 색상 순환
    finalS = 85; // 채도 고정
    finalB = 90; // 밝기 고정
    useRGB = false;
  } else {
    // hex값으로 직접 읽어서 RGB 파싱 (HSB 변환 오류 방지)
    let hexColor = colorPicker.value();
    finalR = parseInt(hexColor.slice(1, 3), 16); // R
    finalG = parseInt(hexColor.slice(3, 5), 16); // G
    finalBrgb = parseInt(hexColor.slice(5, 7), 16); // B
    useRGB = true;
  }

  // ===================================================================================
  // paintLayer에 붓질
  // ===================================================================================
  paintLayer.noStroke();
  // 점 사이 채우기
  let steps = max(1, floor(d / 2));
  for (let s = 0; s <= steps; s++) {
    // 중간 지점 계산
    let x = lerp(pmouseX, mouseX, s / steps);
    let y = lerp(pmouseY, mouseY, s / steps);

    // 메인 획 - 붓 느낌 구현 (세로로 긴 타원)
    if (useRGB) {
      paintLayer.colorMode(RGB, 255);
      paintLayer.fill(finalR, finalG, finalBrgb, alphaValue * 2.55);
    } else {
      paintLayer.colorMode(HSB, 360, 100, 100, 100);
      paintLayer.fill(finalH, finalS, finalB, alphaValue);
    }
    paintLayer.ellipse(x, y, currentWeight, currentWeight * 1.4);

    // 번짐 효과 - 주변에 랜덤으로 타원 배치
    for (let i = 0; i < 5; i++) {
      let r = currentWeight * 0.5;
      let alphaMultiplier = i < 4 ? random(0.2, 0.5) : 0.1;
      if (useRGB) {
        paintLayer.colorMode(RGB, 255);
        paintLayer.fill(finalR, finalG, finalBrgb, alphaValue * 2.55 * alphaMultiplier);
      } else {
        paintLayer.colorMode(HSB, 360, 100, 100, 100);
        paintLayer.fill(finalH, finalS - 10, finalB - 5, alphaValue * alphaMultiplier);
      }
      paintLayer.ellipse(
        x + random(-r, r),
        y + random(-r * 0.4, r * 0.4),
        currentWeight * random(0.3, 0.8),
        currentWeight * random(0.3, 0.8) * 1.4
      );
    }
  }
}

// =====================================================================================
// 가이드라인 그리기 (draw()에서 호출)
// =====================================================================================
function drawGuide() {
  if (currentGuide === "none") return;
  push();
  if (currentGuide === "kr" && krGuideImg) {
    // 한글 가이드 - 이미지
    tint(0, 0, 50, 5);
    let imgRatio = 1474 / 1000; // 원본 이미지 비율
    let displayW = 500;
    let displayH = displayW / imgRatio;
    image(krGuideImg, (width - displayW) / 2, 300, displayW, displayH); // 가운데 정렬
  } else {
    // 한자, 히라가나 - 좌표 데이터
    let target = guideLines[currentGuide];
    if (target && target.length > 0) {
      noFill();
      stroke(0, 0, 80, 30);
      strokeWeight(30);
      strokeCap(ROUND); // 선 끝 둥글게
      strokeJoin(ROUND); // 선 꺾임 둥글게
      for (let i = 0; i < target.length; i++) {
        beginShape(); // 선 그리기 시작
        for (let j = 0; j < target[i].length; j++) {
          vertex(target[i][j].x, target[i][j].y);
        }
        endShape(); // 선 그리기 종료
      }
    }
  }
  pop(); // 그리기 설정 복원
}

// =====================================================================================
// UI 그리기 (draw()에서 호출 / 매 프레임 갱신)
// =====================================================================================
function drawCanvasUI() {
  push();
  noStroke();
  fill(240, 5, 95);
  rect(0, 0, width, UI_HEIGHT); // 상단 UI 배경
  stroke(40, 20, 30);
  strokeWeight(3);
  line(0, UI_HEIGHT, width, UI_HEIGHT); // 구분선

  noStroke();
  fill(40, 20, 30, 80);
  textAlign(LEFT);
  textSize(12);
  textFont('"Batang", serif'); // 안내 텍스트
  text("⬊ DRAWING AREA", 20, UI_HEIGHT + 20); // 그리기 영역
  text("C : Clear", width - 75, UI_HEIGHT + 20); // 단축키
  text("S : Save", width - 75, UI_HEIGHT + 40);
  text("Z : Undo", width - 75, UI_HEIGHT + 60);
  pop();
}

// =====================================================================================
// 버튼 생성 및 배치 (setup()에서 호출)
// =====================================================================================
function setupButtons() {
  // Undo, Redo, Clear 버튼
  btnUndo = createButton("↩ Undo");
  btnUndo.mousePressed(triggerUndo);
  btnRedo = createButton("↪ Redo");
  btnRedo.mousePressed(triggerRedo);
  btnClear = createButton("🗑 Clear");
  btnClear.mousePressed(triggerClear);

  // 브러시 사이즈 슬라이더
  sizeLabel = createSpan("Brush Size: 25");
  sizeSlider = createSlider(5, 80, 25, 1); // 최소, 최대, 기본값, 단계

  // 가이드 선택 버튼
  btnKR = createButton("Korean(서강)");
  btnKR.mousePressed(() => setGuide("kr"));
  btnCN = createButton("Chinese(水)");
  btnCN.mousePressed(() => setGuide("cn"));
  btnJP = createButton("Japanese(い)");
  btnJP.mousePressed(() => setGuide("jp"));
  btnNone = createButton("Guide Off");
  btnNone.mousePressed(() => setGuide("none"));

  // 단색 모드 - 색상 도구
  colorPicker = createColorPicker("#000000");
  btnColorMode = createButton("🌈 Rainbow Mode (ON)");
  btnColorMode.mousePressed(toggleColorMode);
  btnSave = createButton("💾 Save Image");
  btnSave.mousePressed(saveArt);

  // 모든 버튼에 스타일 적용
  let allButtons = [btnUndo, btnRedo, btnClear, btnKR, btnCN, btnJP, btnNone, btnColorMode, btnSave];
  for (let btn of allButtons) applyKoreanStyle(btn);

  sizeLabel.addClass("inkflow-size-label");
}

function updateLayout() {
  canvasOffsetX = max(16, floor((windowWidth - CANVAS_SIZE) / 2));
  canvasOffsetY = BASE_CANVAS_Y;

  if (mainCanvas) {
    mainCanvas.position(canvasOffsetX, canvasOffsetY);
  }

  // 패널 기준으로 버튼/슬라이더 위치 업데이트
  btnUndo.position(canvasOffsetX + 20, canvasOffsetY + 20);
  btnRedo.position(canvasOffsetX + 120, canvasOffsetY + 20);
  btnClear.position(canvasOffsetX + 220, canvasOffsetY + 20);

  sizeLabel.position(canvasOffsetX + 320, canvasOffsetY + 26);
  sizeSlider.position(canvasOffsetX + 440, canvasOffsetY + 26);

  btnKR.position(canvasOffsetX + 20, canvasOffsetY + 70);
  btnCN.position(canvasOffsetX + 144, canvasOffsetY + 70);
  btnJP.position(canvasOffsetX + 258, canvasOffsetY + 70);
  btnNone.position(canvasOffsetX + 390, canvasOffsetY + 70);

  colorPicker.position(canvasOffsetX + 20, canvasOffsetY + 120);
  btnColorMode.position(canvasOffsetX + 95, canvasOffsetY + 120);
  btnSave.position(canvasOffsetX + 300, canvasOffsetY + 120);
}

function windowResized() {
  updateLayout();
}

// =====================================================================================
// 버튼 스타일 적용 (setupButtons()에서 호출)
// =====================================================================================
function applyKoreanStyle(btn) {
  btn.style("background-color", "rgba(250, 245, 235, 0.85)");
  btn.style("border", "1.5px solid #4A3C31");
  btn.style("color", "#333333");
  btn.style("padding", "6px 12px");
  btn.style("border-radius", "2px");
  btn.style("font-family", '"Batang", serif');
  btn.style("font-size", "14px");
  btn.style("box-shadow", "2px 2px 0px #4A3C31");
  btn.style("cursor", "pointer");
}

// =====================================================================================
// 색상 모드 (버튼 콜백)
// =====================================================================================
function toggleColorMode() {
  isRainbowMode = !isRainbowMode;
  btnColorMode.html(isRainbowMode ? "🌈 Rainbow Mode (ON)" : "🎨 Solid Mode (ON)");
}

// =====================================================================================
// 가이드 변경 (버튼 콜백)
// =====================================================================================
function setGuide(lang) {
  currentGuide = lang;
  // 가이드 변경 시 붓질은 유지, 화면만 갱신됨 (triggerClear 제거)
}

// =====================================================================================
// 마우스 이벤트
// =====================================================================================
function mousePressed() {
  if (mouseY > UI_HEIGHT && mouseY < height && mouseX > 0 && mouseX < width) {
    // drawing area에서만 동작
    undoStack.push(paintLayer.get()); // paintLayer 스냅샷 저장
    if (undoStack.length > 20) undoStack.shift();
    redoStack = []; // 새 붓질 시작 시 redo 스택 초기화
    currentWeight = 1; // 획 굵기 초기화
  }
}

function mouseReleased() {
  if (mouseY > UI_HEIGHT && mouseY < height && mouseX > 0 && mouseX < width) strokeIndex++; // 색상 변경 위해 획 카운터 증가
}

// =====================================================================================
// Undo, Redo, Clear 구현
// =====================================================================================
function triggerUndo() {
  if (undoStack.length > 0) {
    redoStack.push(paintLayer.get()); // 현재 상태 redo 스택에 저장
    let prev = undoStack.pop(); // undo 스택에서 이전 상태 불러오기
    paintLayer.clear(); // 초기화
    paintLayer.image(prev, 0, 0); // 이전 상태 복원
    strokeIndex = max(0, strokeIndex - 1); // 색상 카운터 복원
  }
}

function triggerRedo() {
  if (redoStack.length > 0) {
    undoStack.push(paintLayer.get()); // 현재 상태 undo 스택에 저장
    let next = redoStack.pop(); // redo 스택에서 다음 상태 꺼내기
    paintLayer.clear(); // 초기화
    paintLayer.image(next, 0, 0); // 다음 상태 복원
    strokeIndex++;
  }
}

function triggerClear() {
  undoStack = []; // undo 스택 비우기
  redoStack = []; // redo 스택 비우기
  paintLayer.clear(); // 붓질 레이어만 초기화 (배경 유지)
  strokeIndex = 0; // 색상 카운터 초기화
}

// =====================================================================================
// 저장 함수
// =====================================================================================
function saveArt() {
  // 메인 캔버스에 배경 + 붓질만 합성
  if (hanji && hanji.width > 0) image(hanji, 0, 0, width, height);
  else background(35, 4, 94); // draw()와 동일한 fallback 색상
  image(paintLayer, 0, 0);

  // p5가 생성한 메인 캔버스 참조
  let sourceCanvas = mainCanvas ? mainCanvas.elt : document.querySelector("canvas");
  if (!sourceCanvas) return;

  // 실제 픽셀 수 ÷ 논리 크기 = 화면 배율(DPR) 계산 (Retina: 2, 일반: 1)
  let dpr = sourceCanvas.width / CANVAS_SIZE;
  // 저장용 캔버스 생성 (UI 영역 제외, DPR 적용해 고해상도로)
  let exportCanvas = document.createElement("canvas");
  exportCanvas.width = CANVAS_SIZE * dpr;
  exportCanvas.height = (CANVAS_SIZE - UI_HEIGHT) * dpr;
  // 저장용 캔버스에 그림 복사 위한 2D 드로잉 컨텍스트 획득
  let ctx = exportCanvas.getContext("2d");

  // dpr 적용해서 크롭
  ctx.drawImage(
    sourceCanvas, // 원본 이미지
    0,
    UI_HEIGHT * dpr, // 자르는 시작점 (UI 영역 제외)
    CANVAS_SIZE * dpr,
    (CANVAS_SIZE - UI_HEIGHT) * dpr, // 자를 소스 크기
    0,
    0, // 출력 시작점
    CANVAS_SIZE * dpr,
    (CANVAS_SIZE - UI_HEIGHT) * dpr // 출력 크기
  );

  // 이미지 저장
  let link = document.createElement("a");
  link.download = "my_InkFlow.png"; // 저장될 파일명
  link.href = exportCanvas.toDataURL("image/png"); // png 데이터로 변환
  link.click(); // 다운로드 실행
}

// =====================================================================================
// 키보드 단축키
// =====================================================================================
function keyPressed() {
  if (key === "c" || key === "C") triggerClear();
  if (key === "z" || key === "Z") triggerUndo();
  if (key === "s" || key === "S") saveArt();
}
