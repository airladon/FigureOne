# Tutorial 19 - Performance Optimization

Optimizing performance for complex figures.

Download `index.html` and `index.js` into the same folder and open `index.html` in a browser to view example.

![](./example.gif)

## Performance

When a figure is first created, FigureOne needs to:
  * Calculate the verticies of all shapes being created
  * Load the vertices into GPU memory (with WebGL)

To draw to the screen, FigureOne needs to:
  * Iterate through all the visible elements and update their state (position, color etc) - but only if they are animating or being moved (*setupDraw* step)
  * Interate through all visible elements and apply the most recent element color and transform (chained with any parent transforms) to the vertices already in memory (*draw* step)

FigureOne only draws to the screen when:
  * the figure is first loaded
  * when a figure element is being animated, is being moved or is changed in some way
  * when the browser window is resized

If a figure element is being changed, then at the end of each draw, FigureOne will determine whether its elements are still changing, and if they are request a notification from the browser for the next screen refresh. When that notification occurs, FigureOne will draw again and the cycle repeats.

Browsers will ideally refresh their screen between 30 and 60 times per second. To refresh 30 times a second means FigureOne needs to complete processing a draw within 1/30s (33ms) for  smooth animations.

As FigureOne only draws when the screen is being refreshed, then it will never draw at a faster frame rate than the screen. However, if the draw time is longer than the period between frames, then the frame rate will drop below the browser's desired rate.

As such, figures with many elements, moving in complex ways running on old, low-end clients may see slower frame rates.

This will then lead to several questions:
  1) What is an acceptable frame rate?
  2) What are the target client devices?
  3) How can a figure be optimized to increase performance, and what are the trade-offs?

The first two questions need to be answered by the developer. My targets are:

  1) 30 frams per second (fps) is target, but it really depends on the speed of the animation. Usually 20fps looks sufficiently good to me, and for slow animations even 10-15 fps can look fine
  2) As I mostly use FigureOne for educational content, I want older, low-end chrome books or low-mid end mobile devices to have acceptable performance

The third question is the reason for this tutorial.

## Test Devices

The devices used to test the examples (in order of lowest performance) in this tutorial are:

* 2016 Asus C202S Chromebook (using an Intel Celeron N3060) - this was considered a decent quality, but low end (low performance) chromebook in 2016. The frame rate numbers of this device generally align with the desktop version of Chrome's developer device simulation for a low-end mobile.
* 2014 Ipad Air 2
* 2019 Iphone 11

## Baseline Code

As a basline, we will draw 100 squares to a screen. The squares will continually move freely and bounce off the figure boundaries, with no deceleration.

```js
/* globals Fig */
const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [1, 1, 0.9, 1],
});
const { rand } = Fig.tools.math;

// Add n polygons, each of which has a random size, start position and
// velocity. They move freely and bounce off the figure boundaries without
// deceleration.
const n = 100;
for (let i = 0; i < n; i += 1) {
  const r = rand(0.1, 0.2);
  const e = figure.add({
    make: 'polygon',
    radius: r,
    color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
    rotation: Math.PI / 4,
    transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
    mods: {
      move: {
        freely: { deceleration: 0, bounceLoss: 0 },
        bounds: 'figure',
      },
      state: {
        movement: { velocity: [['t', rand(-0.3, 0.3), rand(-0.3, 0.3)]] },cor
      },
    },
  });
  e.startMovingFreely();
}

// Add a frame rate annotation to the figure showing average and worst case
// frame rate in last 10 frames
figure.addFrameRate(10);
```

FigureOne can display animation metrics by using the `addFrameRate` method.

![](addframerate.png)

It will show the average and worst case values of the frame rate, the total time it takes to process a draw, and then the times for setupDraw and draw.

In this case, the statistics is for the last 10 frames.

### Performance

The average frame rates on the test devices are (for n=100 squares):
* 2016 Chromebook: 8 fps ()
* 2014 iPad: 29 fps
* 2019 iPhone: 52 fps

Visually, the iPad and iPhone look good, but the Chromebook is not smooth.

For 30 < n < 35, the Chromebook can consistently achieve 20 fps.

### Nuance

This DOES NOT mean the Chromebook can only support 35 elements.

For instance, if we change n to 1, and then add another 150 static elements to the screen, the Chromebook can support 20 fps.

```js
const n = 1;
for (let i = 0; i < n; i += 1) {
  const r = rand(0.1, 0.2);
  const e = figure.add({
    make: 'polygon',
    radius: r,
    color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
    rotation: Math.PI / 4,
    transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
    mods: {
      move: {
        freely: { deceleration: 0, bounceLoss: 0 },
        bounds: 'figure',
      },
      state: {
        movement: { velocity: [['t', rand(-0.3, 0.3), rand(-0.3, 0.3)]] },
      },
    },
  });
  e.startMovingFreely();
}

for (let i = 0; i < 150; i += 1) {
  const r = rand(0.1, 0.2);
  figure.add({
    make: 'polygon',
    radius: r,
    color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
    transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
  });
}
```

It also DOES NOT mean the Chromebook can only support 35 simple elements (squares are combosed of two triangles).

If instead we make 33 independently moving elements each with 100 sides (effectively creating 3300 triangles), we can also achieve 20 fps.

```js
const n = 33;
for (let i = 0; i < n; i += 1) {
  const r = rand(0.1, 0.2);
  const e = figure.add({
    make: 'polygon',
    radius: r,
    sides: 100,
    color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
    rotation: Math.PI / 4,
    transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
    mods: {
      move: {
        freely: { deceleration: 0, bounceLoss: 0 },
        bounds: 'figure',
      },
      state: {
        movement: { velocity: [['t', rand(-0.3, 0.3), rand(-0.3, 0.3)]] },
      },
    },
  });
  e.startMovingFreely();
}
```

### Optimization

Some aspects of FigureOne are optimized for ease of use over performance.





## Explanation


Devices: 
* Chrome Desktop: "Low-End Mobile" simulation
* 2016 Asus C202S Chromebook
* 2014 iPad Air 2
* 2019 IPhone 11

Test Cases:
* X Independantly moving elements
* X children of a collection N levels deep
   - When a different element is animating and all are redrawn
* Context2D text
* Dragging a finger
