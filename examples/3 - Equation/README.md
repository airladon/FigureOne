# Example 3 - Equation

Simple equation with a fraction.

Consider the equation:

```
a = b + c
```

This equation has a number of TERMS (a, b, c), an OPERATOR (+) and an equals sign (which we will call an operator).

We could also rearrange it to a different FORM:

```
a - b = c
```

An equation object is a `DiagramElementCollection` (a diagram element which is a collection of elements) that groups all the equations TERMS and OPERATORS as `DiagramElementPrimitives` (diagram elements that are drawn to the screen).

As each TERM and OPERATOR of an equation is a diagram element, these must first be defined (in the `options.elements` definition).

The equation FORM (`options.forms`) defines the order and layout of the elements.

Open `index.html` in a browser to view example.