# FigureOne

Draw, animate and make interactive shapes, text, plots and equations.

The library used to draw interactive diagrams at <a href="https://www.thisiget.com">thisiget.com</a>.

This library draws shapes in WebGL, and text with Canvas 2D - and therefore requires HTML5 support.

## Getting Started

Load the FigureOne library into your HTML file:

```html
<script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.3.1/figureone.min.js'></script>
```

Create a `div` element to attach the diagram to:
```html
<div id="figureOneContainer" style="width: 500px; height: 500px; background-color: black;"></div>
```

Then in javascript, create a diagram and a shape within it:

```js
const diagram = new Fig.Diagram();

diagram.addElement(
  {
    name: 'circle',
    method: 'polygon',
    options: {
      sides: 100,
      radius: 0.2,
      color: [1, 0, 0, 1],
    },
  },
);
```

Source code of this and other examples is provided:

**[Simple shape](https://github.com/airladon/FigureOne/tree/master/examples/1%20-%20Shape)** - Simple creation and drawing of diagram element

![](examples/1%20-%20Shape/example.png)

**[Collections](https://github.com/airladon/FigureOne/tree/master/examples/2%20-%20Collections)** - Example showing collections of diagram elements

![](examples/2%20-%20Collections/example.png)

**[Interactive Shape](https://github.com/airladon/FigureOne/tree/master/examples/3%20-%20Interactive%20Shape)** - A shape that can be moved by the user

![](examples/3%20-%20Interactive%20Shape/example.gif)

**[Animation](https://github.com/airladon/FigureOne/tree/master/examples/4%20-%20Animation)** - Animating a shape

![](examples/4%20-%20Animation/example.gif)

**[Simple Equation](https://github.com/airladon/FigureOne/tree/master/examples/5%20-%20Simple%20Equation)** - Render a simple fraction

![](examples/5%20-%20Simple%20Equation/example.png)

**[Advanced Equation](https://github.com/airladon/FigureOne/tree/master/examples/6%20-%20Advanced%20Equation)** - Render an equation with an integral, sum operator, subscripts and color

![](examples/6%20-%20Advanced%20Equation/example.png)

**[Equation Animation](https://github.com/airladon/FigureOne/tree/master/examples/7%20-%20Animation%20between%20Equation%20Forms)** - Animation between two forms of an equation

![](examples/7%20-%20Animation%20between%20Equation%20Forms/example.gif)

Documentation is a work in progress.

## NPM Package

On projects that are bundled with tools such as Webpack, it can be useful to use the FigureOne NPM package:

`npm install figureone`

Then within your project you can:

```js
import Fig from 'figureone';

const diagram = new Fig.Diagram();
```

Flow typed files are included in the package for type checking in the editor.

