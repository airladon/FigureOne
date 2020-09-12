const diagram = new Fig.Diagram({ limits: [-1, -1, 2, 2 ]});

// const f1 = {
//   family: 'Times New Roman',
//   color: [1, 0, 0, 1],
//   style: 'normal',
//   size: 0.2,
// };
// const f2 = {
//   family: 'Times New Roman',
//   color: [0, 1, 0, 1],
//   style: 'italic',
//   size: 0.2,
//   weight: 'bold',
// }
// const f3 = {
//   family: 'Times New Roman',
//   color: [0, 1, 0, 1],
//   style: 'italic',
//   size: 0.08,
//   weight: 'bold',
// }
// console.log(new Fig.Transform().scale(2, 2).translate(0.5, 0).matrix())
// console.log(new Fig.Transform().translate(0.5, 0).scale(2, 2).matrix())
// diagram.addElements([
//   {
//     name: 'tester',
//     method: 'text',
//     options: {
//       text: [
//         'hello',
//         ['MM', { font: f2 }],
//         ['2', { offset: [0, -0.02], font: f3 }],
//         ['2', { offset: [-0.02, 0.1], font: f3 }],
//         ' M',
//         ['dg', { font: { weight: 'bolder' }, location: [0, -0.2] }],
//       ],
//       font: f1,
//       position: [-0.5, -0.5],
//       xAlign: 'left',
//       yAlign: 'baseline',
//       color: [0, 0, 1, 1],
//     },
//   },
//   // {
//   //   name: 'angle',
//   //   method: 'angle',
//   //   options: {
//   //     angle: 1,
//   //     curve: {
//   //       width: 0.01,
//   //       radius: 0.5,
//   //       sides: 400,
//   //     },
//   //     label: {
//   //       // text: '60º'
//   //       text: null,
//   //       radius: 0.45,
//   //     },
//   //     sides: {
//   //       length: 1,
//   //     },
//   //     color: [0, 1, 0, 1],
//   //   },
//   // },
//   {
//     name: 'a',
//     method: 'polygon',
//     options: {
//       radius: 0.01,
//       width: 0.01,
//       sides: 10,
//       // transform: new Fig.Transform().scale(2, 2).translate(0.5, 0),
//     },
//   },
//   {
//     name: 'grid',
//     method: 'grid',
//     options: {
//       bounds: [-1, -1, 2, 2],
//       yStep: 0.1,
//       xStep: 0.1,
//       color: [0.2, 0.2, 0.2, 1],
//       width: 0.002,
//     },
//   },
//   {
//     name: 'gridMajor',
//     method: 'grid',
//     options: {
//       bounds: [-1, -1, 2, 2],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.5, 0.5, 0.5, 1],
//       width: 0.002,
//     },
//   },
//   {
//     name: 'eqn',
//     method: 'equation',
//     options: {
//       color: [0.95, 0.95, 0.6, 1],
//       position: [0.2, 0.2],
//       // font: { size: 0.8 },
//       // transform: [['s', 2], ['r', 1], ['t', [0, 0]]],
//       // scale: 2,
//       elements: {
//         v: { symbol: 'vinculum', color: [1, 0, 0, 1] },
//         arrow: {
//           symbol: 'arrow',
//           lineWidth: 0.01,
//           arrowWidth: 0.03,
//           arrowHeight: 0.04,
//           draw: 'dynamic',
//           direction: 'right',
//         },
//         equals: ' = ',
//         times: ' \u00D7 ', 
//         c: { color: [1, 0, 0, 1], font: { style: 'normal', size: 0.3 } },
//         _2_: { color: [0, 1, 0, 1] },
//       },

//       // Align all forms to the 'equals' diagram element
//       formDefaults: {
//         alignment: {
//           fixTo: 'equals',
//           xAlign: 'center',
//           yAlign: 'middle',
//         },
//         animation: {
//           translation: {
//             c: { style: 'curved', direction: 'up', mag: 0.5 },
//           },
//         },
//         elementMods: {
//           b: { color: [1, 0, 0, 1] }
//         },
//       },

