FigureOne provides text layout for both simple text, and lines of text with rich formatting.


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
    <script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.7.0/figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>
```

A grid is included in this javascript file to make it obvious how text is aligned and justified
```javascript
// index.js
const figure = new Fig.Figure({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });
figure.add([
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

### Quick Start - `text`

Let's start by creating a {@link FigureElementPrimitive} element that writes 'hello world' to the figure.

<p style="text-align: center"><img src="./tutorials/text/text.png"></p>

```javascript
figure.add(
  {
    name: 'simpleText',
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

As this is a {@link FigureElementPrimitive}, transforms can be applied to it, and it can be touched and moved. For instance, the example below will rotate the text when it is dragged with a touch from the user.

```javascript
figure.add(
  {
    name: 'spinner',
    method: 'text',
    options: {
      text: 'hello world',
      xAlign: 'center',
      yAlign: 'middle',
      touchBorder: 0.5,   // add a touch buffer of 0.5 around the text
    },
    mods: {
      isTouchable: true,
      isMovable: true,
      move: { type: 'rotation' },
    }
  },
);
figure.setTouchable();
```

The same `text` method can be used to create text at different locations.

<p style="text-align: center"><img src="./tutorials/text/compass.png"></p>

```javascript
figure.add(
  {
    name: 'compass',
    method: 'text',
    options: {
      text: [
        {
          text: 'North',
          location: [0, 0.5],
        },
        {
          text: 'East',
          location: [0.5, 0],
        },
        {
          text: 'South',
          location: [0, -0.5],
        },
        {
          text: 'West',
          location: [-0.5, 0],
        },
      ],
      xAlign: 'center',
      yAlign: 'middle',
    },
  },
);
```

See {@link OBJ_Text} to apply custom formatting to each element in the `text`, but note that all the text in a sinle element will have the same formatting.

### Arranging text in a line - `text.line`

Often a phrase of text will want to apply specific formatting to a word or part of the phrase.

The above example can be used to do this, but it is cumbersome as the locations of part of the phrase with different formatting will need to be experimented with.

Alternately, `text.line` can be used as it will automatically layout the text elements from left to right based on their calculated widths.

<p style="text-align: center"><img src="./tutorials/text/text-line.png"></p>

```javascript
figure.add(
  {
    name: 'formattedLine',
    method: 'text.line',
    options: {
      line: [
        'hello ',
        {
          text: 'world',
          font: { color: [0, 0, 1, 1], style: 'italic' },
        },
        ' it is great to meet you',
      ],
      xAlign: 'center',
      yAlign: 'middle',
    },
  },
);
```

See {@link OBJ_TextLine} for more options including how to superscript and subscript text, or move it out of the line layout completely.


### Rich lines - `text.lines`

`text.line` keeps the text and formatting definitions next to each other in the API.

When using more text, it is sometimes useful to split these in the API to make it easier to read the text.

`text.lines` uses the special character `'|'` to surround parts of a phrase that needs to me modified with custom formating. The modifier definitions are then provided later in the interface.

The same example above can be done with `text.lines`:

```javascript
figure.add(
  {
    name: 'formattedLine',
    method: 'text.lines',
    options: {
      lines: [
        'hello |world| it is great to see you',
      ],
      modifiers: {
        world: {
          font: { color: [0, 0, 1, 1], style: 'italic' },
        }
      },
      xAlign: 'center',
      yAlign: 'middle',
    },
  },
);
figure.setTouchable();
```

`text.lines` also allows for multiple lines of text to be laid out and justified.

<p style="text-align: center"><img src="./tutorials/text/text-lines.png"></p>

```javascript
figure.add(
  {
    name: 't',
    method: 'text.lines',
    options: {
      lines: [
        'This is the |first| line',
        'This is the |second| line - and it is long',
        'This is the |third| line'
      ],
      modifiers: {
        first: {
          font: { color: [0, 0, 1, 1], style: 'italic' },
        },
        second: {
          font: { color: [0, 0.6, 0.6, 1], style: 'italic' },
        },
        third: {
          font: { color: [1, 0, 1, 1], style: 'italic' },
        },
      },
      xAlign: 'center',
      yAlign: 'middle',
      justify: 'center',
    },
  },
);
```

For more properties of `text.lines` see {@link OBJ_TextLines}.
