# FigureOne

Draw, animate and interact with shapes, text, plots and equations.


This JavaScript library can be used for making *animated* and/or *interactive* content for the web including:
* Diagrams
* Equations
* Plots
* Presentations or slide shows
* Video-like experiences

> Note: for the video-like experiences, FigureOne creates a custom vector video format which is interactive, resolution independent, and a fraction of the size of an normal *audio* track. This results in very low bandwidth video. For example, 4 minutes of animated content might result in a video track 80KB in size. See below for some examples of interactive videos. More information on this can be found in the [API Reference](https://airladon.github.io/FigureOne/api/#interactive-video).

FigureOne can also be used to create animations (like equation animations) that can then be screen captured and merged into a standard video file.


See the [Tutorials](./docs/tutorials), [API Reference](https://airladon.github.io/FigureOne/api/) and [Examples](./docs/examples) and you'll be making beautiful, interactive figures in no time.

The examples are also hosted (and thus can be directly interacted with) on this repository's GitHub Pages site [here](https://airladon.github.io/FigureOne/).

![](docs/summary.gif)

The library used to draw interactive slides at <a href="https://www.thisiget.com">thisiget.com</a>.

## Getting Started

Load the FigureOne library into your HTML file:

```html
<script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.8.0/figureone.min.js'></script>
```

Create a `div` element to attach the figure to:
```html
<div id="figureOneContainer" style="width: 500px; height: 500px; background-color: white;"></div>
```

Then in javascript, create a figure and a shape within it:

```js
const figure = new Fig.Figure();

// Create the shape
const tri = figure.add({
  make: 'triangle',
  color: [1, 0, 0, 1],
});

// Animate the shape
tri.animations.new()
  .position(0.5, 0)
  .rotation(Math.PI)
  .position(0, 0)
  .start();

```

And you will see:

![](./docs/example.gif)

The [Tutorials](./docs/tutorials) build on this and introduce FigureOne's concepts and features in simplified examples. The [API Reference](https://airladon.github.io/FigureOne/api/) describes these concepts in more depth as well as provides detailed API documentation. Consider reviewing these first before diving into the code of the examples below.

## Examples

### **[Interactive Angle](./docs/examples/Interactive%20Angle)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Interactive%20Angle/index.html).

![](docs/examples/Interactive%20Angle/example.gif)

### **[Equation Animation](./docs/examples/Equation%20Animation)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Equation%20Animation/index.html).

![](docs/examples/Equation%20Animation/example.gif)

### **[Pythagorean Equation Animation](./docs/examples/Pythagorean%20Theorem)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Pythagorean%20Theorem/index.html).

![](docs/examples/Pythagorean%20Theorem/example.gif)

### **[Create a Sine Wave](./docs/examples/Sine%20Wave)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Sine%20Wave/index.html).

![](docs/examples/Sine%20Wave/example.gif)

### **[Total Angle of a Polygon](./docs/examples/Total%20Angle%20of%20a%20Polygon)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Total%20Angle%20of%20a%20Polygon/index.html).

![](docs/examples/Total%20Angle%20of%20a%20Polygon/example.gif)

### **[Sine Limit](./docs/examples/Sine%20Limit)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Sine%20Limit/index.html).

![](docs/examples/Sine%20Limit/example.gif)

### **[Traveling Wave 01 - Shifting Equations](./docs/examples/Traveling%20Wave%2001%20-%20Shifting%20Equations)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Traveling%20Wave%2001%20-%20Shifting%20Equations/index.html).

![](docs/examples/Traveling%20Wave%2001%20-%20Shifting%20Equations/example.gif)

### **[Traveling Wave 02 - Sine Wave](./docs/examples/Traveling%20Wave%2002%20-%20Sine%20Waves)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Traveling%20Wave%2002%20-%20Sine%20Waves/index.html).

![](docs/examples/Traveling%20Wave%2002%20-%20Sine%20Waves/example.gif)

### **[Traveling Wave 03 - Velocity Frequency Wavelength](./docs/examples/Traveling%20Wave%2003%20-%20Velocity%20Frequency%20Wavelength)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Traveling%20Wave%2003%20-%20Velocity%20Frequency%20Wavelength/index.html).

![](docs/examples/Traveling%20Wave%2003%20-%20Velocity%20Frequency%20Wavelength/example1.gif)

![](docs/examples/Traveling%20Wave%2003%20-%20Velocity%20Frequency%20Wavelength/example2.gif)

### **[Holiday Equation](./docs/examples/Holiday%20Equation)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Holiday%20Equation/index.html).

![](docs/examples/Holiday%20Equation/example.gif)


## **[Interactive Video - Tiling](docs/examples/Interactive%20Video%20-%20Tiling)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Interactive%20Video%20-%20Tiling/index.html).

![](docs/examples/Interactive%20Video%20-%20Tiling/example.gif)

## **[Interactive Video - Trig 1 - Trig Functions](docs/examples/Interactive%20Video%20-%20Trig%201%20-%20Trig%20Functions)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Interactive%20Video%20-%20Trig%201%20-%20Trig%20Functions/index.html).

![](docs/examples/Interactive%20Video%20-%20Trig%201%20-%20Trig%20Functions/example.gif)


## **[Interactive Video - Trig 2 - Names](docs/examples/Interactive%20Video%20-%20Trig%202%20-%20Names)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Interactive%20Video%20-%20Trig%202%20-%20Names/index.html).

![](docs/examples/Interactive%20Video%20-%20Trig%202%20-%20Names/example.gif)

## **[Interactive Video - Trig 3 - Relationships](docs/examples/Interactive%20Video%20-%20Trig%203%20-%20Relationships)**

See this example hosted [here](https://airladon.github.io/FigureOne/examples/Interactive%20Video%20-%20Trig%203%20-%20Relationships/index.html).

![](docs/examples/Interactive%20Video%20-%20Trig%203%20-%20Relationships/example.gif)


## NPM Package

On projects that are bundled with tools such as Webpack, it can be useful to use the FigureOne NPM package:

`npm install figureone`

Then within your project you can:

```js
import Fig from 'figureone';

const figure = new Fig.Figure();
```

Flow typed files are included in the package for type checking in the editor.

