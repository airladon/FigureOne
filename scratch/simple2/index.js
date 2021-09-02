// const figure = new Fig.Figure({
//   color: [1, 0, 0, 1],
//   scene: {
//     style: 'orthographic',
//     left: -1,
//     right: 1,
//     bottom: -0.5,
//     top: 0.5,
//     camera: {
//       position: [0.5, 0.5, 1],
//       // position: [0, 0, 0.7],
//       // up: [1, 0, 0],
//       // position: [0.7, 0, 0],
//     },
//     light: {
//       directional: [0.8, 0, 0.2],
//       // ambient: [1],
//       // point: [0.1, 0.1, 0.15],
//     },
//   },
// });

// const axis = (name, line, arrowLength, color) => {
//   const l = new Fig.Line(line[0], line[1]);
//   figure.add({
//     name,
//     make: 'cylinder',
//     radius: 0.005,
//     line: [l.p1, l.pointAtLength(l.length() - arrowLength)],
//     color,
//   });
//   figure.add({
//     name: `${name}arrow`,
//     make: 'cone',
//     radius: 0.01,
//     line: [l.pointAtLength(l.length() - arrowLength), l.p2],
//     color,
//   });
// };
// axis('x', [[0, 0, 0], [0.4, 0, 0]], 0.03, [1, 0, 0, 1]);
// axis('y', [[0, 0, 0], [0, 0.4, 0]], 0.03, [0, 0.8, 0, 1]);
// axis('z', [[0, 0, 0], [0, 0, 0.4]], 0.03, [0, 0, 1, 1]);

// figure.add({
//   make: 'cube',
//   // vertexShader: { light: 'point' },
//   // fragmentShader: { light: 'point' },
//   side: 0.1,
//   position: [0.05, 0.05, 0.05],
//   color: [1, 0, 1, 1],
// });
// figure.add({
//   make: 'cube',
//   // vertexShader: { light: 'point' },
//   // fragmentShader: { light: 'point' },
//   side: 0.1,
//   position: [0.05, 0.17, 0.05],
//   color: [0, 1, 1, 1],
// });
// figure.add({
//   make: 'cube',
//   // vertexShader: { light: 'point' },
//   // fragmentShader: { light: 'point' },
//   side: 0.1,
//   position: [0.17, 0.05, 0.05],
//   color: [1, 1, 0.5, 1],
// });

// figure.add({
//   make: 'collection',
//   elements: [
//     {
//       make: 'prism',
//       face: [[-0.06, -0.035], [0.06, -0.035], [0.06, 0.035], [-0.06, 0.035]],
//       length: 0.025,
//       color: [0.7, 0.7, 0.7, 1],
//     },
//     {
//       make: 'cylinder',
//       line: [[0, 0, -0.02], [0, 0, -0.1]],
//       radius: 0.03,
//       sides: 30,
//       color: [0.5, 0.5, 0.5, 1],
//     },
//     {
//       make: 'cylinder',
//       line: [[0, 0, -0.09], [0, 0, -0.08]],
//       radius: 0.0301,
//       sides: 30,
//       color: [0.9, 0.9, 0.9, 1],
//     },
//   ],
//   // transform: ['t', 0, 0, 0],
//   // transform: [['rc', Math.PI / 2, 0, 0], ['rc', 0, 0, -Math.PI / 2]],
//   // transform: [['rc', 0, 0, -Math.PI / 2], ['rc', Math.PI / 2, 0, 0]],
//   // transform: ['rc', Math.PI / 2, 0, -Math.PI / 2],
//   // transform: [['rc', 0, 0, Math.PI / 2], ['t', 0, 0, 0.7]],
//   // transform: [['rc', 0, Math.PI / 2, 0], ['t', 0.7, 0, 0]],
//   // transform: [['s', 2, 2, 2], ['t', 0, 0, 0.7]],
// });


// c1.scene = new Fig.Scene({
//   style: 'orthographic',
//   camera: { position: [1, 0.5, 2] },
//   left: -1,
//   right: 1,
//   bottom: -0.5,
//   top: 0.5,
// });

// const c2 = figure.add({
//   make: 'cube',
//   // lines: true,
//   side: 0.3,
//   position: [0.6, 0, 0],
// });
// c2.scene = new Fig.Scene({
//   style: 'perspective',
//   camera: { position: [0.35, 0.25, 0.7] },
//   aspectRatio: 2,
//   fieldOfView: 1.7,
// });


// const figure = new Fig.Figure({ color: [1, 0, 0, 1] });

// // // High Level
// // figure.add({
// //   make: 'polygon',
// //   sides: 4,
// //   radius: 1,
// // });


