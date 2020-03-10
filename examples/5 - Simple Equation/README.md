# Example 5 - Simple Equation

A simple equation including a fraction.

Open `index.html` in a browser to view example.

![](example.png)

## Code
`index.js`
```js
// Create diagram
const diagram = new Fig.Diagram();

// Add elements to the diagram
diagram.addElement(
  // Add equation element
  {
    name: 'eqn',
    method: 'equation',
    options: {
      color: [0.95, 0.95, 0.6, 1],
      position: [-0.2, 0],
      // Equation elements are the individual terms in the equation
      elements: {
        a: 'a',
        b: 'b',
        c: 'c',
        v: { symbol: 'vinculum'},
        equals: ' = ',
      },
      // An equation form is how those terms are arranged
      forms: {
        base: ['a', 'equals', { frac: ['b', 'vinculum', 'c'] }],
      },
    },
  },
);
// Show the equation form
diagram.getElement('eqn').showForm('base');
diagram.initialize();
```

## Explanation

Consider the equation:

```
a = b + c
```

We could also rearrange it to a different FORM:

```
a - b = c
```

These equations have a number of TERMS (a, b, c), an OPERATOR (+) and an equals sign (which we will call an OPERATOR).

Each of these TERMS and OPERATORS are diagram elements - specifically `DiagramElementPrimitive` objects that can behave in any way a normal `DiagramElement` can.

An `Equation` object is a `DiagramElementCollection` that groups all the equation's elements and can arrange them into different equation FORMS.

In this example, the *equation elements* (TERMS and OPERATORS) are first defined in `options.elements`, then a *form* is defined in `options.forms.base` .

Some operators are either not in unicode, or are more convient to drawn directly. In this example the *vinculum* of the fraction is a symbol.

Available symbols include:

* [vinculum](../../docs/README.md#EQN_VinculumSymbol)
* [radical](../../docs/README.md#EQN_RadicalSymbol)
* [integral](../../docs/README.md#EQN_IntegralSymbol)
* [sum](../../docs/README.md#EQN_SumSymbol)
* [product](../../docs/README.md#EQN_ProdSymbol)
* [bracket](../../docs/README.md#EQN_BracketSymbol)
* [square bracket](../../docs/README.md#EQN_SquareBracketSymbol)
* [angle bracket](../../docs/README.md#EQN_AngleBracketSymbol)
* [bar](../../docs/README.md#EQN_BarSymbol)
* [brace](../../docs/README.md#EQN_BraceSymbol)
* [arrow](../../docs/README.md#EQN_ArrowSymbol)
* [box](../../docs/README.md#EQN_BoxSymbol)
* [strike](../../docs/README.md#EQN_StrikeSymbol)