// Create diagram
const diagram = new Fig.Diagram();
const { Point } = Fig;
const { thickenCorner, thickenLine } = Fig.tools.g2;

const line = [
  new Point(0, 1),
  new Point(0, 0),
  new Point(1, 0),
];
// const thickLine = [
//   new Point(1, 0),
//   new Point(1, 0.1),
//   ...thickenCorner(line[0], line[1], line[2], 0.1),
//   new Point(0, 1),
//   new Point(0.1, 1),
// ];

// console.log(thickLine)
// Add elements to the diagram
diagram.addElement(
  {
    name: 'r',
    method: 'shapes.generic',
    options: {
      points: thickenLine(line, 0.1, true),
      drawType: 'strip',
    },
  },
);

// Show the equation form
// diagram.getElement('eqn').showForm('base');
console.log(diagram.getElement('r'))
diagram.initialize();