// // // Lower Level
// // figure.add({
// //   make: 'generic',
// //   points: [[1, 0], [0, 1], [0, -1], [0, 1], [-1, 0], [0, -1]],
// // });

// // Lower again
// figure.add({
//   make: 'gl',
//   vertices: [1, 0, 0, 1, 0, -1, 0, 1, -1, 0, 0, -1],
//   dimension: 2,
// });



// const x = Fig.range(0, 0.5, 0.01);
// const profile = x.map(_x => [_x, 0.1 + 0.05 * Math.sin(_x * 2 * Math.PI * 2)]);
// figure.add({
//   make: 'revolve',
//   profile: [...profile, [0.4, 0]],
//   axis: [0, 1, 0],
//   color: [1, 0, 0, 1],
//   sides: 10,
// });

const figure = new Fig.Figure();
figure.scene.setProjection({ style: 'orthographic' });
figure.scene.setCamera({ position: [2, 1, 1], up: [0, 1, 0] });
figure.scene.setLight({ directional: [0.7, 0.5, 0.2] });

figure.add([
  {
    make: 'cylinder',
    radius: 0.01,
    color: [1, 0, 0, 1],
    line: [[-1, 0, 0], [1, 0, 0]],
  },
  {
    make: 'cylinder',
    radius: 0.01,
    color: [0, 1, 0, 1],
    line: [[0, -1, 0], [0, 1, 0]],
  },
  {
    make: 'cylinder',
    radius: 0.01,
    color: [0, 0, 1, 1],
    line: [[0, 0, -1], [0, 0, 1]],
  },
  {
    make: 'grid',
    bounds: [-0.8, -0.8, 1.6, 1.6],
    xStep: 0.05,
    yStep: 0.05,
    line: { width: 0.002 },
    color: [0.7, 0.7, 0.7, 1],
    transform: ['r', Math.PI / 2, 1, 0, 0],
  },
]);

figure.add({
  make: 'collection',
  name: 'coll',
  elements: [
    {
      make: 'cube',
      side: 0.3,
      color: [1, 0, 0, 1],
      center: [0.3, 0, 0],
      move: {
        type: 'rotation',
        plane: [[0, 0, 0], [0, 1, 0]],
      },
    },
  ],
});

const pan = figure.add({
  make: 'rectangle',
  width: 4,
  height: 2,
  scene: {
    style: '2D',
    left: -2,
    right: 2,
    bottom: -1,
    top: 1,
  },
  move: true,
  color: [1, 0, 0, 0.2],
});
// pan.custom.last = pan.getPosition();
pan.notifications.add('setTransform', () => {
  const delta = pan.getPosition();
  const deltaX = -delta.x;
  let deltaY = delta.y;
  const lookAt = Fig.getPoint(figure.scene.camera.lookAt);
  const up = Fig.getPoint(figure.scene.camera.up);
  const position = Fig.getPoint(figure.scene.camera.position);

  // Method 1
  // const panAxis = lookAt.sub(position).crossProduct(up.crossProduct(lookAt.sub(position)));
  // const tiltAxis = lookAt.sub(position).crossProduct(up);
  // const matrix = new Fig.Transform().rotate(deltaX, panAxis).rotate(deltaY, tiltAxis).matrix();
  // const newPosition = position.transformBy(matrix);
  // const upPosition = position.add(up);
  // const newUpPosition = upPosition.transformBy(matrix);
  // const newUp = newUpPosition.sub(newPosition);

  // Method 2
  const verticalAxis = Fig.getPoint([0, 1, 0]);
  const panAxis = verticalAxis;
  const tiltAxis = lookAt.sub(position).crossProduct(up);
  // const angleToLock = position.sub(lookAt).normalize().dotProduct(lookAt.add(verticalAxis).normalize());
  // console.log(angleToLock)
  // if (angleToLock > 0.999 && deltaY < 0) {
  //   deltaY = 0;
  // }
  // console.log(angleToLock);
  // if (deltaY < 0) {
  //   const angleToLock = Math.abs(Fig.tools.g2.threePointAngleMin(verticalAxis, lookAt, position));
  //   console.log(angleToLock)
  //   deltaY = Math.max(-angleToLock + 0.1, deltaY);
  // }
  // if (angleToLock < -0.99 && deltaY < 0) {
  //   deltaY = 0;
  // }
  const matrix = new Fig.Transform().rotate(deltaX, panAxis).rotate(deltaY, tiltAxis).matrix();
  const newPosition = position.transformBy(matrix);

  figure.scene.setCamera({
    position: newPosition,
  });
  pan.transform.updateTranslation([0, 0, 0]);
});