# Example 1 - Shape

Draws a filled in circle.

Open `index.html` in a browser to view example.

## Code
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

A *diagram* is an object that manages diagram elements (`DiagramElement`). By default it attaches to a HTML `div` element with id `figureOneContainer` - though a custom id can also be used and passed into:

```js
new Fig.Diagram({ htmlId: 'customId' });
```

In this case we are defining a *circle* diagram element using the `polygon` method with the parameters of `sides`, `radius`, `fill`, and `color`.

`diagram.initialize()` initializes the diagram and queues drawing for the next available frame. It only needs to be called once. If the digram is changed in the future and drawing needs to be queued again, then use:

```js
diagram.animateNextFrame()
```
