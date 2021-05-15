/* globals Fig */
const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [1, 1, 0.9, 1],
});
const { rand } = Fig.tools.math;

// // Add n polygons, each of which has a random size, start position and
// // velocity. They move freely and bounce off the figure boundaries without
// // deceleration.
// const n = 1;
// for (let i = 0; i < n; i += 1) {
//   const r = rand(0.1, 0.2);
//   const e = figure.add({
//     make: 'polygon',
//     radius: r,
//     sides: 100,
//     color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
//     rotation: Math.PI / 4,
//     transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
//     mods: {
//       move: {
//         freely: { deceleration: 0, bounceLoss: 0 },
//         bounds: 'figure',
//       },
//       state: {
//         movement: { velocity: [['t', rand(-0.3, 0.3), rand(-0.3, 0.3)]] },
//       },
//     },
//   });
//   e.startMovingFreely();
// }

// for (let i = 0; i < 150; i += 1) {
//   const r = rand(0.1, 0.2);
//   figure.add({
//     make: 'polygon',
//     radius: r,
//     sides: 100,
//     color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
//     // position: [rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)],
//     transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
//   });
// }


// // Add a frame rate annotation to the figure showing average and worst case
// // frame rate in last 10 frames
// figure.addFrameRate(10);

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

for (let i = 0; i < 1; i += 1) {
  const r = rand(0.1, 0.2);
  const p = [rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)];
  const e = figure.add({
    make: 'polygon',
    radius: r,
    sides: 20,
    color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
    transform: [['t', p[0], p[1]]],
    mods: {
      simple: true,
      custom: { velocity: [rand(-0.55, -0.45), rand(-0.55, 0.15)]},
      state: {
        // movement: { velocity: [['t', rand(-0.15, 0.15), rand(-0.15, 0.15)]] },
        isChanging: true,
      },
    },
  });
  // e.decelerate = (deltaTime) => {
  //   const velocity = e.state.movement.velocity._dup();
  //   const transform = e.transform._dup();
  //   transform.order[0].x += velocity.order[0].x * deltaTime;
  //   transform.order[0].y += velocity.order[0].y * deltaTime;
  //   if (transform.order[0].x <= -3 + r) {
  //     velocity.order[0].x = Math.abs(velocity.order[0].x);
  //   }
  //   if (transform.order[0].x >= 3 - r) {
  //     velocity.order[0].x = -Math.abs(velocity.order[0].x);
  //   }
  //   if (transform.order[0].y <= -2.7 + r) {
  //     velocity.order[0].y = Math.abs(velocity.order[0].y);
  //   }
  //   if (transform.order[0].y >= 3 - r) {
  //     velocity.order[0].y = -Math.abs(velocity.order[0].y);
  //   }
  //   // let k = 0;
  //   // for (let j = 0; j < 1000000; j += 1) {
  //   //   k += 1;
  //   // }
  //   return {
  //     velocity,
  //     transform,
  //     duration: 0,
  //   };
  // };
  e.setupDraw = (now) => {
    if (e.customState.lastTime == null) {
      e.customState.lastTime = now;
    }
    // const now = now / 1000;
    const deltaTime = now - e.customState.lastTime;
    e.customState.lastTime = now;
    const { velocity } = e.custom;
    const { transform } = e;
    transform.order[0].x += velocity[0] * deltaTime;
    transform.order[0].y += velocity[1] * deltaTime;
    if (transform.order[0].x <= -3 + r) {
      velocity[0] = Math.abs(velocity[0]);
    }
    if (transform.order[0].x >= 3 - r) {
      velocity[0] = -Math.abs(velocity[0]);
    }
    if (transform.order[0].y <= -3 + r) {
      velocity[1] = Math.abs(velocity[1]);
    }
    if (transform.order[0].y >= 3 - r) {
      velocity[1] = -Math.abs(velocity[1]);
    }
  };
  e.custom.startTime = null;
  e.setupDraw = (now) => {
    const mod = (a, b) => a % b;
    if (e.custom.startTime == null) {
      e.custom.startTime = figure.timeKeeper.now();
    }
    if (e.customState.lastTime == null) {
      e.customState.lastTime = now;
    }
    const u_time = (figure.timeKeeper.now() - e.custom.startTime) / 1000;
    // const now = now / 1000;
    // const deltaTime = now - e.customState.lastTime;
    e.customState.lastTime = now;
    const a_vel = Fig.getPoint(e.custom.velocity);
    const a_position = Fig.getPoint(p);
    let xDirection = 1.0;
    if (a_vel.x < 0.0) {
      xDirection = -1.0;
    }
    const xOffset = Math.abs(a_position.x - xDirection * 3.0);
    const xTotalDistance = Math.abs(a_vel.x * u_time);
    let xNumBounces = 0;
    if (xTotalDistance > xOffset) {
      xNumBounces = 1;
    }
    xNumBounces += Math.floor(Math.abs((xTotalDistance - xOffset)) / 6.0);
    const xLastDirection = (mod(xNumBounces, 2.0) === 0.0) ? xDirection : -xDirection;
    let xLastWall = a_position.x;
    let xRemainderDistance = xTotalDistance;
    if (xNumBounces > 0.0) {
      xLastWall = (mod(xNumBounces, 2.0) == 0.0) ? -xDirection * 3.0 : xDirection * 3.0;
      xRemainderDistance = mod(xTotalDistance - xOffset, 6.0);
    }
    // console.log(p[0], xOffset, xDirection, xTotalDistance, xNumBounces, xLastWall, xRemainderDistance)
    const x = xLastWall + xRemainderDistance * xLastDirection;
    e.transform.order[0].x = x;
    // console.log(x)
    // console.log(x)
    // float xDirection = 1.0;
    // if (a_vel.x < 0.0) {
    //   xDirection = -1.0;
    // }
    // float xOffset = a_position.x - xDirection * 3.0;
    // float xTotalDistance = a_vel.x * u_time;
    // float xNumBounces = floor((xTotalDistance - abs(xOffset)) / 6.0);
    // float xLastDirection = (mod(xNumBounces, 2.0) == 0.0) ? xDirection : -xDirection;
    // float xLastWall = a_position.x;
    // float xRemainderDistance = xTotalDistance;
    // if (xNumBounces > 0.0) {
    //   xLastWall = (mod(xNumBounces, 2.0) == 0.0) ? -xDirection * 3.0 : xDirection * 3.0;
    //   xRemainderDistance = mod(xTotalDistance - abs(xOffset), 6.0);
    // }
    // float x = xLastWall + xTotalDistance * xLastDirection;
  }

  e.draw = (now, parentTransform) => {
    const { x, y } = e.transform.order[0];
    const mat = Fig.tools.m2.mul(parentTransform[0].matrix(), [1, 0, x, 0, 1, y, 0, 0, 1]);
    e.drawingObject.drawWithTransformMatrix(
      mat, e.color, 0, e.drawingObject.numPoints,
    );
  };



  // e.startMovingFreely();
  // e.animations.new()
  //   .custom({
  //     callback: () => {
  //       if (e.customState.lastTime == null) {
  //         e.customState.lastTime = figure.timeKeeper.now() / 1000;
  //       }
  //       const now = figure.timeKeeper.now() / 1000;
  //       const deltaTime = now - e.customState.lastTime;
  //       e.customState.lastTime = now;
  //       const { velocity } = e.state.movement;
  //       const { transform } = e;

  //       transform.order[0].x += velocity.order[0].x * deltaTime;
  //       transform.order[0].y += velocity.order[0].y * deltaTime;
  //       if (transform.order[0].x <= -3 + radius) {
  //         velocity.order[0].x = Math.abs(velocity.order[0].x);
  //       }
  //       if (transform.order[0].x >= 3 - radius) {
  //         velocity.order[0].x = -Math.abs(velocity.order[0].x);
  //       }
  //       if (transform.order[0].y <= -3 + radius) {
  //         velocity.order[0].y = Math.abs(velocity.order[0].y);
  //       }
  //       if (transform.order[0].y >= 3 - radius) {
  //         velocity.order[0].y = -Math.abs(velocity.order[0].y);
  //       }
  //     },
  //     duration: 10,
  //   })
  //   .start();
}
figure.addFrameRate(20);
figure.elements.transform = new Fig.Transform();
// figure.setManualFrames();
figure.animateNextFrame();
