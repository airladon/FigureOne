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
        bar: { symbol: 'bar', side: 'right' },
        lb: { symbol: 'squareBracket', side: 'left' },
        rb: { symbol: 'squareBracket', side: 'right' },
        bb: { symbol :'box', fill: true, color: [1, 0, 0, 0.5]},
        box: { symbol: 'box', color: [1, 0, 0, 1] },
      },
      forms: {
        base: {
          box: {
            content: {
              // annotate: {
              //   content: 'a',
              //   topSpace: 0.1,
              //   // annotation: {
              //   //   content: 'b',
              //   //   yPosition: 'top',
              //   //   yAlign: 'bottom',
              //   //   xPosition: 'right',
              //   //   xAlign: 'left',
              //   // },
              //   contentScale: 2,
              //   glyphs: {
              //     left: {
              //       symbol: 'lb',
              //       annotation: {
              //         content: 'casdf',
              //         yPosition: 'top',
              //         yAlign: 'bottom',
              //         xPosition: 'right',
              //         xAlign: 'left',
              //       },
              //       // space: 0.1,
              //       overhang: 0.2,
              //       topSpace: 0,
              //       annotationsOverContent: true,
              //       // topSpace: 0.05,
              //       // rightSpace: 0.05,
              //       // leftSpace: 0.05,
              //       // bottomSpace: 0.05,
              //     },
              //   },
              //   inSize: false,
              // },
              annotate: {
                content: 'a',
                glyphs: {
                  left:{
                    symbol: 'bar',
                    overhang: 0.1,
                    annotation: {
                      content: 'bbb',
                      xPosition: 'right',
                      yPosition: 'bottom',
                      xAlign: 'left',
                      yAlign: 'middle',
                      scale: 0.5,
                    },
                  },
                },
              },
            },
            symbol: 'box',
          },
          // root: { symbol: 'radical', content: 'a', root: '_2'}
        },
      },
    },
  },
);
// Show the equation form
diagram.getElement('eqn').showForm('base');
diagram.initialize();
