# FigureOne

Draw, animate and interact with shapes, text, plots and equations.

The library used to draw interactive figures at <a href="https://www.thisiget.com">thisiget.com</a>.

This library uses WebGL and therefore requires HTML5 support.

## Getting Started

Load the FigureOne library into your HTML file:

```html
<script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.3.4/figureone.min.js'></script>
```

Create a `div` element to attach the figure to:
```html
<div id="figureOneContainer" style="width: 500px; height: 500px; background-color: white;"></div>
```

Then in javascript, create a figure and a shape within it:

```js
const figure = new Fig.Figure();

figure.addElement(
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

Source files for this can be found in the **[first tutorial](https://github.com/airladon/FigureOne/tree/master/tutorials/1%20-%20Shape)**.

Then, check out the remaining **[Tutorials](https://github.com/airladon/FigureOne/tree/master/tutorials)**, **[API Reference](https://airladon.github.io/FigureOne/.)** and **[Examples](https://github.com/airladon/FigureOne/tree/master/tutorials)** and you'll be making beautiful, interactive figures in no time.

## Selection of Examples
**[Pythagorean Equation Animation](https://github.com/airladon/FigureOne/tree/master/examples/Pythagorean%20Theorem)**

![](examples/Pythagorean%20Theorem/example.gif)


## NPM Package

On projects that are bundled with tools such as Webpack, it can be useful to use the FigureOne NPM package:

`npm install figureone`

Then within your project you can:

```js
import Fig from 'figureone';

const figure = new Fig.Figure();
```

Flow typed files are included in the package for type checking in the editor.

