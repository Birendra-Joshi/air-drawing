# Hand Magic Canvas ✨

Draw in the air using just your hand and webcam — no mouse, no stylus. Powered by MediaPipe's real-time hand tracking running entirely in your browser.

## Features

- **Air drawing** — move your index finger to paint neon glowing lines
- **Gesture controls** — no buttons needed while drawing
- **Live hand cursor** — glowing ring tracks your fingertip in real time
- **6 neon colors** — cycle through with a pinch gesture
- **Download your art** — save your canvas as a PNG
- **Mirrored camera** — behaves like a selfie cam for natural movement
- **Responsive** — adapts stage aspect ratio for mobile and desktop

## Gestures

| Gesture | Action |
|---|---|
| ☝️ Index finger up | Draw |
| 🖐️ Open palm | Clear canvas |
| 🤏 Pinch (thumb + index) | Cycle to next color |

## Getting Started

1. Open `index.html` in a modern browser (Chrome, Edge, or Firefox recommended)
2. Allow camera access when prompted
3. Wait for the **"AI Ready ✨"** status message
4. Raise your index finger and start drawing in the air

No installation or build step required — everything runs client-side.

## Tech Stack

- **[MediaPipe Tasks Vision](https://developers.google.com/mediapipe)** (`HandLandmarker`) — real-time 21-point hand landmark detection
- **HTML5 Canvas API** — drawing and cursor rendering
- **Vanilla JavaScript** (ES modules) — no frameworks or build tools
- **WebRTC `getUserMedia`** — webcam access

## How It Works

1. The webcam feed is captured and mirrored (like a selfie camera)
2. Each video frame is passed to MediaPipe's `HandLandmarker`, running on GPU delegate
3. 21 hand landmarks are analyzed each frame to detect:
   - Finger extension (index/middle/ring/pinky up)
   - Open palm (all four fingers extended)
   - Pinch (distance between thumb tip and index tip)
4. Based on the detected gesture, the app draws, clears, or changes color
5. Lines are rendered with a dual-pass glow effect (colored outer glow + white core) for the neon look

## Browser Requirements

- Camera/webcam access
- WebGL/GPU support (for MediaPipe's GPU delegate)
- A reasonably modern browser with ES module support

## File Structure
