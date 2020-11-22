# FigureOne

The library used to draw interactive diagrams at <a href="https://www.thisiget.com">thisiget.com</a>.

It can:

* Create diagram elements including shapes, textures and text
* Animate diagram elements
* Allow users to interact with diagram elements (like touching and moving elements)
* Render equations, animate and make them interactive
* Plot graphs

One API creates and operates on WebGL shapes, Canvas 2D text, and custom HTML elements, making them all similarly behaving diagram elements.

## Getting Started

Load the Figureone library into your HTML:

```html
<script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.3.0/figureone.min.js'></script>
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
      fill: true,
      color: [1, 0, 0, 1],
    },
  },
);

diagram.initialize();
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

# Development

Docker containers are used to create dev and build environments for FigureOne development.

All linting, testing and building can be performed in containers.

After installing docker on the host system, from the repository root start a dev enviroment:

`./start_env dev`

Inside this container, you can:

* `npm run lint` - to run lint checking
* `flow` - to run type checking
* `jest` - to run unit tests
* `webpack` - to build dev packaging
* `webpack --env.mode=prod` - to build production packaging

When it is time to deploy the build to NPM, exit the container and from the repository root run:

`./build.sh deploy`

This will start a container, run all linting and tests, and then build and deploy the package.

## Update Packages

To update all packages

```
npx npm-check-updates -u
npm install
```

## Jest debugger

```
npm run jest-debug <jest options>
```

In chrome go to:
```
chrome://inspect
```

and click on link
```
Open dedicated DevTools for Node
```

