# Example 5 - Simple Equation

## Example

A simple equation including a fraction.

Open `index.html` in a browser to view example.

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

Some operators are either not in unicode, or are more convient to draw as symbols. In this example the *vinculum* of the fraction is a symbol.

Other symbols include