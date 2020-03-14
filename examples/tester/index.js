// Create diagram
const diagram = new Fig.Diagram();
const { Point } = Fig;
const {
  // thickenCorner, thickenLine,
  // makeThickLineMid,
  // makeThickLineInside,
  // makeThickLineOutside,
  makePolyLine, makePolyLineCorners,
} = Fig.tools.lines;

const line = [
  new Point(0, 0),
        new Point(1, 0),
        new Point(1, 1),
        new Point(0, 1),
];

const makeLine = (lineIn) => makePolyLineCorners(lineIn, 0.03, true, 0.3, false, 'outside', 'radius', 0.05, 10, Math.PI / 7); // , [0.2, 0.05, 0.01, 0.05])
const thick = makeLine(line);

diagram.addElements([
  {
    name: 'pad',
    method: 'polygon',
    options: {
      radius: 0.2,
      color: [0.5, 0.5, 0.5, 0.5],
      sides: 100,
      fill: true,
    },
  },
  {
    name: 'r',
    method: 'shapes.generic',
    options: {
      points: thick,
      drawType: 'triangles',
      position: [-0.7, -0.5],
    },
  },
  {
    name: 'x',
    method: 'line',
    options: {
      p1: [-1, -0.4],
      p2: [1, -0.4],
      width: 0.005,
      color: [0.5, 0.5, 0.5, 0.5],
    }
  },
  {
    name: 'x2',
    method: 'line',
    options: {
      p1: [-1, -0.5],
      p2: [1, -0.5],
      width: 0.005,
      color: [0.5, 0.5, 0.5, 0.5],
    }
  },
  {
    name: 'x3',
    method: 'line',
    options: {
      p1: [-1, -0.55],
      p2: [1, -0.55],
      width: 0.005,
      color: [0.5, 0.5, 0.5, 0.5],
    }
  },
]);

// Show the equation form
// diagram.getElement('eqn').showForm('base');
console.log(diagram.getElement('r'))
const pad = diagram.getElement('pad');
pad.setMovable();
pad.setTransformCallback = () => {
  const p = pad.getPosition().sub(-0.7, -0.5);
  line[1] = p._dup();
  const r = diagram.getElement('r');
  // const thick = makePolyLine(line, 0.1, true, 'mid', 'chamfer');
  const thick = makeLine(line);
  r.drawingObject.change(thick);
  diagram.animateNextFrame();
}
diagram.initialize();

