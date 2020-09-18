const diagram = new Fig.Diagram({ limits: [-1, -1, 2, 2 ]});

const f1 = {
  family: 'Times New Roman',
  color: [1, 0, 0, 1],
  style: 'normal',
  size: 0.2,
};
const f2 = {
  family: 'Times New Roman',
  color: [0, 1, 0, 1],
  style: 'italic',
  size: 0.2,
  weight: 'bold',
}
const f3 = {
  family: 'Times New Roman',
  color: [0, 1, 0, 1],
  style: 'italic',
  size: 0.08,
  weight: 'bold',
}
// console.log(new Fig.Transform().scale(2, 2).translate(0.5, 0).matrix())
// console.log(new Fig.Transform().translate(0.5, 0).scale(2, 2).matrix())
diagram.addElements([
  // {
  //   name: 'tester',
  //   method: 'shapes.lines',
  //   // options: {
  //   //   text: [
  //   //     'hello',
  //   //     ['MM', { font: f2 }],
  //   //     ['2', { offset: [0, -0.02], font: f3 }],
  //   //     ['2', { offset: [-0.02, 0.1], font: f3 }],
  //   //     ' M',
  //   //     ['dg', { font: { weight: 'bolder' }, location: [0, -0.2] }],
  //   //   ],
  //   //   font: f1,
  //   //   position: [-0.5, -0.5],
  //   //   xAlign: 'left',
  //   //   yAlign: 'baseline',
  //   //   color: [0, 0, 1, 1],
  //   // },
  //   options: {
  //     font: {
  //       family: 'Times New Roman',
  //       color: [1, 0, 0, 1],
  //       style: 'normal',
  //       size: 0.1,
  //       weight: '200',
  //     },
  //     // justification: 'center',
  //     lines: [
  //       'This is a |formatted| string',
  //       [
  //         {
  //           font: {},
  //           justification: 'left',
  //           location: [],
  //           lineSpace: 0.2,
  //         },
  //         'This is a |sup| string',
  //       ],
  //       'This is a simple string'
  //     ],
  //     modifiers: {
  //       formatted: {
  //         text: 'asdfasdf',
  //         location: [0, 0],
  //         offset: [0, 0],
  //         // font: {},
  //       },
  //     },
  //     // lines: [
  //     //   {
  //     //     text: 'asdf',
  //     //     justification: 'right'
  //     //   },
  //     //   'this is standard',
  //     //   ['This is a ', { location: [0, -0.2] }],
  //     //   [
  //     //     'This is a ',
  //     //     ['formated', { font: { style: 'italic', color: [1, 0, 1, 1], weight: 'bolder' } }],
  //     //     ' string.',
  //     //   ],
  //     // ],
  //     // lineSpace: 0.2,
  //     // justification: 'left',
  //     // text: [
  //     //   'This is a ',
  //     //   ['formated', { font: { style: 'italic', color: [1, 0, 1, 1], weight: 'bolder' } }],
  //     //   ' string.',
  //     //   ['This is a ', { location: [0, -0.2] }],
  //     //   ['superscript', { offset: [0, 0.05], font: { size: 0.05 } }],
  //     //   'and',
  //     //   ['below string', { offset: [-0.02, -0.06], font: { size: 0.05 } }],
  //     //   [' example on a new line.', { location: -2 }],
  //     // ],
  //     position: [-0.8, 0],
  //     xAlign: 'left',
  //     yAlign: 'middle',
  //     color: [0.5, 0.5, 1, 1],
  //   },
  // },
  // {
  //   name: 'tester',
  //   method: 'shapes.textLines',
  //   options: {
  //     font: {
  //       family: 'Times New Roman',
  //       color: [1, 0, 0, 1],
  //       style: 'normal',
  //       size: 0.1,
  //       weight: '200',
  //     },
  //     text: [
  //       'This is a |formatted| string',
  //       [
  //         {
  //           font: { size: 0.05},
  //           lineSpace: 0.1,
  //           justification: 'right',
  //           location: [-0.2, 0.3]
  //         },
  //         'This is a |sup| string',
  //       ],
  //       'This is a simple string also |formatted|.'
  //     ],
  //     lineSpace: 0.2,
  //     modifiers: {
  //       formatted: {
  //         offset: [0.01, 0],
  //         font: { color: [1, 1, 0, 1], style: 'italic' },
  //       },
  //     },
  //     position: [0, 0],
  //     xAlign: 'center',
  //     yAlign: 'bottom',
  //     color: [0.5, 0.5, 1, 1],
  //     justification: 'left',
  //   },
  // },
  // {
  //   name: 'tester',
  //   method: 'shapes.textLine',
  //   options: {
  //     text: [
  //       'hello', [{ font: { size: 0.1 }, offset: [-0.3, 0.1], inLine: false }, ' there'], 'great',
  //     ],
  //     xAlign: 'center',
  //     yAlign: 'middle',
  //     color: [0, 1, 0, 1],
  //     font: {
  //       family: 'Helvetica',
  //       color: [0, 1, 1, 1],
  //     }
  //   },
  // },
  // {
  //   name: 't',
  //   method: 'text',
  //   options: {
  //     text: 'asdf',
  //     font: { 
  //       size: 0.1,
  //       family: 'Helvetica',
  //       style: 'italic',
  //     },
  //     position: [0, -0.5],
  //     xAlign: 'center',
  //     // size: 0.2,
  //     // color: [1, 0, 1, 1],
  //   },
  // },
  {
    name: 'allOptions',
    method: 'shapes.textLine',
    options: {
      font: {
        family: 'Times New Roman',
        color: [1, 0, 0, 1],
        style: 'normal',
        size: 0.1,
        weight: '200',
      },
      text: [
        // 'This is the ',
        // [{ font: { style: 'italic', color: [0, 0, 1] } }, 'first'],
        // ' line',
        'This is a ',
        [{ font: { size: 0.05 }, offset: [0, 0.1], inLine: false }, 'superscript'],
        'example on a new line.',
      ],
      xAlign: 'center',
      yAlign: 'middle',
      color: [0.5, 0.5, 1, 1],
    },
  },
  {
    name: 'a',
    method: 'polygon',
    options: {
      radius: 0.01,
      width: 0.01,
      sides: 10,
      // transform: new Fig.Transform().scale(2, 2).translate(0.5, 0),
    },
  },
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
    name: 'eqn',
    method: 'equation',
    options: {
      color: [0, 0.95, 0, 1],
      elements: {
        a: 'a',
        s1: {
          symbol: 'int',
          color: [0.95, 0, 0, 1], // override default equation color
          lineWidth: 0.01,        // lineWidth
          sides: 20,              // sides in integral s-curve
          width: null,            // symbol width
          tipWidth: null,         // s-curve tip width
          draw: 'static',         // or 'dynamic'
          staticHeight: 'first',  // or number (only use if draw = static)
          serif: true,            // serifs on s-curve
          num: 2,                 // number of s-curves
          type: 'generic',        // or 'line' for line integral symbol
          serifSides: 10,         // sides on serifs
          lineIntegralSides: 20,  // sides on line integral symbol
        },
        s2: {
          symbol: 'int',
          color: [0.95, 0, 0, 1], // override default equation color
          lineWidth: 0.01,        // lineWidth
          sides: 20,              // sides in integral s-curve
          width: null,            // symbol width
          tipWidth: null,         // s-curve tip width
          draw: 'dynamic',        // or 'dynamic'
          serif: false,           // serifs on s-curve
          num: 1,                 // number of s-curves
          type: 'line',           // or 'line' for line integral symbol
          serifSides: 10,         // sides on serifs
          lineIntegralSides: 20,  // sides on line integral symbol
        },
      },
      forms: {
        s1: { content: { int: ['s1', 'a'] } },
        s2: { content: { int: ['s2', 'a'] } },
      },
    },
  }
  // {
  //   name: 'eqn',
  //   method: 'equation',
  //   options: {
  //     font: {
  //       size: 0.2,
  //       color: [1, 1, 0, 1],
  //       family: 'Helvetica',
  //     },
  //     elements: {
  //       equals: { text: ' = ', color: [1, 1, 0, 1], },
  //       v: { symbol: 'vinculum', color: [1, 1, 0, 1], },
  //     },
  //     forms: {
  //       0: ['a', 'equals', { frac: {
  //         numerator: 'b',
  //         symbol: 'v',
  //         denominator: 'c',
  //         offsetY: 0.05,
  //         denominatorSpace: 0.08,
  //        } }],
  //     },
  //     // position: [0, -0.5],
  //   },
  // },
]);
diagram.initialize();

// diagram.elements._tester.animations.new()
//   .translation({ target: [-0.5, 0], duration: 1 })
//   .start();

// diagram.elements._tester.animations.new()
//   .translation({ target: [-0.5, -0.5 ], duration: 2 })
//   .start();
// console.log(diagram.elements._eqn._a.drawingObject.text[0].font.definition());
// diagram.elements._tester.onClick = () => { console.log(1) };
// diagram.elements._tester.makeTouchable();
// console.log(diagram.elements._tester.drawingObject)
diagram.elements._eqn.showForm('s2')

diagram.animateNextFrame();
console.log(diagram.elements._eqn)
// diagram.elements._tester.setColor([0, 1, 1, 1]);
// console.log(diagram.elements._eqn._a.drawingObject.border)
// console.log(diagram.elements._eqn._equals.drawingObject.border)
// console.log(diagram.elements._eqn._b.drawingObject.border)
// console.log(diagram.elements._eqn._c.drawingObject.border)
