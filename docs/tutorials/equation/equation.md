An equation is a set of terms and operators arranged to make some mathematical statement.

Consider the equation:

`a = b + c`

We will call:
* **terms**: `a`, `b`, `c`
* **operators**: `=`, `+`

An equation can have different **forms**. One form is above, but it can be rearranged into a different form:

`a - b = c`

If FigureOne, an equation is a {@link DiagramElementCollection} that manages the **terms** and **operators** which are {@link DiagramElementPrimitive}s. To layout the terms and operators into an equation, a form is defined. An equation can define many forms, and animation can be used to change forms.

As the equation and elements are all {@link DiagramElement}s, then they have all the same interactivety and animation abilities as shapes and text.


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

A grid is included in this javascript file to make it obvious how equations are aligned
```javascript
// index.js
const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});

// grid
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
    name: 'grid',
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

diagram.initialize();
```

### Quick Start

Let's start with a simple example equation. Similar to shapes and text, an options object is used to define an equation.

```javascript
// Two forms of an equation
diagram.addElement(
  // Add equation element
  {
    name: 'eqn',
    method: 'equation',
    options: {
      color: [1, 0, 0, 1],
      // Equation elements are the individual terms and operators in the equation
      elements: {
        a: 'a',
        b: 'b',
        c: 'c',
        v: { symbol: 'vinculum'},
        equals: ' = ',
        times: ' \u00D7 ',  // unicode times symbol
      },
      // An equation form is how those terms are arranged
      forms: {
        a: ['a', 'equals', 'b', 'times', 'c'],
        b: ['b', 'equals', { frac: ['a', 'vinculum', 'c'] }],
      },
    },
  },
);
const eqn = diagram.getElement('eqn')
eqn.showForm('a');
```

![](./tutorials/equation/simple.png)

An equation element can either be text or a **symbol**. A symbol might be a vinculum (line in the fraction) or an integral sign as two examples.

A **form** then arranges those elements. The simplest form (form `a` in the example above), is an array that lists the elements to show. In this case the elements will be laid our from left to right with their baselines aligned.

Objects with special keywords can be used for special layouts. Form `b` in the equation above creates a fraction using the `frac` key.

```javascript
eqn.showForm('b');
```

![](./tutorials/equation/fraction.png)

### Examples

