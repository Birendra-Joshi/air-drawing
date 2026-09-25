import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/vision_bundle.mjs";

/* =====================================================
   ELEMENTS
===================================================== */

const video = document.getElementById("video");

const canvas = document.getElementById("canvas");

const cursor = document.getElementById("cursor");

const ctx = canvas.getContext("2d");

const cursorCtx = cursor.getContext("2d");

const status = document.getElementById("status");

const colorElement = document.getElementById("color");

const clearButton = document.getElementById("clear");

const downloadButton = document.getElementById("download");

/* =====================================================
   VARIABLES
===================================================== */

let detector = null;

let lastVideoTime = -1;

let lastPoint = null;

let wasPinching = false;

let lastClearTime = 0;

/* =====================================================
   COLORS
===================================================== */

const colors = [
    "#ff00ff",
    "#00ffff",
    "#00ff66",
    "#ffff00",
    "#ff6600",
    "#ffffff"
];

let colorIndex = 0;

let currentColor = colors[colorIndex];

function updateColor() {

    colorElement.style.background = currentColor;

    colorElement.style.color = currentColor;
}

updateColor();

/* =====================================================
   CANVAS RESIZE
===================================================== */

function resizeCanvas() {

    const width = video.clientWidth;

    const height = video.clientHeight;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    cursor.width = width * dpr;
    cursor.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    cursor.style.width = width + "px";
    cursor.style.height = height + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    cursorCtx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}

window.addEventListener("resize", resizeCanvas);

/* =====================================================
   CLEAR FUNCTION
===================================================== */

function clearDrawing() {

    ctx.clearRect(
        0,
        0,
        canvas.clientWidth,
        canvas.clientHeight
    );

    lastPoint = null;
}

/* =====================================================
   CLEAR BUTTON
===================================================== */

clearButton.onclick = clearDrawing;

/* =====================================================
   DOWNLOAD
===================================================== */

downloadButton.onclick = () => {

    const link = document.createElement("a");

    link.download = "hand-magic-art.png";

    link.href = canvas.toDataURL("image/png");

    link.click();
};

/* =====================================================
   DISTANCE
===================================================== */

function distance(a, b) {

    return Math.sqrt(
        Math.pow(a.x - b.x, 2) +
        Math.pow(a.y - b.y, 2)
    );
}

/* =====================================================
   FINGER DETECTION
===================================================== */

function indexUp(hand) {

    return hand[8].y < hand[6].y;
}

function middleUp(hand) {

    return hand[12].y < hand[10].y;
}

function ringUp(hand) {

    return hand[16].y < hand[14].y;
}

function pinkyUp(hand) {

    return hand[20].y < hand[18].y;
}

/* =====================================================
   OPEN PALM
===================================================== */

function isOpenPalm(hand) {

    return (
        indexUp(hand) &&
        middleUp(hand) &&
        ringUp(hand) &&
        pinkyUp(hand)
    );
}

/* =====================================================
   PINCH
===================================================== */

function isPinching(hand) {

    const thumb = hand[4];

    const index = hand[8];

    const d = distance(thumb, index);

    return d < 0.065;
}

/* =====================================================
   DRAW LINE
===================================================== */

function drawLine(from, to) {

    const x1 =
        (1 - from.x) *
        canvas.clientWidth;

    const y1 =
        from.y *
        canvas.clientHeight;

    const x2 =
        (1 - to.x) *
        canvas.clientWidth;

    const y2 =
        to.y *
        canvas.clientHeight;

    ctx.save();

    /* Neon outer glow */

    ctx.strokeStyle = currentColor;

    ctx.shadowColor = currentColor;

    ctx.shadowBlur = 28;

    ctx.lineWidth = 10;

    ctx.lineCap = "round";

    ctx.lineJoin = "round";

    ctx.beginPath();

    ctx.moveTo(x1, y1);

    ctx.lineTo(x2, y2);

    ctx.stroke();

    /* White core */

    ctx.shadowBlur = 5;

    ctx.strokeStyle = "#ffffff";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(x1, y1);

    ctx.lineTo(x2, y2);

    ctx.stroke();

    ctx.restore();
}

