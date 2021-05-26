# Tutorial 20 - Morph

Draw a triangle.

Download `index.html` and `index.js` into the same folder and open `index.html` in a browser to view example.

![](./example.png)

## Code


```js
// index.js

const figure = new Fig.Figure();

// Helper functions that can create point fields
const { lineToPoints, getPolygonCorners } = Fig.tools.morph;

// Helper function to make a range of values
const { range } = Fig.tools.math;

// Number of points - each point will define a square of six vertices
const n = 100;

// Generate a line of points along a sinc function
const sinc = (xIn, a, b) => {
  const x = xIn === 0 ? 0.00001 : xIn;
  return a * Math.sin(b * x) / (b * x);
};
const [sincPoints] = lineToPoints({
  line: range(-0.8, 0.8, 0.02).map(x => [x, sinc(x, 0.5, 20)]),
  maxPoints: n,
  pointSize: 0.01,
});

// Generate a line of points along a square
const [squarePoints] = lineToPoints({
  line: [[0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]],
  maxPoints: n,
  pointSize: 0.01,
  close: true,
});

// Generate a line of points along a circle
const [circlePoints] = lineToPoints({
  line: getPolygonCorners({ radius: 0.5, sides: 50, rotation: Math.PI / 4 }),
  maxPoints: n,
  pointSize: 0.01,
  close: true,
});


// Add the morpher figure element primitive, and define the points it should
// morph between
const morpher = figure.add({
  make: 'morph',
  names: ['sincPoints', 'square', 'circle'],
  points: [sincPoints, squarePoints, circlePoints],
  color: [1, 0, 0, 1],
});

// Animate morph
morpher.animations.new()
  .delay(1)
  .morph({ start: 'sinc', target: 'square', duration: 5 })
  .morph({ start: 'square', target: 'circle', duration: 2 })
  .start();
```
## Explanation

For best performance, figure elements should have their vertices defined once at initialization, and then transformed as a group on a per frame basis.

There are times however, when it is desirable to change the vertices relative to each other. For a small to medium number of vertices, the vertices can be changed without noticeable performance change - usually with a FigureElement's `update` or `updatePoints` method. However, for shapes with many vertices that are changing on a per frame basis, this may not be sufficiently performant on lower end clients.

Two possible scenarios for wanting a shape's vertices to change relative to each other (the shape to morph) are:
* A specific animation desire
* Unpredictable user interaction defines a shape's form

The FigureElementPrimitiveMorph element can address the first animation case.

### Initialization

On initialization, a number of different point arrays are defined and loaded. The different point arrays define different positions of the same shape vertices. 

In this example, we are defining three different sets of 100 points



### Javascript

First a figure is created. `Fig` is the FigureOne library and is globally available after loading the script.

```js
const figure = new Fig.Figure();
```

A [Figure](https://airladon.github.io/FigureOne/api/#figure) is an object that manages figure elements ([FigureElement](https://airladon.github.io/FigureOne/api/#figureelement)). By default it attaches to a HTML `div` element with id `figureOneContainer`. A custom id can also be used by using a `htmlId` parameter when creating the figure:

```js
const figure = new Fig.Figure({ htmlId: 'customId' });
```

Next, a figure element in the shape of a triangle is added.

```js
figure.add(
  {
    make: 'triangle',
    width: 1,
    height: 1,
    color: [1, 0, 0, 1],
  },
);

```

We are defining a *triangle* figure element using the `triangle` method with the parameters of `width`, `height`, and `color`.

The element is defined in a javascript object. There are many possible parameters that can define a triangle, but only the ones that need customization need to be used.

The triangle's options object is [here](https://airladon.github.io/FigureOne/api/#obj_triangle).
