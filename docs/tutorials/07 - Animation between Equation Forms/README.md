# Example 7 - Animation between Equation Forms

Animating between two forms of an equation.

Open `index.html` in a browser to view example.

![](example.gif)

## Code
`index.js`
```js
const figure = new Fig.Figure({ color: [1, 0, 0, 1] });
const eqn = figure.add(
  {
    method: 'equation',
    elements: {
      v: { symbol: 'vinculum' },
      equals: ' = ',
      times: ' \u00D7 ',
      c: { color: [0, 0, 1, 1] },
    },

    // Align all forms to the 'equals' figure element
    formDefaults: { alignment: { fixTo: 'equals' } },

    // Define two different forms of the equation
    forms: {
      1: ['a', 'equals', { frac: ['b', 'v', 'c'] }],
      2: {
        content: ['c', 'times', 'a', 'equals', 'b'],
        // Define how the 'c' element will move to this form
        translation: {
          c: { style: 'curved', direction: 'down', mag: 0.5 },
        },
      },
    },
  },
);

// Show the equation form
eqn.showForm('1');

// // Animate to the next form
eqn.goToForm({
  form: '2',
  delay: 1,
  duration: 1.5,
  animate: 'move',
});
```

## Explanation

In this example we are defining two different forms of the same equation.
```js
        1: ['a', 'equals', { frac: ['b', 'v', 'c'] }],
```

```js
        2: {
          content: ['c', 'times', 'a', 'equals', 'b'],
          // Define how the 'c' element will move to this form
          translation: {
            c: { style: 'curved', direction: 'down', mag: 0.5 },
          },
        },
```

The first form is defined in a shorthand *Array* definition. The second form is defined in a longer hand *Object* definition as we wish to include the form parameter `translation`.

This parameter defines how elements will move when translated in an animation. In this case we want the element `c` to follow a `curved` path, in the `down` direction where the curve has a magnitude of `0.5`.

We can then show the first form of the equation:
```js
eqn.showForm('1');
```

And animate to the second form:
```js
eqn.goToForm({
  name: '2',
  delay: 1,
  duration: 1.5,
  animate: 'move',
});
```


## Additional Notes

Equations also have specific animation steps for moving between forms. Therefore form animation can also be part of a larger animation sequence. For instance to pulse the 'c' before changing forms you can:

```js
eqn.animations.new()
  .pulse({ element: eqn.getElement('c'), duration: 1 })
  .goToForm({ target: '2', duration: 1, animate: 'move' })
  .start();
```

![](example2.gif)