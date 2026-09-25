
# HAND MAGIC

> what if your finger was literally the mouse?

**Hand Magic** is a small experimental web project that lets you draw in the air using your webcam and hand gestures.

No mouse.
No touchscreen.
Just your hand doing its thing.

## What can it do?

* Point with your **index finger** → draw
* Show your **open palm** → clear the canvas
* **Pinch** your thumb + index finger → switch colors
* Download your masterpiece as a PNG
* Works directly through your webcam
* Real-time hand tracking with MediaPipe

## Tech stack

* HTML
* CSS
* JavaScript
* MediaPipe Tasks Vision
* Canvas API
* Web Camera API

No React.
No Next.js.
No 47 npm packages for a button.

Just vanilla JS doing the work.

## Project structure

```text
hand-magic/
│
├── index.html
├── style.css
└── script.js
```

Pretty simple. We like simple.

## How to run

Clone the repo:

```bash
git clone https://github.com/your-username/hand-magic.git
```

Go into the project:

```bash
cd hand-magic
```

Then run it with any local server.

For example, with VS Code, install **Live Server** and open `index.html`.

Or:

```bash
npx serve .
```

Open the local URL, allow camera access, and you're locked in.

## How the magic works

The webcam captures your hand.

MediaPipe detects the hand and gives us landmark points for things like:

```text
thumb
index finger
middle finger
ring finger
pinky
```

We then use those points to figure out what you're doing.

Basically:

```text
hand detected
      ↓
find finger positions
      ↓
figure out the gesture
      ↓
do the thing
```

Point → draw.

Palm → delete everything.

Pinch → new color unlocked.

## The drawing

The drawing is made using the HTML Canvas API.

The line has a neon glow + white core, so it looks way cooler than a random line should.

Because the camera is mirrored, the X coordinate also has to be flipped before drawing.

Tiny detail.

Huge headache.

## Colors

Current color rotation:

```text
Pink
Cyan
Green
Yellow
Orange
White
```

Pinch to cycle through them.

## Browser requirements

You'll need:

* A webcam
* A modern browser
* Camera permission
* A local server when running locally

Chrome or Edge should be fine.

Also, camera access usually requires **HTTPS or localhost**.

So don't just double-click the HTML file and wonder why your camera is having an existential crisis.

## Why I made this

Honestly?

Because it sounded fun.

I wanted to mess around with:

* Computer vision
* Hand tracking
* Canvas
* Gesture detection
* Browser APIs

And somehow this turned into drawing neon lines with my hand.

Worth it.

## Future ideas

This project could absolutely get more unhinged.

Some ideas:

* Multiple hand support
* Eraser gesture
* Different brush styles
* Brush size controlled by hand distance
* Undo / redo
* Save drawings
* Background effects
* Particle trails
* More gestures
* Webcam filters
* Multiplayer drawing
* Hand-controlled UI
* Custom gesture system

Maybe even turn it into a whole little **hand-controlled creative playground**.

## Disclaimer

This is an experimental project made for learning and messing around with browser-based computer vision.

It is not actually magic.

Unfortunately.

## Made with

`HTML` + `CSS` + `JavaScript` + `MediaPipe` + questionable amounts of curiosity.

---

If you try it, make something cursed.

Then make something cool.

Then pretend the first one was intentional.
