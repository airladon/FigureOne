# Example 1 - Shape

Draws a circle.

Download example and open `index.html` in a browser to view example.

![example](./example.png)

## Code
`index.html`
```html
<!doctype html>
<html>
<body>
    <div id="figureOneContainer" style="width: 500px; height: 500px; background-color: black;">
    </div>
    <script type="text/javascript" src='../../package/figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>
```

`index.js`
```js
// Create a diagram
const diagram = new Fig.Diagram();

// Add circle to diagram
diagram.addElement(
  {
    name: 'circle',
    method: 'polygon',
    options: {
      sides: 100,
      radius: 0.2,
      fill: true,
      color: [1, 0, 0, 1],
    },
  },
);

// Initialize diagram
diagram.initialize();

```
## Explanation

First a diagram is created.

```js
const diagram = new Fig.Diagram();
```

A *diagram* is an object that manages diagram elements (class `DiagramElement`). By default it attaches to a HTML `div` element with id `figureOneContainer`. A custom id can also be used by using a `htmlId` parameter when creating the diagram:

```js
const diagram = new Fig.Diagram({ htmlId: 'customId' });
```

Next, a diagram element in the shape of a circle is added.

```js
diagram.addElement(
  {
    name: 'circle',
    method: 'polygon',
    options: {
      sides: 100,
      radius: 0.2,
      fill: true,
      color: [1, 0, 0, 1],
    },
  },
);
```

We are defining a *circle* diagram element using the `polygon` method with the parameters of `sides`, `radius`, `fill`, and `color`.

```js
diagram.initialize();
```

`diagram.initialize()` initializes the diagram and queues drawing for the next available frame. It only needs to be called once, and is best called after all the initial diagram elements are defined.

If the digram is changed in the future and drawing needs to be drawing needs to be queued again, then use:

```js
diagram.animateNextFrame()
```
