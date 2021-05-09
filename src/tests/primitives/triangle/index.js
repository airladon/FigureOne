// eslint-disable-next-line no-undef
const { Figure, tools } = Fig;

const figure = new Figure({
  limits: [-4.5, -4.5, 9, 9],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

figure.add([
  {
    name: 'origin',
    make: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1],
    },
  },
  {
    name: 'grid',
    make: 'grid',
    options: {
      bounds: [-4.5, -4.5, 9, 9],
      yStep: 0.1,
      xStep: 0.1,
      color: [0.9, 0.9, 0.9, 1],
      line: { width: 0.004 },
    },
  },
  {
    name: 'gridMajor',
    make: 'grid',
    options: {
      bounds: [-4.5, -4.5, 9, 9],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.7, 0.7, 0.7, 1],
      line: { width: 0.004 },
    },
  },
]);


// ***************************************************
// ***************************************************
// ***************************************************
const xValues = tools.math.range(-4, 4, 1);
const yValues = tools.math.range(4, -4, -1);
let index = 0;
const makeShape = (name, method, options, lineOptions = null) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  // const name = `_${index}`;
  const indexName = `${index}`;
  index += 1;
  let line;
  if (lineOptions != null) {
    line = tools.misc.joinObjects({}, {
      width: 0.05,
      widthIs: 'mid',
    }, lineOptions);
  }
  return {
    name,
    method,
    options: tools.misc.joinObjects({}, {
      position: [x, y],
      line,
      touchBorder: 'buffer',
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    }),
  };
};

const tri = (name, options, lineOptions = null) => makeShape(
  name,
  'primitives.triangle',
  tools.misc.joinObjects({}, {
    drawBorderBuffer: 0.1,
    color: [1, 0, 0, 0.6],
    width: 0.4,
    height: 0.2,
    top: 'left',
  }, options),
  lineOptions,
);

