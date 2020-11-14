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
  name: 'p',
  method: 'advanced.polyline',
  options: {
    points: [[0, 0], [1, 0], [1, 1]],
    width: 0.03,
    widthIs: 'inside',
    // arrow: 'triangle',
    side: {
      offset: -0.25,
      // showLine: false,
      width: 0.009,
      // width: 0.01,
      label: {
        text: ['b', 'c'],
        location: 'negative',
        scale: 0.6,
        offset: 0.1,
      },
      // dash: [0.01, 0.1],
      arrow: 'line',
      mods: {
        isMovable: true,
        isTouchable: true,
      },
      1: {
        color: [1, 0, 1, 1]
      },
      only: [1, 2],
    },
    angle: {
      curve: { width: 0.03, radius: 0.2, fill: true, },
      direction: 'negative',
      0: {

      },
      only: [0, 2, 1],
      not: [1, 2, 1]
    },
    close: true,
    pad: {
      radius: 0.2,
      color: [1, 0, 0, 0.5],
      isMovable: true,
      line: { width: 0.01 }
    },
  }
});
