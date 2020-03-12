// Create diagram
const diagram = new Fig.Diagram();
const { Point } = Fig;
const {
  thickenCorner, thickenLine,
  makeThickLineMid,
  makeThickLineInside,
  makeThickLineOutside,
  makePolyLine,
} = Fig.tools.g2;

const line = [
  new Point(1.5, 0),
  new Point(0.75, 0.2),
  new Point(0, 0),
];

const thick = makeThickLineMid(line, 0.1, true);
console.log(thick)
diagram.addElements([
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
  const thick = makePolyLine(line, 0.1, true, 'mid', true);
  r.drawingObject.change(thick);
  diagram.animateNextFrame();
}
diagram.initialize();
