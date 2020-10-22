Simple text can be drawn one of three ways:

* Simple text - use for simple layout of letters, words or phrases with the same formating
* A line of text - convenient way to layout words and phrases with different formatting
* Multiple lines of text - convenient way to layout several lines of text with different formatting and justifications

### <a id="text-boilerplate"></a> Text Boilerplate
To test examples within the 'Drawing Text' sections of the API reference create an `index.html` file and `index.js` file.

All examples are snippets which can be appended to the end of the `index.js` file.

```html
<!-- index.html -->
<!doctype html>
<html>
<body>
    <div id="figureOneContainer" style="width: 800px; height: 800px; background-color: white;">
    </div>
    <script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.2.3/figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>
```

A grid is included in this javascript file to make it obvious how text is aligned and justified
```javascript
// index.js
const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});
diagram.addElements([
  {
    name: 'origin',
    method: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1]
    },
  },
  {
    name: 'gridMinor',
    method: 'grid',
    options: {
      bounds: [-3, -3, 6, 6],
      yStep: 0.1,
      xStep: 0.1,
      color: [0.7, 0.7, 0.7, 1],
      line: { width: 0.001 },
    },
  },
  {
    name: 'gridMajor',
    method: 'grid',
    options: {
      bounds: [-3, -3, 6, 6],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.8, 0.8, 0.8, 1],
      line: { width: 0.004 }
    },
  },
]);
```

### Quick Start

Let's start by creating a {@link DiagramElementPrimitive} element that writes 'hello world' to the diagram.

```javascript
diagram.addElement(
  {
    name: 't',
    method: 'text',
    options: {
      text: 'hello world',
      xAlign: 'center',
      yAlign: 'middle',
    },
  },
);
```

The text has been horizontally aligned to its center, and vertically aligned to its middle around its default location of `(0, 0)`.
![](./assets1/text_intro.png)

As this is a {@link DiagramElementPrimitive}, transforms can be applied to it to as with any shape, and it can be touched and moved

```javascript
diagram.addElement(
  {
    name: 't',
    method: 'text',
    options: {
      text: 'hello world',
      xAlign: 'center',
      yAlign: 'middle',
      transform: [['s', 1, 2]],
    },
  },
);
```