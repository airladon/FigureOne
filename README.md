# FigureOne

The library used to draw interactive diagrams at <a href="https://www.thisiget.com">thisiget.com</a>.


It can:

* Create diagram elements including shapes and text
* Animation
* Interactivity - users can touch and move diagram elements
* Equation rendering, animation and interaction

The same API uses WebGL for shape rendering, Canvas 2D for text rendering and can create and manipulate HTML elements (for images, text and CSS animations) if desired.


## Simple Shape Example

`index.html`:
```html
<!doctype html>
<html>
<body>
    <div id="figureOneContainer" style="width: 500px; height: 500px; background-color: black;">
    </div>
    <script type="text/javascript" src='./figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>
```

`index.js`:
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

## Examples

Examples can be downloaded and run by opening their respective `index.html` files in a browser.

* **[Simple shape](https://github.com/airladon/FigureOne/tree/master/examples/1%20-%20Shape)** - Simple creation and drawing of diagram element (same as above)
* **Collections** - Example showing collections of diagram elements
* **Interactive Shape** - Shape that can be dragged and bounces around after being let go
* **Animation** - Simple animation example
* **Simple Equation** - Create a simple fraction
* **Advanced Equation** - Equation including integral, sum of, brackets and annotations

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
