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
        lb: { symbol: 'squareBracket', side: 'left' },
        rb: { symbol: 'squareBracket', side: 'right' },
        bb: { symbol :'box', fill: true, color: [1, 0, 0, 0.5]}
      },
      forms: {
        base: {
        //   box: {
        //     content: {
        //       annotate: {
        //         content: ['a', { root: { symbol: 'radical', content: 'e', root: '_4', rootOffset: [-0.1, 0] } }],
        //         topSpace: 0.1,
        //         annotation: {
        //           content: 'b',
        //           yPosition: 'top',
        //           yAlign: 'bottom',
        //           xPosition: 'right',
        //           xAlign: 'left',
        //         },
        //         glyphs: {
        //           encompass: {
        //             annotation: {
        //               content: 'c',
        //               xPosition: 'center',
        //               yPosition: 'top',
        //               xAlign: 'center',
        //               yAlign: 'bottom',
        //             },
        //             symbol: 'bb',
        //             topSpace: 0.05,
        //             rightSpace: 0.05,
        //             leftSpace: 0.05,
        //             bottomSpace: 0.05,
        //           },
        //         },
        //       },
        //     },
        //     symbol: 'box',
        //   },
          root: { symbol: 'radical', content: 'a', root: '_2'}
        },
      },
    },
  },
);
// Show the equation form
diagram.getElement('eqn').showForm('base');
diagram.initialize();
