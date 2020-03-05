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
      position: [-0.8, 0],
      // Not all elements need to be defined as some can be inferred
      elements: {
        lim: { style: 'normal' },
        integral: { symbol: 'int', sides: 20 },
        lb: { symbol: 'bracket', side: 'left' },
        lb1: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        rb1: { symbol: 'bracket', side: 'right' },
        equals: ' = ',
        sigma: { symbol: 'sum', lineWidth: 0.006 },
        delta: { text: '\u0394', color: [1, 0, 0, 1] },
        x_1: { text: 'x', color: [1, 0, 0, 1]},
      },
      // An equation form is how those terms are arranged
      forms: {
        base: [
          {
            int: {
              symbol: 'integral',
              content: [
                'f',
                {
                  brac: {
                    left: 'lb',
                    content: 'x',
                    right: 'rb',
                    outsideSpace: 0.05,
                  }
                }, 'dx'],
              from: 'a',
              to: 'b',
            },
          },
          'equals',
          {
            annotate: {
              content: 'lim',
              annotation: {
                content: 'n\u2192\u221e',
                xPosition: 'center',
                xAlign: 'center',
                yPosition: 'bottom',
                yAlign: 'top',
                scale: 0.7,
              }
            }
          },
          ' ',
          {
            sumOf: {
              symbol: 'sigma',
              from: 'i=1',
              to: 'n',
              content: [
                ' ', 'delta', ' ', 'x_1', ' ', '\u00b7', ' ', 'f_1',
                {
                  brac: {
                    left: 'lb1',
                    content: { sub: ['x_2', 'i'] },
                    right: 'rb1',
                    outsideSpace: 0.05,
                    bottomSpace: 0.02,
                  }
                },
              ]
            }
          }
        ],
      },
    },
  },
);
// Show the equation form
diagram.getElement('eqn').showForm('base');
diagram.initialize();