/* =====================================================
   HAND CURSOR
===================================================== */

function showCursor(hand) {

    cursorCtx.clearRect(
        0,
        0,
        cursor.clientWidth,
        cursor.clientHeight
    );

    const point = hand[8];

    const x =
        (1 - point.x) *
        cursor.clientWidth;

    const y =
        point.y *
        cursor.clientHeight;

    cursorCtx.save();

    cursorCtx.beginPath();

    cursorCtx.arc(
        x,
        y,
        11,
        0,
        Math.PI * 2
    );

    cursorCtx.strokeStyle = currentColor;

    cursorCtx.lineWidth = 3;

    cursorCtx.shadowColor = currentColor;

    cursorCtx.shadowBlur = 20;

    cursorCtx.stroke();

    cursorCtx.restore();
}

/* =====================================================
   SETUP MEDIAPIPE
===================================================== */

async function setupHandTracking() {

    status.innerText =
        "Loading AI hand tracking...";

    const vision =
        await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
        );

    detector =
        await HandLandmarker.createFromOptions(
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

    status.innerText = "AI Ready ✨";
}

/* =====================================================
   CAMERA
===================================================== */

async function startCamera() {

    const stream =
        await navigator.mediaDevices.getUserMedia({

            video: {

                width: {
                    ideal: 1280
                },

                height: {
                    ideal: 720
                },

                facingMode: "user"
            },

            audio: false
        });

    video.srcObject = stream;

    await video.play();

    resizeCanvas();
}

/* =====================================================
   MAIN DETECTION LOOP
===================================================== */

function loop() {

    if (
        !detector ||
        video.readyState < 2
    ) {

        requestAnimationFrame(loop);

        return;
    }

    if (
        video.currentTime !==
        lastVideoTime
    ) {

        lastVideoTime =
            video.currentTime;

        const result =
            detector.detectForVideo(
                video,
                performance.now()
            );

        /* =====================================
           HAND FOUND
        ====================================== */

        if (
            result.landmarks &&
            result.landmarks.length > 0
        ) {

            const hand =
                result.landmarks[0];

            /* Show cursor */

            showCursor(hand);

            /* Detect gestures */

            const palm =
                isOpenPalm(hand);

            const pinch =
                isPinching(hand);

            /* =================================
               OPEN PALM
            ================================= */

            if (palm) {

                status.innerText =
                    "🖐️ OPEN PALM → CLEAR";

                if (
                    performance.now() -
                    lastClearTime >
                    800
                ) {

                    clearDrawing();

                    lastClearTime =
                        performance.now();
                }

                lastPoint = null;
            }

            /* =================================
               PINCH
            ================================= */

            else if (pinch) {

                status.innerText =
                    "🤏 PINCH → CHANGE COLOR";

                /*
                    Change color only
                    when pinch starts.
                */

                if (!wasPinching) {

                    colorIndex =
                        (colorIndex + 1) %
                        colors.length;

                    currentColor =
                        colors[colorIndex];

                    updateColor();
                }

                wasPinching = true;

                lastPoint = null;
            }

            /* =================================
               DRAW
            ================================= */

            else {

                wasPinching = false;

                status.innerText =
                    "☝️ DRAWING";

                const point = {

                    x: hand[8].x,

                    y: hand[8].y
                };

                if (lastPoint) {

                    drawLine(
                        lastPoint,
                        point
                    );
                }

                lastPoint = point;
            }
        }

        /* =====================================
           NO HAND
        ====================================== */

        else {

            lastPoint = null;

            wasPinching = false;

            cursorCtx.clearRect(
                0,
                0,
                cursor.clientWidth,
                cursor.clientHeight
            );

            status.innerText =
                "Show your hand 👋";
        }
    }

    requestAnimationFrame(loop);
}

/* =====================================================
   START APP
===================================================== */

async function startApp() {

    try {

        await setupHandTracking();

        await startCamera();

        loop();

    }

    catch (error) {

        console.error(error);

        status.innerText =
            "❌ Camera permission required";
    }
}

startApp();
