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

const quaternion = (a, b, c, d) => ({ a, b, c, d });
const pointToQaternion = p => {
  const pp = Fig.getPoint(p);
  return { a: 0, b: pp.x, c: pp.y, d: pp.z };
}
const angleAxisToQuaternion = (angle, x, y, z) => {
  const a = Math.cos(angle / 2);
  const u = Fig.getPoint([x, y, z]).normalize().scale(Math.sin(angle / 2));
  const b = u.x;
  const c = u.y;
  const d = u.z;
  return { a, b, c, d };
}

const qMul = (q1, q2) => {
  const a = q1.a * q2.a - q1.b * q2.b - q1.c * q2.c - q1.d * q2.d;
  const b = q1.a * q2.b + q1.b * q2.a + q1.c * q2.d - q1.d * q2.c;
  const c = q1.a * q2.c - q1.b * q2.d + q1.c * q2.a + q1.d * q2.b;
  const d = q1.a * q2.d + q1.b * q2.c - q1.c * q2.b + q1.d * q2.a;
  return { a, b, c, d };
}

const inv = (q) => {
  return { a: q.a, b: -q.b, c: -q.c, d: -q.d };
}

const transformPoint = (p, q) => {
  const pq = pointToQaternion(p);
  const qInv = inv(q);
  const p1 = qMul(q, qMul(pq, qInv));
  return Fig.getPoint([p1.b, p1.c, p1.d]);
}

const dt = (p, angle1, axis1, angle2, axis2) => {
  const q1 = angleAxisToQuaternion(angle1, ...axis1.toArray());
  const q2 = angleAxisToQuaternion(angle2, ...axis2.toArray());
  return transformPoint(p, qMul(q1, q2));
  // return transformPoint(p, q1);
}
// console.log(transformPoint([1, 0, 0], angleAxisToQuaternion(Math.PI / 2, 0, 0, 1)));

// pan.custom.last = pan.getPosition();
pan.notifications.add('setTransform', () => {
  const delta = pan.getPosition();
  const deltaX = -delta.x;
  let deltaY = delta.y;
  const lookAt = Fig.getPoint(figure.scene.camera.lookAt);
  const up = Fig.getPoint(figure.scene.camera.up);
  const position = Fig.getPoint(figure.scene.camera.position);

  let deltaAz = deltaX;
  let deltaEl = deltaY;


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
  // const tiltAxis = lookAt.sub(position).crossProduct(up).normalize();
  const tiltAxis = verticalAxis.crossProduct(position.sub(lookAt)).normalize();
  // const tiltAxis = verticalAxis.crossProduct([position.x, 0, position.z]);
  // const angleToLock = position.sub(lookAt).normalize().dotProduct(lookAt.add(verticalAxis).normalize());
  // console.log(angleToLock)
  // if (angleToLock > 0.999 && deltaY < 0) {
  //   deltaY = 0;
  // }
  // console.log(angleToLock);
  let deltaAngle = 0.001;
  let angleToLock = Math.abs(Math.acos(
    position.sub(lookAt).normalize()
      .dotProduct(lookAt.add(verticalAxis).normalize()),
  ));
  // console.log(angleToLock)
  // if (angleToLock > Math.PI / 2) {
  //   angleToLock = Math.PI - angleToLock;
  // }
  
  // console.log(angleToLock)
  if (deltaEl < 0 && angleToLock < Math.PI / 2) {
    // let angleToLock = Math.abs(Math.acos(
    //   position.sub(lookAt).normalize()
    //     .dotProduct(lookAt.add(verticalAxis).normalize()),
    // ));
    // if (angleToLock > Math.PI / 2) {
    //   angleToLock = Math.PI - angleToLock;
    // }
    if (deltaEl < -angleToLock + deltaAngle) {
      deltaEl = -angleToLock + deltaAngle;
    }
    // deltaEl = Fig.tools.math.round(Math.max(-angleToLock + deltaAngle, deltaEl), 4);
    // console.log(angleToLock, deltaEl)
  }
  if (deltaEl > 0 && angleToLock > Math.PI / 2) {
    // let angleToLock = Math.abs(Math.acos(
    //   position.sub(lookAt).normalize()
    //     .dotProduct(lookAt.add(verticalAxis).normalize()),
    // ));
    // if (angleToLock > Math.PI / 2) {
      angleToLock = Math.PI - angleToLock;
    // }
    deltaEl = Fig.tools.math.round(Math.min(angleToLock - deltaAngle, deltaEl), 4);
  }
  
  const t = [['r', deltaAz, ...panAxis.toArray()], ['r', deltaEl, ...tiltAxis.toArray()]];
  // if (deltaEl > 0.0001 || deltaEl < -0.0001) {
  //   t.push(['r', deltaY, ...tiltAxis.toArray()]);
  // }
  // console.log(deltaX, deltaY)
  // const matrix = new Fig.Transform().rotate(deltaX, panAxis).rotate(deltaY, tiltAxis).matrix();
  const matrix = Fig.getTransform(t).matrix();
  // const newPosition = position.transformBy(matrix);
  // const newPosition = dt(position, deltaEl, tiltAxis, deltaAz, panAxis);
  // const newUp = dt(up, deltaEl, tiltAxis, deltaAz, panAxis);
  const newPosition = dt(position, deltaAz, panAxis, deltaEl, tiltAxis);
  const newUp = dt(up, deltaAz, panAxis, deltaEl, tiltAxis);


  // console.log('before', tiltAxis.round(2).toArray(), position.round(5).toArray(), lookAt.sub(position).round(4).toArray())

  figure.scene.setCamera({
    position: newPosition,
    // up: newUp,
  });
  pan.transform.updateTranslation([0, 0, 0]);

  // console.log('after', lookAt.sub(Fig.getPoint(figure.scene.camera.position)).crossProduct(up).normalize().round(2).toArray(), newPosition.round(5).toArray(), lookAt.sub(newPosition).round(4).toArray())
});