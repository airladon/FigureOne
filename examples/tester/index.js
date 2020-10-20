const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});

// Right angle triangle
diagram.addElement({
  name: 'g',
  method: 'shapes.polyline',
  options: {
    points: [[0, 0], [1, 0], [2, 1]],
    // length: 1,
    // angle: 0,
    width: 0.1,
    widthIs: 'mid',
    arrow: {
      start: {
        head: 'triangle',
        width: 0.2,
        length: 0.2,
        // barb: 0.2,
      },
      end: {
        head: 'triangle',
        width: 0.2,
        length: 0.2,
        // barb: 0.1,
      },
    },
    // touchBorder: 0.1,
    // radius: 1,
    // width: 2,
    // height: 1,
    // line: { width: 0.1 },
  },
  mods: {
    isTouchable: true,
    isMovable: true,
    cannotTouchHole: true,
  },
});
diagram.setTouchable();
// console.log('update')
// diagram.elements._g.custom.update({ width: 3, line: { width : 0.01, dash: [0.3, 0.1] }})

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
