import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/vision_bundle.mjs";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const cursor = document.getElementById("cursor");
const status = document.getElementById("status");
const colorElement = document.getElementById("color");
const clearButton = document.getElementById("clear");
const downloadButton = document.getElementById("download");

const ctx = canvas.getContext("2d");
const cursorCtx = cursor.getContext("2d");

const colors = [
    "#ff00ff",
    "#00ffff",
    "#00ff66",
    "#ffdf00",
    "#ff5c35",
    "#ffffff"
];

let detector;
let colorIndex = 0;
let currentColor = colors[colorIndex];
let lastVideoTime = -1;
let lastPoint = null;
let wasPinching = false;
let lastClearTime = 0;

function updateColor() {
    colorElement.style.background = currentColor;
    colorElement.style.color = currentColor;
}

function resizeCanvas() {
    const width = video.clientWidth;
    const height = video.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    cursor.width = width * dpr;
    cursor.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    cursor.style.width = `${width}px`;
    cursor.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cursorCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function clearDrawing() {
    ctx.clearRect(
        0,
        0,
        canvas.clientWidth,
        canvas.clientHeight
    );

    lastPoint = null;
}

function distance(a, b) {
    return Math.hypot(
        a.x - b.x,
        a.y - b.y
    );
}

function isFingerUp(hand, tip, joint) {
    return hand[tip].y < hand[joint].y;
}

function isOpenPalm(hand) {
    return (
        isFingerUp(hand, 8, 6) &&
        isFingerUp(hand, 12, 10) &&
        isFingerUp(hand, 16, 14) &&
        isFingerUp(hand, 20, 18)
    );
}

function isPinching(hand) {
    return distance(hand[4], hand[8]) < 0.065;
}

function drawLine(from, to) {
    const x1 = (1 - from.x) * canvas.clientWidth;
    const y1 = from.y * canvas.clientHeight;

    const x2 = (1 - to.x) * canvas.clientWidth;
    const y2 = to.y * canvas.clientHeight;

    ctx.save();

    ctx.strokeStyle = currentColor;
    ctx.shadowColor = currentColor;
    ctx.shadowBlur = 24;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.shadowBlur = 4;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.restore();
}

function showCursor(hand) {
    cursorCtx.clearRect(
        0,
        0,
        cursor.clientWidth,
        cursor.clientHeight
    );

    const point = hand[8];

    const x = (1 - point.x) * cursor.clientWidth;
    const y = point.y * cursor.clientHeight;

    cursorCtx.save();

    cursorCtx.beginPath();
    cursorCtx.arc(x, y, 11, 0, Math.PI * 2);

    cursorCtx.strokeStyle = currentColor;
    cursorCtx.lineWidth = 3;
    cursorCtx.shadowColor = currentColor;
    cursorCtx.shadowBlur = 18;

    cursorCtx.stroke();

    cursorCtx.restore();
}

async function setupHandTracking() {
    status.textContent = "LOADING AI...";

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
    );

    detector = await HandLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1,
            minHandDetectionConfidence: 0.3,
            minHandPresenceConfidence: 0.3,
            minTrackingConfidence: 0.3
        }
    );

    status.textContent = "AI READY";
}

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
        },
        audio: false
    });

    video.srcObject = stream;

    await video.play();

    resizeCanvas();
}

function loop() {
    if (!detector || video.readyState < 2) {
        requestAnimationFrame(loop);
        return;
    }

    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;

        const result = detector.detectForVideo(
            video,
            performance.now()
        );

        if (result.landmarks?.length) {
            const hand = result.landmarks[0];

            showCursor(hand);

            const palm = isOpenPalm(hand);
            const pinch = isPinching(hand);

            if (palm) {
                status.textContent = "OPEN PALM — CLEAR";

                if (performance.now() - lastClearTime > 800) {
                    clearDrawing();
                    lastClearTime = performance.now();
                }

                lastPoint = null;
            } else if (pinch) {
                status.textContent = "PINCH — CHANGE COLOR";

                if (!wasPinching) {
                    colorIndex =
                        (colorIndex + 1) % colors.length;

                    currentColor = colors[colorIndex];

                    updateColor();
                }

                wasPinching = true;
                lastPoint = null;
            } else {
                status.textContent = "DRAWING";

                wasPinching = false;

                const point = {
                    x: hand[8].x,
                    y: hand[8].y
                };

                if (lastPoint) {
                    drawLine(lastPoint, point);
                }

                lastPoint = point;
            }
        } else {
            lastPoint = null;
            wasPinching = false;

            cursorCtx.clearRect(
                0,
                0,
                cursor.clientWidth,
                cursor.clientHeight
            );

            status.textContent = "SHOW YOUR HAND";
        }
    }

    requestAnimationFrame(loop);
}

clearButton.addEventListener("click", clearDrawing);

downloadButton.addEventListener("click", () => {
    const link = document.createElement("a");

    link.download = "hand-magic-art.png";
    link.href = canvas.toDataURL("image/png");

    link.click();
});

window.addEventListener("resize", resizeCanvas);

async function startApp() {
    try {
        await setupHandTracking();
        await startCamera();
        updateColor();
        loop();
    } catch (error) {
        console.error(error);
        status.textContent = "CAMERA PERMISSION REQUIRED";
    }
}

startApp();
