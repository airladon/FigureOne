
#### Figure Setup

To attach a figure to a HTML document:

* The HTML document needs a `div` element to which FigureOne will attach the drawing canvas to. By default FigureOne will look for a `div` with ID `'figureOneContainer'`. A custom ID can be specificed if desired or more than one figure in the document will be created.
* The FigureOne library `figureone.min.js` needs to be loaded either from a public CDN (like below), or from a local source
* A JavaScript file (in this case `index.js`) that creates the figure, and adds elements to it needs to be loaded and executed.

```html
<!-- index.html -->
<!doctype html>
<html>
<body>
    <div id="figureOneContainer" style="width: 1200px; height: 800px; background-color: white;">
    </div>
    <script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.12.2/figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>
```

In `index.js`, the figure can be created using the {@link OBJ_Figure} options object as a parameter to `Figure`. One of the most commonly used properties sets the figure's scene (the expanse of space to show).

```js
const figure = new Fig.Figure({
  scene: [0, 0, 6, 4],
});
```

For 2D figures, a simple array containing the left, bottom, right and top limits can be used. In three dimensions, the scene also defines from where the visible space is viewed (camera) and lighting (see <a href="##3d-shape-primitives">3D Shape Primitives</a> for a detailed explanation).


Now the figure is setup, shapes can be added to it.