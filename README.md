# FigureOne

Draw, animate and interact with shapes, text, plots and equations.

The library used to draw interactive slides at <a href="https://www.thisiget.com">thisiget.com</a>.

See the [Tutorials](https://github.com/airladon/FigureOne/tree/master/docs/tutorials), [API Reference](https://airladon.github.io/FigureOne/api/) and [Examples](https://github.com/airladon/FigureOne/tree/master/docs/examples) and you'll be making beautiful, interactive figures in no time.

The examples are also hosted on this repository's GitHub Pages site [here](https://airladon.github.io/FigureOne/).

![](./docs/examples/Sine%20Limit/example.gif)

## Getting Started

Load the FigureOne library into your HTML file:

```html
<script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.4.0/figureone.min.js'></script>
```

Create a `div` element to attach the figure to:
```html
<div id="figureOneContainer" style="width: 500px; height: 500px; background-color: white;"></div>
```

Then in javascript, create a figure and a shape within it:

```js
const figure = new Fig.Figure();

// Create the shape
figure.add(
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

// Animate the shape
figure.getElement('tri').animations.new()
  .position({ target: [1, 0], duration: 1 })
  .rotation({ target: Math.PI, duration: 2 })
  .position({ target: [0, 0], duration: 1 })
  .start();
```

And you will see:

![](./docs/example.gif)


## Tutorials

The tutorials introduce how to use FigureOne and many of the main concepts.

### **[Simple shape](https://github.com/airladon/FigureOne/tree/master/docs/tutorials/01%20-%20Shape)** - Simple creation and drawing of figure element

![](docs/tutorials/01%20-%20Shape/example.png)

### **[Collections](https://github.com/airladon/FigureOne/tree/master/docs/tutorials/02%20-%20Collections)** - Collections of figure elements all move together

![](docs/tutorials/02%20-%20Collections/example.gif)

### **[Interactive Shape](https://github.com/airladon/FigureOne/tree/master/docs/tutorials/03%20-%20Interactive%20Shape)** - A shape that can be moved by the user

![](docs/tutorials/03%20-%20Interactive%20Shape/example.gif)

### **[Animation](https://github.com/airladon/FigureOne/tree/master/docs/tutorials/04%20-%20Animation)** - Animating a shape

![](docs/tutorials/04%20-%20Animation/example.gif)

### **[Simple Equation](https://github.com/airladon/FigureOne/tree/master/docs/tutorials/05%20-%20Simple%20Equation)** - Render a simple fraction

![](docs/tutorials/05%20-%20Simple%20Equation/example.png)

### **[Advanced Equation](https://github.com/airladon/FigureOne/tree/master/docs/tutorials/06%20-%20Advanced%20Equation)** - Render an equation with an integral, sum operator, subscripts and color

![](docs/tutorials/06%20-%20Advanced%20Equation/example.png)

### **[Equation Animation](https://github.com/airladon/FigureOne/tree/master/docs/tutorials/07%20-%20Animation%20between%20Equation%20Forms)** - Animation between two forms of an equation

![](docs/tutorials/07%20-%20Animation%20between%20Equation%20Forms/example.gif)

### **[Texture](https://github.com/airladon/FigureOne/tree/master/docs/tutorials/08%20-%20Texture)** - Using a texture instead of a color

![](docs/tutorials/08%20-%20Texture/example.png)

### **[Plot](https://github.com/airladon/FigureOne/tree/master/docs/tutorials/09%20-%20Plot)** - Automatically generated plot

![](docs/tutorials/09%20-%20Plot/example.png)

### **[Customized Plot](https://github.com/airladon/FigureOne/tree/master/docs/tutorials/10%20-%20Customized%20Plot)** - Plot with title, axis, trace and legend customizations

![](docs/tutorials/10%20-%20Customized%20Plot/example.png)


## Examples

### **[Interactive Angle](https://github.com/airladon/FigureOne/tree/master/docs/examples/Interactive%20Angle)**

![](docs/examples/Interactive%20Angle/example.gif)

### **[Pythagorean Equation Animation](https://github.com/airladon/FigureOne/tree/master/docs/examples/Pythagorean%20Theorem)**

![](docs/examples/Pythagorean%20Theorem/example.gif)

### **[Create a Sine Wave](https://github.com/airladon/FigureOne/tree/master/docs/examples/Sine%20Wave)**

![](docs/examples/Sine%20Wave/example.gif)

### **[Total Angle of a Polygon](https://github.com/airladon/FigureOne/tree/master/docs/examples/Total%20Angle%20of%20a%20Polygon)**

![](docs/examples/Total%20Angle%20of%20a%20Polygon/example.gif)

### **[Traveling Wave 01 - Shifting Equations](https://github.com/airladon/FigureOne/tree/master/docs/examples/Total%20Angle%20of%20a%20Polygon)**

![](docs/examples/Traveling%20Wave%2001%20-%20Shifting%20Equations/example.gif)

### **[Traveling Wave 02 - Sine Wave](https://github.com/airladon/FigureOne/tree/master/docs/examples/Traveling%20Wave%2002%20-%20Sine%20Wave)**

![](docs/examples/Traveling%20Wave%2001%20-%20Shifting%20Equations/example.gif)

### **[Holiday Equation](https://github.com/airladon/FigureOne/tree/master/docs/examples/Holiday%20Equation)**

![](docs/examples/Holiday%20Equation/example.gif)


## NPM Package

On projects that are bundled with tools such as Webpack, it can be useful to use the FigureOne NPM package:

`npm install figureone`

Then within your project you can:

```js
import Fig from 'figureone';

const figure = new Fig.Figure();
```

Flow typed files are included in the package for type checking in the editor.

