// Create diagram
const diagram = new Fig.Diagram();

// Add elements to the diagram
diagram.addElement(
  {
    name: 'r',
    method: 'rectangle',
    options: {
      width: 0.8,
      height: 0.4,
      lineWidth: 0.02,
      corner: {
        sides: 3,
        radius: 0.01,
      },
      fill: true,
    },
  },
);

// Show the equation form
// diagram.getElement('eqn').showForm('base');
console.log(diagram.getElement('r'))
diagram.initialize();
