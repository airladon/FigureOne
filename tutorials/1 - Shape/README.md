# Example 1 - Getting Started

Draw a circle.

Download `index.html` and `index.js` into the same folder and open `index.html` in a browser to view example.

![](./example.png)

## Code
`index.html`
```html
<!doctype html>
<html>
<body>
    <div id="figureOneContainer" style="width: 500px; height: 500px; background-color: black;">
    </div>
    <script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.3.3/figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>
```

`index.js`
```js
// Create a figure
const figure = new Fig.Figure();

// Add circle to figure
figure.addElement(
  {
    name: 'tri',
    method: 'polygon',
    options: {
      sides: 3,
      radius: 0.2,
      fill: true,
      color: [1, 0, 0, 1],
    },
  },
);

```
## Explanation

### HTML
In the HTML, a `div` is created that will house the figure.
```html
 <div id="figureOneContainer" style="width: 500px; height: 500px; background-color: black;">
 ```

Then the FigureOne library is loaded
```html
<script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.3.3/figureone.min.js'></script>
```
In this case, the library is loaded from a CDN, but you could also run it from a local copy of the figureone library as well. For instance, if you cloned this repository, and wanted to run the local version you could use the line:
```html
<script type="text/javascript" src='../../package/figureone.min.js'></script>
```

Finally, the javascript file which will use the FigureOne library to create the figure is executed.

```html
<script type="text/javascript" src='./index.js'></script>
```

All other examples have the same, or very similar HTML index file.

### Javascript

First a figure is created. `Fig` is the FigureOne library that is globally available to the script.

```js
const figure = new Fig.Figure();
```

A *figure* is an object that manages figure elements (class `FigureElement`). By default it attaches to a HTML `div` element with id `figureOneContainer`. A custom id can also be used by using a `htmlId` parameter when creating the figure:

```js
const figure = new Fig.Figure({ htmlId: 'customId' });
```

Next, a figure element in the shape of a circle is added.

```js
figure.addElement(
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

We are defining a *circle* figure element using the `polygon` method with the parameters of `sides`, `radius`, `fill`, and `color`.


If the digram is changed in the future and drawing needs to be drawing needs to be queued again, then use:

```js
figure.animateNextFrame()
```

<!-- [link here](../../docs/README.md#TypeEquationPhrase) -->