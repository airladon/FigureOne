An equation is a set of terms and operators arranged to make some mathematical statement.

Consider the equation:

`a = b + c`

Where the terms and operators are:
* terms: `a`, `b`, `c`
* operators: `=`, `+`

An equation can have different **forms**. One form is above, but it can be rearranged into a different form:

`a - b = c`

If FigureOne, an equation is a collection ({@link DiagramElementCollection}) of **terms** and **operators** (which are {@link DiagramElementPrimitive}s). A **form** defines the layout of terms and operators to create an equation. An equation can have many forms, and animation can be used to move between forms.

As the equation, terms and operators are all {@link DiagramElement}s, then they have all the same interactivety and animation abilities as shapes and text.


### <a id="equation-boilerplate"></a> Equation Boilerplate
To test examples within the 'Equation' section of the API reference create an `index.html` file and `index.js` file.

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

```javascript
// index.js
const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});
```

### Quick Start

First let's create an equation, with red as the default color:
```javascript
const equation = diagram.create.equation({ color: [1, 0, 0, 1] });
```

Next lets add the definitions for the terms and operators, or the equation elements. The keys of the object are unique identifiers that will be used in the equation forms to layout the elements appropriately. The values of the object are the text to display in the equation, or objects that define the text with additional options including formatting.
```javascript
equation.addElements({
  a: 'a',
  b: 'b',
  c: { text: 'c', color: [0, 0, 1, 1] },
  equals: ' = ',
  times: ' \u00D7 ',
});
```

The simplest form defintion is one that lays out the elements in a line. Here the array values are the unique identifiers (the keys) of the `addElements` object:

```javascript
equation.addForms({
  a: ['a', 'equals', 'b', 'times', 'c'],
});
```

Finally, we can add the equation to the diagram and show the form:

```javascript
diagram.add('equation', equation);
equation.showForm('b');
```

![](./tutorials/equation/simple.png)

### Symbols and Equation Functions

Mathematics has many special symbols that operate on terms, or annotate an equation. These symbols usually have a special layout relative to the terms they operate on.

FigureOne treats symbols like any other equation element, and uses {@link DiagramElementPrimitive}s to draw them. FigureOne then provides a series of functions that can layout terms around these symbols.

Let's take the equation from the last example, and show the form as a fraction.

Start by adding a vinculum symbol (with id 'v') to the equation's elements:

```javascript
equation.addElements({
  v: { symbol: 'vinculum'},
});
```

The `equation` is a {@link DiagramElementCollection} with an `eqn` property that contains equation specific information, such as forms and special layout functions, such as `frac`. Let's use this to add the form:

```javascript
const e = equation.eqn.functions;
equation.addForms({
  b: ['b', 'equals', e.frac(['a', 'v', 'c'])],
});
```

Finally, we can display the form:
```javascript
equation.showForm('b');
```

![](./tutorials/equation/fraction.png)

Combine all the steps above gives:
```javascript
const equation = diagram.create.equation({ color: [1, 0, 0, 1] });
equation.addElements({
  a: 'a',
  b: 'b',
  c: 'c',
  v: { symbol: 'vinculum'},
  equals: ' = ',
  times: ' \u00D7 ',
});

const e = equation.eqn.functions;
equation.addForms({
  a: ['a', 'equals', 'b', 'times', 'c'],
  b: ['b', 'equals', e.frac(['a', 'v', 'c'])],
});

diagram.add('equation', equation);
equation.showForm('a');
```

### Equation Animation

Equations can animate between forms. For example, to animate from form `a` to `b` in the equation above:

```javascript
equation.showForm('a');
equation.goToForm({
  form: 'b',
  animate: 'move',
  duration: 2,
});
```

![](./tutorials/equation/linear.gif)

The animation can be improved by moving the terms of the equation in curves instead of linearly. To do this we can use the object form definition that also defines translation animation properties:

```javascript
equation.addForms({
  bCurve: {
    content: ['b', 'equals', { frac: ['a', 'v', 'c'] }],
    animation: {
      translation: {
        a: { style: 'curve', direction: 'up', mag: 0.8 },
        b: { style: 'curve', direction: 'down', mag: 1.2 },
      },
    },
  },
});

equation.showForm('a');
equation.goToForm({
  form: 'bCurve',
  animate: 'move',
  duration: 2,
  delay: 1,
});
```

![](./tutorials/equation/curved.gif)


### Object Definition
Similar to shapes and text, the same equation above can be defined with an options object. For complicated equations, options objects can be used with code folding in an IDE to more easily read and navigate an equation definition. Also, because object form is JSON compatible, complex equations can be easily shared.

```javascript
diagram.addElement(
  {
    name: 'equation',
    method: 'equation',
    options: {
      color: [1, 0, 0, 1],
      font: { size: 0.2 },
      elements: {
        a: 'a',
        b: 'b',
        c: 'c',
        v: { symbol: 'vinculum'},
        equals: ' = ',
        times: ' \u00D7 ',  // unicode times symbol
      },
      forms: {
        a: ['a', 'equals', 'b', 'times', 'c'],
        b: ['b', 'equals', { frac: ['a', 'v', 'c'] }],
        bCurve: {
          content: ['b', 'equals', { frac: ['a', 'v', 'c'] }],
          animation: {
            translation: {
              a: { style: 'curve', direction: 'up', mag: 0.8 },
              b: { style: 'curve', direction: 'down', mag: 1.2 },
            },
          },
        },
      },
    },
  },
);
const equation = diagram.getElement('equation')
equation.showForm('a');
```

### Equation highlighting and interactivity

Just like any {@link DiagramElement}, an equation or its elements can be pulsed, touched or moved.

For example, an element can be pulsed:
```javascript
// Pulse the c element
equation.showForm('b')
equation._c.pulse({ scale: 2, yAlign: 'top' });
```

![](./tutorials/equation/pulse.gif)

An element can be touched:
```javascript
equation.showForm('b')
equation._c.makeTouchable();
equation._c.onClick = () => { console.log('c was touched') }
```

![](./tutorials/equation/touch.gif)

And the equation can be moved:
```javascript
equation.showForm('b')
equation.setMovable();
equation.touchInBoundingRect = 0.5;
```

![](./tutorials/equation/move.gif)

Here we are putting a buffer of 0.5 around the bounding rect of the equation to make it easy to touch and drag around.
