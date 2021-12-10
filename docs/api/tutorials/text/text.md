FigureOne has several different ways to typeset and render text.

## Text Typesetting

Text can either be type-set as:
* Plain text - single font, simple text - {@link OBJ_Text}
* Formatted text - multi-font, multi-line text - {@link OBJ_FormattedText}
* Equation text - {@link Equation}

This guide will cover plain and formatted text. <a href="#equations"> Thissection</a> is then dedicated to equations.

### Plain Text

The most simple way to create text is with the `'text'` primitive (with options {@link OBJ_Text}).

<p style="text-align: center"><img src="./tutorials/text/text.png"></p>

```javascript
figure.add(
  {
    make: 'text',
    text: 'Hello World',
    xAlign: 'center',
    yAlign: 'middle',
  },
);
```

The text primitive can be used to create text with a number of horizontal alignment, vertical alignment, and font options.

```javascript
figure.add(
  {
    make: 'text',
    text: 'Hello World',
    xAlign: 'right',
    yAlign: 'top',
    font: { family: 'Times New Roman', style: 'italic' },
    color: [0, 0, 1, 1],
  },
);
```

<p style="text-align: center"><img src="./tutorials/text/textoptions.png"></p>


The text primitive can also be used to create many different strings of text at different locations. All strings will share the same alignment and font options.


```javascript
figure.add(
  {
    make: 'text',
    text: ['North', 'West', 'South', 'East'],
    location: [[0, 0.5], [-1, 0], [0, -0.5], [1, 0]],
    xAlign: 'center',
    yAlign: 'middle',
    color: [0, 0, 1, 1],
  },
);
```

<p style="text-align: center"><img src="./tutorials/text/textmulti.png"></p>

To update text, use the `setText` method on the created element. The below example updates the text everytime the text is touched.

```javascript
let counter = 1;
figure.add({
  make: 'text',
  text: '0',
  touch: {
    onClick: (e) => {
      e.setText(`${counter}`);
      counter += 1;
    },
  },
});
```

<p style="text-align: center"><img src="./tutorials/text/texttouch.gif"></p>

### Formatted Text

Formatted text is created with the `ftext` make definition and supports:
* Multiple lines
* Multiple fonts
* Multiple touch definitions
* Embedded equations

Multiple lines of text can be created by defining an array of strings as the text. Each element in the array is a new line.

```js
figure.add({
  make: 'ftext',
  text: ['First line', 'This is line two', 'Third line'],
});
```
<p style="text-align: center"><img src="./tutorials/text/ftextlines.png"></p>

Each line can have individual formatting by using a line definition object instead of a string.

```js
figure.add({
  make: 'ftext',
  text: [
    'First line',
    'This is line two',
    { text: 'Third line', font: { style: 'italic', color: [0, 0, 1, 1] } },
  ],
});
```
<p style="text-align: center"><img src="./tutorials/text/ftextlinesdef.png"></p>

Strings withing lines can be formatted by surrounding the string with `'|'` characters and then defining the modification with the `modifiers` property. Any string within `'|'` characters will become a unique identifier that is referenced in the `modifiers` property. If more than one strings share the same unique identifier, then the will all be modified the same.

```js
figure.add({
  make: 'ftext',
  text: [
    'First |line|',
    'This is |line| two',
    'Third |line2|',
  ],
  modifiers: {
    line: { font: { color: [0, 0, 1, 1] } },
    line2: { text: 'line', font: { color: [0, 0.8, 0, 1] } },
  },
});
```
<p style="text-align: center"><img src="./tutorials/text/ftextmods.png"></p>


Modifiers can also be used to define specific portions of text that are interactive.

```js
igure.add({
  make: 'ftext',
  text: [
    'First |line|',
    'This is |line2| two',
    'Third |line3|',
  ],
  modifiers: {
    line: {
      font: { color: [0, 0, 1, 1] },
      onClick: () => console.log('line 1'),
    },
    line2: {
      text: 'line',
      font: { color: [0, 0.8, 0, 1] },
      onClick: () => console.log('line 2'),
    },
    line3: {
      text: 'line',
      font: { color: [0, 0.8, 0.8, 1] },
      onClick: () => console.log('line 3'),
    },
  },
});
```
<p style="text-align: center"><img src="./tutorials/text/ftexttouch.gif"></p>


Modifiers can also be used to embed equations into the text. An equation phrase ({@link TypeEquationPhrase}) is used to define the equation, and if necessary, the `elements` property can be used to customize elements within the equation.

```js
figure.add({
  make: 'ftext',
  text: [
    'Equation |e| in text',
  ],
  xAlign: 'center',
  modifiers: {
    e: {
      eqn: { frac: ['1', 'vinculum', { root: ['rad', '2'] }] },
      offset: [0, 0.1],
    },
  },
  elements: {
    rad: { symbol: 'radical', color: [0, 0, 1, 1] },
  },
});
```

<p style="text-align: center"><img src="./tutorials/text/ftexteqn.png"></p>

If formatted text is not sufficent, then use {@link Equation} for full typesetting customization.

## Text Rendering



There are three main ways to create text in FigureOne:

* {@link OBJ_Text} plain text
* {@link OBJ_FormattedText} formatted, multi line text
* {@link Equation} equation text

Creating text within an equation is a 



FigureOne provides text layout for both simple text, and lines of text with rich formatting.

### Quick Start - `text`

Let's start by creating a {@link FigureElementPrimitive} element that writes 'hello world' to the figure.



```javascript
figure.add(
  {
    name: 'simpleText',
    make: 'text',
    text: 'hello world',
    xAlign: 'center',
    yAlign: 'middle',
  },
);
```

The text has been horizontally aligned to its center, and vertically aligned to its middle around its default location of `(0, 0)`.

As this is a {@link FigureElementPrimitive}, transforms can be applied to it, and it can be touched and moved. For instance, the example below will rotate the text when it is dragged with a touch from the user.

```javascript
figure.add(
  {
    name: 'spinner',
    make: 'text',
    text: 'hello world',
    xAlign: 'center',
    yAlign: 'middle',
    touchBorder: 0.5,   // add a touch buffer of 0.5 around the text
    mods: {
      isMovable: true,
      move: { type: 'rotation' },
    },
  },
);
```

The same `text` method can be used to create text at different locations.

<p style="text-align: center"><img src="./tutorials/text/compass.png"></p>

```javascript
figure.add(
  {
    name: 'compass',
    make: 'text',
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
    make: 'text.line',
    text: [
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
    make: 'text.lines',
    text: [
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
);
```

`text.lines` also allows for multiple lines of text to be laid out and justified.

<p style="text-align: center"><img src="./tutorials/text/text-lines.png"></p>

```javascript
figure.add(
  {
    name: 't',
    make: 'text.lines',
    text: [
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
);
```

For more properties of `text.lines` see {@link OBJ_TextLines}.
