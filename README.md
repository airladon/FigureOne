# FigureOne

Interactive diagrams for js.

Used in www.thisiget.com.

Documentation to come...

# Interactive shape example

index.html:
```
<!doctype html>
<html>
<body>
    <div id="figureOneContainer" style="width: 500px; height: 500px; background-color: black">
    </div>
    <script type="text/javascript" src='./figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>
```

index.js:
```
const diagram = new Fig.Diagram({ htmlId: 'figureOneContainer' })

diagram.addElements(diagram.elements, [
  {
    name: 'circle',
    method: 'polygon',
    options: {
      sides: 4,
      radius: 0.2,
      fill: true,
      color: [1, 0, 0, 1],
    },
    mods: {
      isMovable: true,
      isTouchable: true,
      move: {
        canBeMovedAfterLosingTouch: true,
        boundary: 'diagram',
      },
    },
  },
]);
diagram.elements.hasTouchableElements = true;
diagram.setFirstTransform();
diagram.animateNextFrame();
```

# Interactive linting and testing

`./start_env dev` starts a dev container. Use commands: `flow`, `jest`, `npm lint` or `npm css` to run various linters and tests.



# Building

`./build.sh` to lint, test and package.

`./build.sh skip-test` to package only (skips linting and testing).

`./build.sh deploy` to lint, test, package and deploy to npm. Will only deploy if version number in containers/build/package.json is not the same as the current latest version of FigureOne on npm.


# Local integration with a project

To integrate into a project, can either install via npm:
`npm install figureone`

or use build folder directly in project structure.