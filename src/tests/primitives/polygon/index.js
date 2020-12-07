const figure = new Fig.Figure({
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
const xValues = Fig.tools.math.range(-4, 4, 0.7);
const yValues = Fig.tools.math.range(4, -4, -0.7);
let index = 0;
const makeShape = (method, options) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const name = `_${index}`;
  index += 1;
  return {
    name,
    method,
    options: Fig.tools.misc.joinObjects({}, {
      position: [x, y],
    }, options),
  };
};

const makeArrow = (...options) => makeShape(
  'primitives.arrow',
  Fig.tools.misc.joinObjects({}, {
    width: 0.35,
    length: 0.35,
    drawBorderBuffer: 0.1,
    color: [1, 0, 0, 0.8],
    tailWidth: 0.15,
  }, ...options),
);

const triArrow = (options = {}) => {
  return makeArrow({ head: 'triangle' }, options);
};
const revtriArrow = (options = {}) => {
  return makeArrow({ head: 'reverseTriangle' }, options);
};
const barbArrow = (options = {}) => {
  return makeArrow({ head: 'barb' }, options);
};
const polygonArrow = (options = {}) => {
  return makeArrow({ head: 'polygon', sides: 6, radius: 0.2 }, options);
};
const barArrow = (options = {}) => {
  return makeArrow({ head: 'bar', length: 0.1 }, options);
};
const lineArrow = (options = {}) => {
  return makeArrow({ head: 'line', tailWidth: 0.05 }, options);
};

const makePolygon = (options) => {
  return makeShape(
    'primitives.polygon',
    Fig.tools.misc.joinObjects({}, {
      radius: 0.2,
      sides: 6,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makeEllipse = (options) => {
  return makeShape(
    'primitives.ellipse',
    Fig.tools.misc.joinObjects({}, {
      width: 0.5,
      height: 0.4,
      sides: 20,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makeRectangle = (options) => {
  return makeShape(
    'primitives.rectangle',
    Fig.tools.misc.joinObjects({}, {
      width: 0.5,
      height: 0.4,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makeTriangle = (options) => {
  return makeShape(
    'primitives.triangle',
    Fig.tools.misc.joinObjects({}, {
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makeStar = (options) => {
  return makeShape(
    'primitives.star',
    Fig.tools.misc.joinObjects({}, {
      radius: 0.2,
      innerRadius: 0.1,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makeLine = (options) => {
  return makeShape(
    'primitives.line',
    Fig.tools.misc.joinObjects({}, {
      p1: [-0.4, 0],
      p2: [0, 0],
      width: 0.05,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makePolyline = (options) => {
  return makeShape(
    'primitives.polyline',
    Fig.tools.misc.joinObjects({}, {
      points: [[-0.4, 0], [0, 0], [-0.4, -0.4]],
      width: 0.05,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makeGrid = (options) => {
  return makeShape(
    'primitives.grid',
    Fig.tools.misc.joinObjects({}, {
      bounds: [-0.4, -0.4, 0.4, 0.4],
      xStep: 0.1,
      yStep: 0.1,
      line: { width: 0.05 },
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const arrows = [
  triArrow(),
  triArrow({ tail: -0.1 }),
  triArrow({ tail: 0 }),
  triArrow({ tail: 0.1 }),
  triArrow({ line: { width: 0.05 } }),
  triArrow({ line: { width: 0.05 }, tail: -0.1 }),
  triArrow({ line: { width: 0.05 }, tail: 0 }),
  triArrow({ line: { width: 0.05 }, tail: 0.1 }),
  triArrow({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  triArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.1 }),
  triArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  triArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.1 }),
  revtriArrow(),
  revtriArrow({ tail: -0.05 }),
  revtriArrow({ tail: 0 }),
  revtriArrow({ tail: 0.1 }),
  revtriArrow({ line: { width: 0.05 } }),
  revtriArrow({ line: { width: 0.05 }, tail: -0.05 }),
  revtriArrow({ line: { width: 0.05 }, tail: 0 }),
  revtriArrow({ line: { width: 0.05 }, tail: 0.1 }),
  revtriArrow({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  revtriArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.05 }),
  revtriArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  revtriArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.1 }),
  barbArrow({ barb: 0.05 }),
  barbArrow({ barb: 0.05, tail: -0.02 }),
  barbArrow({ barb: 0.05, tail: 0 }),
  barbArrow({ barb: 0.05, tail: 0.05 }),
  barbArrow({ barb: 0.05, line: { width: 0.05 } }),
  barbArrow({ barb: 0.05, line: { width: 0.05 }, tail: -0.02 }),
  barbArrow({ barb: 0.05, line: { width: 0.05 }, tail: 0 }),
  barbArrow({ barb: 0.05, line: { width: 0.05 }, tail: 0.05 }),
  barbArrow({ barb: 0.05, line: { width: 0.02, dash: [0.03, 0.01] } }),
  barbArrow({ barb: 0.05, line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.02 }),
  barbArrow({ barb: 0.05, line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  barbArrow({ barb: 0.05, line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.05 }),
  barbArrow({ barb: 0.15 }),
  barbArrow({ barb: 0.15, tail: -0.02 }),
  barbArrow({ barb: 0.15, tail: 0 }),
  barbArrow({ barb: 0.15, tail: 0.05 }),
  barbArrow({ barb: 0.15, line: { width: 0.05 } }),
  barbArrow({ barb: 0.15, line: { width: 0.05 }, tail: -0.02 }),
  barbArrow({ barb: 0.15, line: { width: 0.05 }, tail: 0 }),
  barbArrow({ barb: 0.15, line: { width: 0.05 }, tail: 0.05 }),
  barbArrow({ barb: 0.15, line: { width: 0.02, dash: [0.03, 0.01] } }),
  barbArrow({ barb: 0.15, line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.02 }),
  barbArrow({ barb: 0.15, line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  barbArrow({ barb: 0.15, line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.05 }),
  polygonArrow(),
  polygonArrow({ tail: -0.05 }),
  polygonArrow({ tail: 0 }),
  polygonArrow({ tail: 0.05 }),
  polygonArrow({ line: { width: 0.05 } }),
  polygonArrow({ line: { width: 0.05 }, tail: -0.05 }),
  polygonArrow({ line: { width: 0.05 }, tail: 0 }),
  polygonArrow({ line: { width: 0.05 }, tail: 0.05 }),
  polygonArrow({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  polygonArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.05 }),
  polygonArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  polygonArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.05 }),
  barArrow(),
  barArrow({ tail: -0.05 }),
  barArrow({ tail: 0 }),
  barArrow({ tail: 0.05 }),
  barArrow({ line: { width: 0.05 } }),
  barArrow({ line: { width: 0.05 }, tail: -0.05 }),
  barArrow({ line: { width: 0.05 }, tail: 0 }),
  barArrow({ line: { width: 0.05 }, tail: 0.05 }),
  barArrow({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  barArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.05 }),
  barArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  barArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.05 }),
  lineArrow(),
  lineArrow({ tail: -0.2 }),
  lineArrow({ tail: -0.05 }),
  lineArrow({ tail: 0 }),
  lineArrow({ tail: 0.05 }),
  lineArrow({ line: { width: 0.05 } }),
  lineArrow({ line: { width: 0.05 }, tail: -0.2 }),
  lineArrow({ line: { width: 0.05 }, tail: -0.05 }),
  lineArrow({ line: { width: 0.05 }, tail: 0 }),
  lineArrow({ line: { width: 0.05 }, tail: 0.05 }),
  lineArrow({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  lineArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.2 }),
  lineArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.05 }),
  lineArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  lineArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.05 }),
  makePolygon(),
  makePolygon({ sides: 3 }),
  makePolygon({ line: { width: 0.05 } }),
  makePolygon({ line: { width: 0.05, widthIs: 'inside' } }),
  makePolygon({ line: { width: 0.05 }, sides: 3 }),
  makePolygon({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  makePolygon({ line: { width: 0.02, dash: [0.03, 0.01] }, sides: 3 }),
  makeRectangle(),
  makeRectangle({ corner: { radius: 0.1, sides: 3 }}),
  makeRectangle({ line: { width: 0.05 } }),
  makeRectangle({ line: { width: 0.05 }, corner: { radius: 0.1, sides: 3 }}),
  makeRectangle({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  makeRectangle({ line: { width: 0.02, dash: [0.03, 0.01] }, corner: { radius: 0.1, sides: 3 }}),
  makeTriangle({ width: 0.4, height: 0.3, top: 'left' }),
  makeTriangle({ width: 0.4, height: 0.1, top: 'left' }),
  makeTriangle({ width: 0.4, height: 0.3, top: 'left', line: { width: 0.05 } }),
  makeTriangle({ width: 0.4, height: 0.1, top: 'left', line: { width: 0.05 } }),
  makeTriangle({ width: 0.4, height: 0.3, top: 'left', line: { width: 0.02, dash: [0.03, 0.01] } }),
  makeTriangle({ width: 0.4, height: 0.1, top: 'left', line: { width: 0.02, dash: [0.03, 0.01] } }),
  makeStar(),
  makeStar({ line: { width: 0.05 } }),
  makeStar({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  makeStar({ sides: 10 }),
  makeStar({ line: { width: 0.05 }, sides: 10 }),
  makeStar({ line: { width: 0.02, dash: [0.03, 0.01] }, sides: 10 }),
  makeStar({ sides: 15 }),
  makeStar({ line: { width: 0.05 }, sides: 15 }),
  makeStar({ line: { width: 0.02, dash: [0.03, 0.01] }, sides: 15 }),
  makeEllipse(),
  makeEllipse({ height: 0.1 }),
  makeEllipse({ sides: 4 }),
  makeEllipse({ height: 0.1, sides: 4 }),
  makeEllipse({ line: { width: 0.05 } }),
  makeEllipse({ line: { width: 0.05 }, height: 0.1 }),
  makeEllipse({ line: { width: 0.05 }, sides: 4 }),
  makeEllipse({ line: { width: 0.05 }, height: 0.1, sides: 4 }),
  makeEllipse({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  makeEllipse({ line: { width: 0.02, dash: [0.03, 0.01] }, height: 0.1 }),
  makeEllipse({ line: { width: 0.02, dash: [0.03, 0.01] }, sides: 4 }),
  makeEllipse({ line: { width: 0.02, dash: [0.03, 0.01] }, height: 0.1, sides: 4 }),
  makeLine(),
  makeLine({
    arrow: {
      head: 'triangle',
      length: 0.1,
      width: 0.1,
    },
    widthIs: 'outside',
  }),
  makeLine({
    arrow: {
      head: 'triangle',
      length: 0.1,
      width: 0.1,
      tail: 0.05,
    },
  }),
  makePolyline(),
  makePolyline({
    widthIs: 'outside',
    width: 0.07,
    arrow: {
      head: 'triangle',
      length: 0.1,
      width: 0.1,
    },
    cornerStyle: 'fill',
    // linePrimitives: true,
    // lineNum: 5,
  }),
  makePolyline({
    widthIs: 'outside',
    arrow: {
      head: 'triangle',
      length: 0.1,
      width: 0.1,
      tail: 0.05,
    },
  }),
  makePolyline({
    points: [[-0.4, 0], [0, 0], [-0.2, -0.1], [0.2, -0.1]],
    widthIs: 'mid',
    arrow: {
      head: 'triangle',
      length: 0.1,
      width: 0.1,
      tail: 0.05,
    },
  }),
  makeLine({ linePrimitives: true, lineNum: 5 }),
  makeLine({
    widthIs: 'outside',
    linePrimitives: true, lineNum: 5,
  }),
  makeLine({
    linePrimitives: true, lineNum: 5,
  }),
  makePolyline({ linePrimitives: true, lineNum: 5 }),
  makePolyline({
    widthIs: 'outside',
    width: 0.07,
    cornerStyle: 'fill',
    linePrimitives: true, lineNum: 5,
    // linePrimitives: true,
    // lineNum: 5,
  }),
  makePolyline({
    widthIs: 'outside',
    linePrimitives: true, lineNum: 5,
  }),
  makePolyline({
    points: [[-0.4, 0], [0, 0], [-0.2, -0.1], [0.2, -0.1]],
    widthIs: 'mid',
    linePrimitives: true, lineNum: 5,
  }),
  makeGrid(),
  makeGrid({ line: { linePrimitives: true, lineNum: 1 } }),
  // DONT FORGET LINEPRIMITIVES TRUE
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