//       phrases: {
//         'abc': ['a', 'b', 'c', '  ', '=', '  ', 'hello'],
//         p1: ['a', 'b'],
//         p2: { frac: ['p1', 'v', 'c'] }
//       },
//       // Define two different forms of the equation
//       forms: {
//         't': ['abc', 'equals'],
//         'a': ['a', 'equals', { frac: ['b', 'v', 'c'] }],
//         'b': {
//           content: ['b', 'equals', 'a', 'times', 'c'],
//           elementMods: {
//             b: { color: [0.5, 1, 0.5, 1] },
//           },
//           // Define how the 'c' element will move to this form
//           animation: {
//             translation: {
//               c: { style: 'curved', direction: 'up', mag: 1 },
//             },
//             // duration: 0.5,
//           },
//           scale: 2,
//         },
//         'c': {
//           content: ['c', 'times', 'a', 'equals', 'b'],
//           elementMods: {
//             b: { color: [0, 1, 1, 1] },
//           },
//           // Define how the 'c' element will move to this form
//           animation: {
//             translation: {
//               c: { style: 'curved', direction: 'down', mag: 0.5 },
//             },
//             // duration: 0.5,
//           },
//           fromForm: {
//             a: {
//               animation: {
//                 translation: {
//                   c: { style: 'curved', direction: 'down', mag: 5 },
//                 },
//               },
//             },
//           },
//         },
//         d: [{ bar: ['abc', 'arrow', 'top']}],
//         e: [{ bar: [['_2', 'a', '3_4_3'], 'arrow', 'top']}],
//         f: { frac: ['a', 'v', 'b'] },
//         g: ['_2', 'x'],
//         h: { frac: ['a', { v2: { symbol: 'vinculum', color: [0, 0, 1, 1] }}, '_2'] },
//       },
//     },
//   },
// ]);
// diagram.initialize();

// // diagram.elements._tester.animations.new()
// //   .translation({ target: [-0.5, 0], duration: 1 })
// //   .start();
// const eqn = diagram.getElement('eqn');

// // Show the equation form
// eqn.showForm('d');
// eqn.goToForm({ form: 'e', duration: 2, animate: 'move', delay: 1, });
// // diagram.animateNextFrame();

// const a = diagram.getElement('eqn.a');
// const b = diagram.getElement('eqn.b');
// const c = diagram.getElement('eqn.c');
// // Animate to the next form
// const goTo = (form) => {
//   console.log(form)
//   eqn.goToForm({
//     form, delay: 0.2, duration: 1.5, animate: 'move',
//   });
//   diagram.animateNextFrame();
// }

// a.makeTouchable();
// b.makeTouchable();
// c.makeTouchable();

// a.onClick = goTo.bind(eqn, 'a');
// b.onClick = goTo.bind(eqn, 'b');
// c.onClick = goTo.bind(eqn, 'c');
// // Queue drawing on the next animation frame
// diagram.animateNextFrame();

// // diagram.elements._tester.animations.new()
// //   .translation({ target: [-0.5, -0.5 ], duration: 2 })
// //   .start();

// diagram.elements._tester.onClick = () => { console.log(1) };
// diagram.elements._tester.makeTouchable();
// // diagram.elements._tester.setColor([0, 1, 1, 1]);



diagram.addElements([
  {
    name: 'grid',
    method: 'grid',
    options: {
      bounds: [-1, -1, 2, 2],
      yStep: 0.1,
      xStep: 0.1,
      color: [0.2, 0.2, 0.2, 1],
      width: 0.002,
    },
  },
  {
    name: 'gridMajor',
    method: 'grid',
    options: {
      bounds: [-1, -1, 2, 2],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.5, 0.5, 0.5, 1],
      width: 0.002,
    },
  },
  {
    name: 'a',
    method: 'polygon',
    options: {
      radius: 0.008,
      // width: 0.08,
      fill: true,
      sides: 20,
      // transform: new Fig.Transform().scale(2, 2).translate(0.5, 0),
    },
  },
]);
diagram.initialize();