/* eslint-disable object-curly-newline */
const arrows = [
  // Definitions
  tri('d1', { width: 0.3, height: 0.3, top: 'left' }),
  tri('d2', { width: 0.3, height: 0.3, top: 'center' }),
  tri('d3', { width: 0.3, height: 0.3, top: 'right' }),
  tri('d4', { SSS: [0.3, Math.sqrt(0.18), 0.3] }),
  tri('d5', { ASA: [Math.PI / 2, 0.3, Math.PI / 4] }),
  tri('d6', { AAS: [Math.PI / 2, Math.PI / 4, Math.sqrt(0.18)] }),
  tri('d7', { SAS: [0.3, Math.PI / 4, Math.sqrt(0.18)] }),
  tri('d8', { points: [[0, 0], [0.3, 0], [0, 0.3]] }),

  // Direction
  tri('a1', { width: 0.3, height: 0.3, top: 'left', direction: -1 }),
  tri('a2', { width: 0.3, height: 0.3, top: 'center', direction: -1 }),
  tri('a3', { width: 0.3, height: 0.3, top: 'right', direction: -1 }),
  tri('a4', { SSS: [0.3, Math.sqrt(0.18), 0.3], direction: -1 }),
  tri('a5', { ASA: [Math.PI / 2, 0.3, Math.PI / 4], direction: -1 }),
  tri('a6', { AAS: [Math.PI / 2, Math.PI / 4, Math.sqrt(0.18)], direction: -1 }),
  tri('a7', { SAS: [0.3, Math.PI / 4, Math.sqrt(0.18)], direction: -1 }),

  // Line specific
  tri('l1', {}, { widthIs: 'inside' }),
  tri('l2', {}, { widthIs: 'mid' }),
  tri('l3', {}, { widthIs: 'outside' }),
  tri('l4', { direction: -1 }, { widthIs: 'inside' }),
  tri('l5', { direction: -1 }, { widthIs: 'mid' }),
  tri('l6', { direction: -1 }, { widthIs: 'outside' }),

  // Rotation alignments
  tri('r1', { rotation: 0.1 }),
  tri('r2', { rotation: 's1' }),
  tri('r3', { rotation: 's2' }),
  tri('r4', { rotation: 's3' }),
  tri('r5', { rotation: { side: 's1', angle: 0.1 } }),
  tri('r6', { rotation: { side: 's2', angle: 0.1 } }),
  tri('r7', { rotation: { side: 's3', angle: 0.1 } }),
  tri('r8', { rotation: { side: 's1', angle: -0.1 } }),
  tri('r9', { rotation: { side: 's2', angle: -0.1 } }),
  tri('r10', { rotation: { side: 's3', angle: -0.1 } }),
  tri('r11', { rotation: 's2' }, { widthIs: 'mid' }),
  tri('r12', { rotation: 's2' }, { widthIs: 'inside' }),
  tri('r13', { rotation: 's2' }, { widthIs: 'outside' }),

  // x-y alignments
  tri('x1', { xAlign: 'left', yAlign: 'bottom' }),
  tri('x2', { xAlign: 'center', yAlign: 'middle' }),
  tri('x3', { xAlign: 'right', yAlign: 'top' }),
  tri('x4', { xAlign: 0.2, yAlign: 0.2 }),
  tri('x5', { xAlign: 'a1', yAlign: 'a1' }),
  tri('x6', { xAlign: 'a3', yAlign: 'a3' }),
  tri('x7', { xAlign: 'a2', yAlign: 'a2' }),
  tri('x8', { xAlign: 's1', yAlign: 's1' }),
  tri('x9', { xAlign: 's3', yAlign: 's3' }),
  tri('x10', { xAlign: 's2', yAlign: 's2' }),
  tri('x11', { points: [[0, 0], [0.3, 0], [0, 0.3]], xAlign: 'points', yAlign: 'points' }),

  // x-y alignment line
  tri('y1', { xAlign: 'left', yAlign: 'bottom' }, { widthIs: 'mid' }),
  tri('y2', { xAlign: 'center', yAlign: 'middle' }, { widthIs: 'mid' }),
  tri('y3', { xAlign: 'right', yAlign: 'top' }, { widthIs: 'mid' }),
  tri('y4', { xAlign: 0.2, yAlign: 0.2 }, { widthIs: 'mid' }),
  tri('y5', { xAlign: 'a1', yAlign: 'a1' }, { widthIs: 'mid' }),
  tri('y6', { xAlign: 'a3', yAlign: 'a3' }, { widthIs: 'mid' }),
  tri('y7', { xAlign: 'a2', yAlign: 'a2' }, { widthIs: 'mid' }),
  tri('y8', { xAlign: 's1', yAlign: 's1' }, { widthIs: 'mid' }),
  tri('y9', { xAlign: 's3', yAlign: 's3' }, { widthIs: 'mid' }),
  tri('y10', { xAlign: 's2', yAlign: 's2' }, { widthIs: 'mid' }),
  tri('y11', { xAlign: 's3', yAlign: 's3' }, { widthIs: 'mid' }),
  tri('y12', { xAlign: 's3', yAlign: 's3' }, { widthIs: 'inside' }),
  tri('y13', { xAlign: 's3', yAlign: 's3' }, { widthIs: 'outside' }),

  // // Corner
  tri('c1', {}, { cornerStyle: 'none' }),
  tri('c2', {}, { cornerStyle: 'fill' }),
  tri('c3', { height: 0.5 }, { cornerStyle: 'radius', cornerSize: 0.07, cornerSides: 5 }),

  // dash
  tri('s1', {}, { dash: [0.03, 0.02], widthIs: 'inside' }),
  tri('s2', {}, { dash: [0.03, 0.02], widthIs: 'mid' }),
  tri('s3', {}, { dash: [0.03, 0.02], widthIs: 'outside' }),

  // Line Primitives
  tri('p1', {}, { linePrimitives: true, lineNum: 5, cornerStyle: 'none' }),
  tri('p2', {}, { linePrimitives: true, lineNum: 5, cornerStyle: 'auto' }),
  tri('p3', {}, { linePrimitives: true, lineNum: 5, cornerStyle: 'fill' }),
  tri('p4', { height: 0.5 }, {
    linePrimitives: true, lineNum: 5, cornerStyle: 'radius', cornerSize: 0.07, cornerSides: 5,
  }),

  // direction
  tri('g1', { points: [[0, 0.3], [0.3, 0], [0, 0]] }),
  tri('g2', { points: [[0, 0.3], [0.3, 0], [0, 0]] }, {}),
];
figure.add(arrows);

for (let i = 0; i < index; i += 1) {
  const element = figure.elements.elements[figure.elements.drawOrder[i + 3]];
  for (let j = 0; j < element.drawBorder.length; j += 1) {
    figure.add({
      name: `border${i}${j}`,
      make: 'polyline',
      options: {
        points: element.drawBorder[j],
        width: 0.01,
        color: [0, 0.7, 0, 1],
        close: true,
        position: element.getPosition(),
      },
    });
  }
  for (let j = 0; j < element.drawBorderBuffer.length; j += 1) {
    figure.add({
      name: `buffer${i}${j}`,
      make: 'polyline',
      options: {
        points: element.drawBorderBuffer[j],
        width: 0.01,
        color: [0, 0, 1, 1],
        close: true,
        position: element.getPosition(),
      },
    });
  }
}
