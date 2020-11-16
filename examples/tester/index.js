const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1]});

diagram.addElements([
  {
    name: 'origin',
    method: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1]
    },
  },
  {
    name: 'grid',
    method: 'grid',
    options: {
      bounds: [-3, -3, 6, 6],
      yStep: 0.1,
      xStep: 0.1,
      color: [0.7, 0.7, 0.7, 1],
      line: { width: 0.001 },
    },
  },
  {
    name: 'gridMajor',
    method: 'grid',
    options: {
      bounds: [-3, -3, 6, 6],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.8, 0.8, 0.8, 1],
      line: { width: 0.004 }
    },
  },
]);

diagram.addElement({
  name: 'axis',
  method: 'advanced.axis',
  options: {
    position: [-1, 0],
    length: 3,
    axis: 'x',
    start: 0,
    stop: 2.1,
    line: {
      width: 0.01,
      arrow: { end: 'triangle' },
      // dash: [0.1, 0.1],
    },
    ticks: {
      step: 0.2,
      length: 0.1,
      stop: 2,
      // start: 0.55,
      // stop: 0.7
    },
    minorTicks: {
      step: 0.04,
      length: 0.05,
      width: 0.005,
      stop: 2,
    },
    labels: {
      font: { size: 0.1 },
      precision: 2,
      // format: 'exponent',
      // values: [0, 1, 2],
      // text: ['0', 'a', 'b'],
    },
  },
});