eqn = new Fig.Equation(diagram.shapes, {
  color: [0.95, 0, 0, 1],            // default color of the equation
  // Default font for the equation. Note, there is no `style` option for
  // setting `italic` or `normal`. This can be set on an individual
  // element basis, otherwise it will automatically choose:
  //   - `italics`: if the element text has any letters in it
  //   - `normal`: if not (just numbers or symbols like '=')
  // None, some or all of the options can be used
  font: {
    family: 'Times New Roman',
    weight: '200',      // Use CSS weight definition strings
    size: 0.2,          // element space font height
  },
  // Scale of the equation - scale scales the sizes of the text as well
  // as the spaces between them in the layout. In comparison,
  // `font.size` will only change the size of the font. Set `font.size`
  // to be particular with the font size, and then scale for layout.
  // Note, scale will not impact dynamic symbol line widths.
  scale: 1,
  // equation transform
  transform: [['s', 1], ['r', 0], ['t', [0, 0]]],
  // equation position - will override translation in transform
  position: [0, 0],
  // Elements can be defined inline in `forms` or defined here. Define
  // here is there are lots of customizations to the element that will
  // make the form definition cluttered
  elements: {
    // Needed if no options change, but better off just doing an inline
    // defintion in the form
    a: 'a',
    // If using fancy characters or want to embed space in the element,
    // then can define key/text map directly,
    equals: ' = ',
    b: {                       // Full element definition
      text: ' b ',             // Text to show
      font: {                  // Customize the font
        style: 'normal',
        family: 'Helvetica',
        weight: 'bold',         // Use CSS weight definitions
        size: '0.2',            // Size is in element space units
      },
      family: 'Helvetica',
      color: [1, 0, 0, 1],      // Element color
      style: 'normal',          // `style`, `weight` and `size` can
      weight: 'bold',           //   also be defined outside of the
      size: '0.2',              //   font obj definition for cleanliness
      mods: {                   // Element mods
        isTouchable: true,
      },
    },
    // By default, element text is the same as key text
    c: { style: 'normal', color: [0, 1, 0, 1] },
    // Underscores can be used to define the same text with different
    // keys, so they can be moved independently. When keys are converted
    // to text, only the string after a leading underscore, and before
    // the first underscore (that's not a leading underscore) is used.
    // The next six elements will all have the same text, but will be
    // independant elements
    d: { color: [1, 0, 0, 1] },
    _d: { color: [1, 0, 0, 1] },
    d_: { color: [1, 0, 0, 1] },
    d_1: { color: [1, 0, 0, 1] },
    d_2: { color: [1, 0, 0, 1] },
    d_1_1: { color: [1, 0, 0, 1] },
    // Symbols can be defined
    v: { symbol: 'vinculum' },
    leftB: {
      symbol: 'brace',
      side: 'left',
      lineWidth: 0.01,
      sides: 10,
      width: 0.04,
      tipWidth: 0.01,
      draw: 'dynamic',
    },
    rightB: { symbol: 'brace', side: 'right' },
  },
  // Default form attributes
  formDefaults: {
    alignment: {
      // fixtTo a point in elementSpace, or an equation element.
      // The equation will then be aligned around this point or element.
      // In this case, we want the different forms to be alighned around
      // the `equals` element - so as we animate between forms the
      // `equals` element will stay in place.
      fixTo: ['equals'],
      xAlign: 'center',
      yAlign: 'middle',
    },
    // Default way to animate between forms
    animation: {
      duration: 1,      // Use `null` for velocity
      translation: {    // How elements translate during animation
        c: { style: 'curved', direction: 'up', mag: 0.5 },
      },
    },
    // What mods to apply to the individual elements
    // These mods will be set every time the form is shown (as
    // opposed to element definition mods above which are set
    // only on element creation).
    // Element mods can also be set on each form individually.
    elementMods: {
      b: { color: [1, 0, 0, 1] },   // define each element
      c: {
        isTouchable: true,
        color: [0, 0, 1, 1],
      },
    },
  },
  // Phrases are combinations of elements that can be used in forms to
  // make the forms simpler. This is especially useful for frequently
  // reused phrases within a form.
  // Each phrase must have a unique key compared to all the equation
  // elements
  phrases: {
    ab: ['a', 'b'],
    f: { frac: ['a', 'v', 'b'] },
    cf: ['c', 'f'],                // Phrases can use other phrases
    // Similar to forms, phrases can incorporate inline element
    // definitions
    '2x': ['_2', 'x'],
  },

  // An equation form defines how a collection of elements is laid out
  forms: {
    // A form can be just a single element
    simpleElement: 'a',
    // A form can be just a single phrase
    simplePhrase: '2x',
    // Three elements in a line
    simpleSequence: ['a', 'b', 'c'],
    // An array entry can be an object definition
    inlineFrac: [{ frac: ['a', 'v', '_2'] }, 'c'],
    // Simple elements that require few mods can be defined inline. In
    // this case `hello` is an element not defined in `addElements`, and
    // will be added as an element here, with text `hello` and all other
    // properties as default. Note, the unique id of this inline
    // definition is `hello`, and so it will be the same element in
    // other forms that use `hello`.
    inlineElementDefinition: ['a', 'equals', 'hello'],
    // If need multiple different elements with the same text as
    // an inline definition, then use underscores. This will produce
    // and equation `2a2` where the first and last `2` are unique
    // elements that can be animated independently
    inlineMultiDefinition: ['_2_1', 'a', '_2_2'],
    // Equals can be used as an object key, so it is a valid inline definition
    inlineEqualsElement: ['ab', '=', 'c'],
    // Elements can be fully defined inline as well, but be careful with
    // this as if just `m` is used in another form definition, only the
    // first forms definition will be stored in the `m` identifier.
    inlineFullDefinition: ['_a', { m: { style: 'normal' } }],
    // Symbols can be defined inline. `vinculum` is a special word and
    // cannot be used as keys for any elements. Use this for forms where
    // only one vinculum is required.
    inlineSymbol: { frac: ['a', 'vinculum', 'b'] },
    // Symbols can be defined inline with unique identifiers. In this
    // case we can refer to this vinculum as v1 in other locations.
    // Be careful to make sure this form is defined before other forms
    // that just use `v1`. Use this when more than one vinculum is in a
    // form, and/or you want to animate to another form and insure the
    // correct vinculum changes size to become the vinculum of the next
    // form
    inlineSymbolWithId: { frac: ['a', 'v1_vinculum', 'b'] },
    // Symbols can also be defined fully inline as objects, including
    // any additional properties. Usually would make sense to define
    // this in `addElements` to make forms less cluttered.
    inlineSymbolObject: {
      frac: [
        'a',
        { v2: { symbol: 'vinculum', color: [0, 0, 1, 1] } },
        'b',
      ],
    },
    // Spaces can be used directly - these are not elements and do not
    // need to be unique. Use singular or multiple spaces in a string.
    spaces: ['a', ' ', 'b', '   ', 'c'],
    // Forms can be defined as objects where the content key is the form
    // definition, and other keys are options
    objectDefinition: {
      content: 'c',
      alignment: {
        xAlign: 'right',
        yAlign: 'baseline',
      },
    },
    // Another example
    objectDef2: {
      content: 'c',
      elementMods: {
        c: { color: [0.5, 1, 0, 1] },
      },
    },
    // Full form object definition - the content key is required, but
    // all other keys are optional.
    fullObject: {
      content: ['b', 'c', 'd'],
      scale: 1.2,
      // Element mods specific to this form
      elementMods: {
        b: { color: [0, 1, 0, 1] },
      },
      // Descriptions are used in equation navigators
      description: '|Form| 2 |description|',
      // Text modifiers of the description
      modifiers: {
        Form: Fig.tools.html.highlight([1, 0, 0, 0]),
      },
      // A form can have its own animation definition
      animation: {
        duration: 4,     // use null for velocity
        translation: {
          b: ['curved', 'up', 0.3],
          c: { style: 'curved', direction: 'down', mag: 1 },
        },
      },
      // A form can have it's own alignment definition
      alignment: {
        fixTo: 'b',
        xAlign: 'center',
        yAlign: 'baseline',
      },
      // The animation attributes and elementMods may be different if
      // animating from specific forms.
      fromForm: {
        objectDef2: {
          animation: {
            duration: 2,
            translation: {
              c: { style: 'linear' },
            },
          },
          elementMods: {
            b: { color: [0.5, 0, 1, 1] },
            c: { color: [0.5, 0.5, 1, 1] },
          },
        },
      },
    },
  },
  // Form Series are used by equation navigators to know the order of
  // forms to progress through. If only a single series is needed,
  // then simply define an array of strings, where each string is the
  // form name. If more than one series are needed, then use an object
  // where each key will identify a particular series
  formSeries: {
    a: ['simpleElement', 'simplePhrase', 'inlineSymbolWithId'],
    b: ['inlineEqualsElement', 'simpleSequence'],
  },
});

diagram.elements.add('eqn', eqn);
// eqn.showForm('fullObject')
// console.log(diagram.elements._eqn)
// diagram.setFirstTransform();
eqn.showForm('objectDef2');
diagram.setFirstTransform();
console.log(eqn._c.getPosition());
eqn.goToForm({ form: 'fullObject', duration: 4, animate: 'move' });
// console.log(diagram.elements._eqn._v.getBoundingRect('diagram'))

// diagram.elements = new Fig.DiagramElementCollection();
// diagram.addElement({
//   name: 'eqn1',
//   method: 'equation',
//   options: {
//     elements: {
//       v: { symbol: 'vinculum' },
//     },
//     formDefaults: {
//       alignment: {
//         xAlign: 'center',
//         yAlign: 'middle',
//       },
//     },
//     forms: {
//       inlineFrac: [{ frac: ['a', 'v', '_2'] }, 'c'],
//     },
//   },
// });
// diagram.elements._eqn1.showForm('inlineFrac');
// diagram.setFirstTransform();
// console.log(diagram.elements)