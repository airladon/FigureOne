# FigureOne

Draw, animate and make interactive shapes, text, plots and equations.

The library used to draw interactive diagrams at <a href="https://www.thisiget.com">thisiget.com</a>.

This library draws shapes in WebGL, and text with Canvas 2D - and therefore requires HTML5 support.

## Getting Started

Load the FigureOne library into your HTML file:

```html
<script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.3.2/figureone.min.js'></script>
```

Create a `div` element to attach the diagram to:
```html
<div id="figureOneContainer" style="width: 500px; height: 500px; background-color: white;"></div>
```

Then in javascript, create a diagram and a shape within it:

```js
const diagram = new Fig.Diagram();

diagram.addElement(
  {
    name: 'tri',
    method: 'triangle',
    options: {
      width: 1,
      height: 1,
      color: [1, 0, 0, 1],
    },
  },
);
```

And you will see:

![](tutorials/1%20-%20Shape/example.png)

Check out the **[Tutorials](https://github.com/airladon/FigureOne/tree/docs1/tutorials** for a quick primer on how FigureOne works, and the API reference and before you know it:

Animated proof of the pythagorean theorm:

![](examples/Pythagorean%20Theorem/example.gif)


## NPM Package

On projects that are bundled with tools such as Webpack, it can be useful to use the FigureOne NPM package:

`npm install figureone`

Then within your project you can:

```js
import Fig from 'figureone';

const diagram = new Fig.Diagram();
```

Flow typed files are included in the package for type checking in the editor.

