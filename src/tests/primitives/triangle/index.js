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
    method: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1],
    },
  },
  {
    name: 'grid',
    method: 'grid',
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
    method: 'grid',
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
const makeShape = (method, options, lineOptions = null) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const name = `_${index}`;
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
    }, options),
  };
};

const makeTriangle = (options, lineOptions = null) => makeShape(
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
  makeTriangle({ width: 0.3, height: 0.3, top: 'left' }),
  makeTriangle({ width: 0.3, height: 0.3, top: 'center' }),
  makeTriangle({ width: 0.3, height: 0.3, top: 'right' }),
  makeTriangle({ SSS: [0.3, Math.sqrt(0.18), 0.3] }),
  makeTriangle({ ASA: [Math.PI / 2, 0.3, Math.PI / 4] }),
  makeTriangle({ AAS: [Math.PI / 2, Math.PI / 4, Math.sqrt(0.18)] }),
  makeTriangle({ SAS: [0.3, Math.PI / 4, Math.sqrt(0.18)] }),
  makeTriangle({ points: [[0, 0], [0.3, 0], [0, 0.3]] }),

  // Direction
  makeTriangle({ width: 0.3, height: 0.3, top: 'left', direction: -1 }),
  makeTriangle({ width: 0.3, height: 0.3, top: 'center', direction: -1 }),
  makeTriangle({ width: 0.3, height: 0.3, top: 'right', direction: -1 }),
  makeTriangle({ SSS: [0.3, Math.sqrt(0.18), 0.3], direction: -1 }),
  makeTriangle({ ASA: [Math.PI / 2, 0.3, Math.PI / 4], direction: -1 }),
  makeTriangle({ AAS: [Math.PI / 2, Math.PI / 4, Math.sqrt(0.18)], direction: -1 }),
  makeTriangle({ SAS: [0.3, Math.PI / 4, Math.sqrt(0.18)], direction: -1 }),

  // Line specific
  makeTriangle({}, { widthIs: 'inside' }),
  makeTriangle({}, { widthIs: 'mid' }),
  makeTriangle({}, { widthIs: 'outside' }),
  makeTriangle({ direction: -1 }, { widthIs: 'inside' }),
  makeTriangle({ direction: -1 }, { widthIs: 'mid' }),
  makeTriangle({ direction: -1 }, { widthIs: 'outside' }),

  // Rotation alignments
  makeTriangle({ rotation: 0.1 }),
  makeTriangle({ rotation: 's1' }),
  makeTriangle({ rotation: 's2' }),
  makeTriangle({ rotation: 's3' }),
  makeTriangle({ rotation: { side: 's1', angle: 0.1 } }),
  makeTriangle({ rotation: { side: 's2', angle: 0.1 } }),
  makeTriangle({ rotation: { side: 's3', angle: 0.1 } }),
  makeTriangle({ rotation: { side: 's1', angle: -0.1 } }),
  makeTriangle({ rotation: { side: 's2', angle: -0.1 } }),
  makeTriangle({ rotation: { side: 's3', angle: -0.1 } }),
  makeTriangle({ rotation: 's2' }, { widthIs: 'mid' }),
  makeTriangle({ rotation: 's2' }, { widthIs: 'inside' }),
  makeTriangle({ rotation: 's2' }, { widthIs: 'outside' }),

  // x-y alignments
  makeTriangle({ xAlign: 'left', yAlign: 'bottom' }),
  makeTriangle({ xAlign: 'center', yAlign: 'middle' }),
  makeTriangle({ xAlign: 'right', yAlign: 'top' }),
  makeTriangle({ xAlign: 0.2, yAlign: 0.2 }),
  makeTriangle({ xAlign: 'a1', yAlign: 'a1' }),
  makeTriangle({ xAlign: 'a3', yAlign: 'a3' }),
  makeTriangle({ xAlign: 'a2', yAlign: 'a2' }),
  makeTriangle({ xAlign: 's1', yAlign: 's1' }),
  makeTriangle({ xAlign: 's3', yAlign: 's3' }),
  makeTriangle({ xAlign: 's2', yAlign: 's2' }),
  makeTriangle({ points: [[0, 0], [0.3, 0], [0, 0.3]], xAlign: 'points', yAlign: 'points' }),

  // x-y alignment line
  makeTriangle({ xAlign: 'left', yAlign: 'bottom' }, { widthIs: 'mid' }),
  makeTriangle({ xAlign: 'center', yAlign: 'middle' }, { widthIs: 'mid' }),
  makeTriangle({ xAlign: 'right', yAlign: 'top' }, { widthIs: 'mid' }),
  makeTriangle({ xAlign: 0.2, yAlign: 0.2 }, { widthIs: 'mid' }),
  makeTriangle({ xAlign: 'a1', yAlign: 'a1' }, { widthIs: 'mid' }),
  makeTriangle({ xAlign: 'a3', yAlign: 'a3' }, { widthIs: 'mid' }),
  makeTriangle({ xAlign: 'a2', yAlign: 'a2' }, { widthIs: 'mid' }),
  makeTriangle({ xAlign: 's1', yAlign: 's1' }, { widthIs: 'mid' }),
  makeTriangle({ xAlign: 's3', yAlign: 's3' }, { widthIs: 'mid' }),
  makeTriangle({ xAlign: 's2', yAlign: 's2' }, { widthIs: 'mid' }),
  makeTriangle({ xAlign: 's3', yAlign: 's3' }, { widthIs: 'mid' }),
  makeTriangle({ xAlign: 's3', yAlign: 's3' }, { widthIs: 'inside' }),
  makeTriangle({ xAlign: 's3', yAlign: 's3' }, { widthIs: 'outside' }),

  // // Corner
  makeTriangle({}, { cornerStyle: 'none' }),
  makeTriangle({}, { cornerStyle: 'fill' }),
  makeTriangle({ height: 0.5 }, { cornerStyle: 'radius', cornerSize: 0.07, cornerSides: 5 }),

  // dash
  makeTriangle({}, { dash: [0.03, 0.02], widthIs: 'inside' }),
  makeTriangle({}, { dash: [0.03, 0.02], widthIs: 'mid' }),
  makeTriangle({}, { dash: [0.03, 0.02], widthIs: 'outside' }),

  // Line Primitives
  makeTriangle({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'none' }),
  makeTriangle({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'auto' }),
  makeTriangle({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'fill' }),
  makeTriangle({ height: 0.5 }, {
    linePrimitives: true, lineNum: 5, cornerStyle: 'radius', cornerSize: 0.07, cornerSides: 5,
  }),
];
figure.add(arrows);

for (let i = 0; i < index; i += 1) {
  const element = figure.elements.elements[`_${i}`];
  for (let j = 0; j < element.drawBorder.length; j += 1) {
    figure.add({
      name: `border${i}${j}`,
      method: 'polyline',
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
      method: 'polyline',
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
