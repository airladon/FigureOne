
/* globals Fig, Recorder, TimeKeeper */
const { Transform, Point } = Fig;
const { range, rand, randSign } = Fig.tools.math;
// const figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1] });


const figure = new Fig.Figure({
  limits: [-2, 0, 4, 3],
  color: [0.3, 0.3, 0.3, 1],
  font: { size: 0.1 },
});

let f = 0.3;     // Hz
const A = 0.5;   // m
let c = 1;       // m/s
const minVelocity = 0.5;
const time = new TimeKeeper();

const shortXRange = 5;
const longXRange = 5 / 1.75 * 3;
const equationPosition = new Point(0, 2.2);
const sideEquationPosition = new Point(1.4, 2.5);
const colorText = [0.3, 0.3, 0.3, 1];
const color0 = [1, 0, 0, 1];
const color1 = [0, 0.5, 1, 1];
const color2 = [0.4, 0.4, 0.4, 1];

const button = (name, position, text) => ({
  name,
  method: 'collections.rectangle',
  options: {
    button: true,
    line: { width: 0.005 },
    label: { text },
    width: 0.35,
    height: 0.2,
    corner: { radius: 0.03, sides: 3 },
    position,
  },
  mods: {
    isTouchable: true,
  },
});

const label = (name, position, text) => ({
  name,
  method: 'primitives.text',
  options: {
    text,
    position,
    font: { size: 0.08, color: [0.5, 0.5, 0.5, 1] },
    xAlign: 'center',
  },
});

figure.add([
  button('pulseButton', [-1.7, 0.2], 'Pulse'),
  button('sineButton', [-1.3, 0.2], 'Sine'),
  button('resetButton', [-0.9, 0.2], 'Reset'),
  button('freezeTimeButton', [-0.2, 0.2], 'Running'),
  button('slowTimeButton', [0.2, 0.2], 'Normal'),
  button('showTimeButton', [0.6, 0.2], 'Show'),
  button('velocityButton', [1.3, 0.2], 'Normal'),
  button('frequencyButton', [1.7, 0.2], '3s'),
  label('disturbanceLabel', [-1.3, 0.4], 'Disturbance'),
  label('timeLabel', [0.2, 0.4], 'Time'),
  label('velocityLabel', [1.3, 0.4], 'Velocity'),
  label('frequencyLabel', [1.7, 0.4], 'Period'),
]);

const resetButton = figure.getElement('resetButton');
const pulseButton = figure.getElement('pulseButton');
const sineButton = figure.getElement('sineButton');
const freezeButton = figure.getElement('freezeTimeButton');
const slowTimeButton = figure.getElement('slowTimeButton');
const velocityButton = figure.getElement('velocityButton');
const frequencyButton = figure.getElement('frequencyButton');
const showTimeButton = figure.getElement('showTimeButton');
// const recordingLine = spacePlot.getElement('recordingLine');

const pause = () => {
  time.pause();
  freezeButton.setLabel('Frozen');
};
const unpause = () => {
  freezeButton.setLabel('Running');
  time.unpause();
};


const xAxis = (name, title, units, length, maxValue) => ({
  name,
  method: 'collections.axis',
  options: {
    start: 0,
    stop: maxValue + 0.5,
    length,
    line: { width: 0.005 },
    // ticks: { step: 1, length: 0.1 },
    // labels: [
    //   { font: { size: 0.08 }, text: [''], precision: 0 },
    //   {
    //     values: 0, text: '0', offset: [-0.1, 0.13], font: { size: 0.08 },
    //   },
    // ],
    title: {
      font: { style: 'italic', family: 'serif', size: 0.12 },
      text: [title, { font: { size: 0.06 }, lineSpace: 0.08, text: units }],
      position: [length - 0.05, -0.04],
    },
  },
});

const yAxis = (name, title, units) => ({
  name: 'yAxis',
  method: 'collections.axis',
  options: {
    axis: 'y',
    start: -A - 0.05,
    stop: A + 0.05,
    length: A * 2 + 0.1,
    line: { width: 0.005 },
    position: [0, -A - 0.05],
    title: {
      font: { style: 'italic', family: 'serif', size: 0.12 },
      text: [title, { font: { size: 0.06 }, lineSpace: 0.08, text: units }],
      rotation: 0,
      offset: [0.1, A + 0.1],
    },
  },
});

const ball = (x, index, radius, sides = 20) => ({
  name: `ball${index}`,
  method: 'primitives.polygon',
  options: {
    sides,
    radius,
    transform: new Transform().translate(x, 0),
    color: color2,
    position: [x, 0],
  },
  mods: {
    dimColor: [0.7, 0.7, 0.7, 1],
  },
});

const addMedium = (name, length, maxValue) => {
  figure.add({
    name,
    method: 'collection',
    options: {
      transform: new Transform().translate(0, 0),
    },
    elements: [
      xAxis('xAxis', 'x', 'meters', length, maxValue),
      yAxis('yAxis', 'y', 'meters'),
      {
        name: 'balls',
        method: 'collection',
        options: {
          transform: new Transform(),
        },
      },
      {
        name: 'movePad',
        method: 'primitives.polygon',
        options: {
          radius: 0.4,
          sides: 8,
          color: [0, 0, 0, 0],
        },
        mods: {
          // isMovable: true,
          move: {
            bounds: {
              translation: {
                left: 0, right: 0, bottom: -A, top: A,
              },
            },
          },
        },
      },
    ],
    mods: {
      scenarios: {
        default: { position: [-1.5, 1.5], scale: 1 },
        small: { position: [0.1, 1.5], scale: 1 },
      },
    },
  });
  const medium = figure.getElement(name);
  medium.custom.constants = {
    f: 0.3,
    A: 0.6,
    c: 1,
  };
  const axis = medium.getElement('xAxis');
  const ballSize = 0.02;
  const xValues = range(0, length * 0.9, ballSize * 2);
  const balls = medium.getElement('balls');
  xValues.forEach((x, index) => {
    // const drawX = axis.valueToDraw(x);
    balls.add(ball(x, index, ballSize));
    const b = balls.getElement(`ball${index}`);
    b.custom.x = axis.drawToValue(x);
    b.custom.drawX = x;
  });
  const movePad = medium.getElement('movePad');
  medium.custom = {
    f: 0.3,
    A: 0.6,
    c: 1,
    data: new Recorder(maxValue / minVelocity),
    update: (deltaTime) => {
      const { y } = movePad.transform.order[2];
      medium.custom.data.record(y, deltaTime);
      for (let i = 0; i < xValues.length; i += 1) {
        const b = balls[`_ball${i}`];
        const by = medium.custom.data.getValueAtTimeAgo((b.custom.x) / medium.custom.c);
        b.setPosition(b.custom.drawX, by);
      }
    },
    stop: () => {
      medium.stop();
      movePad.animations.cancel('_noStop_sine');
    },
    reset: () => {
      medium.custom.stop();
      movePad.setPosition(0, 0);
      medium.custom.data.reset(0);
    },
    setTimeSpeed: (speed) => {
      movePad.animations.setTimeSpeed(speed);
    },
    setVelocity: (velocity) => {
      medium.custom.c = velocity;
    },
    setFrequency: (frequency) => {
      medium.custom.f = frequency;
    },
    movePad,
  };
  movePad.subscriptions.add('setTransform', () => {
    if (movePad.state.isBeingMoved && movePad.isAnimating()) {
      medium.custom.stop();
    }
    unpause();
  });
  return medium;
};

const addTimePlot = (name, length, maxValue) => {
  figure.add({
    name,
    method: 'collection',
    elements: [
      xAxis('xAxis', 't', 'seconds', length, maxValue),
      yAxis('yAxis', 'y', 'meters'),
      {
        name: 'trace',
        method: 'polyline',
        options: {
          simple: true,
          width: 0.01,
          color: color0,
        },
      },
    ],
    mods: {
      scenarios: {
        default: { position: [-1.5, 2], scale: 1 },
        smallold: { position: [-0.6, 0.8], scale: 1 },
        small: { position: [-1.85, 1.5], scale: 1 },
      },
    },
  });
  const timePlot = figure.getElement(name);
  const axis = timePlot.getElement('xAxis');
  const trace = timePlot.getElement('trace');
  timePlot.custom.recording = new Recorder(maxValue);
  timePlot.custom.update = () => {
    const recorded = timePlot.custom.recording.getRecording();
    const points = Array(recorded.time.length);
    for (let i = 0; i < points.length; i += 1) {
      points[i] = new Point(axis.valueToDraw(recorded.time[i]), recorded.data[i]);
    }
    trace.custom.updatePoints({ points });
  };
  return timePlot;
};
/*
.......##..........###....##....##..#######..##.....##.########
.......##.........##.##....##..##..##.....##.##.....##....##...
.......##........##...##....####...##.....##.##.....##....##...
.......##.......##.....##....##....##.....##.##.....##....##...
.......##.......#########....##....##.....##.##.....##....##...
.......##.......##.....##....##....##.....##.##.....##....##...
.......########.##.....##....##.....#######...#######.....##...
*/


// // Add the Space Axis
// figure.add({
//   name: 'spacePlot',
//   method: 'collection',
//   elements: [
//     xAxis('xAxis', 'x', 'meters', 3, longXRange),
//     xAxis('xAxisSmall', 'x', 'meters', 1.75, shortXRange),
//     yAxis('yAxis', 'y', 'meters'),
//     { name: 'balls', method: 'collection' },
//     {
//       name: 'movePad',
//       method: 'primitives.polygon',
//       options: {
//         radius: 0.4,
//         sides: 8,
//         color: [0, 0, 0, 0],
//       },
//       mods: {
//         isMovable: true,
//         move: {
//           bounds: {
//             translation: {
//               left: 0, right: 0, bottom: -A, top: A,
//             },
//           },
//         },
//       },
//     },
//     {
//       name: 'recordingLine',
//       method: 'primitives.line',
//       options: {
//         width: 0.005,
//         color: color0,
//       },
//     },
//   ],
//   mods: {
//     scenarios: {
//       default: { position: [-1.5, 1.5], scale: 1 },
//       small: { position: [0.1, 1.5], scale: 1 },
//     },
//   },
// });

// // Add the Time Axis
// figure.add({
//   name: 'timePlot',
//   method: 'collection',
//   elements: [
//     xAxis('xAxis', 't', 'seconds', 1.75, 5),
//     yAxis('yAxis', 'y', 'meters'),
//     {
//       name: 'trace',
//       method: 'polyline',
//       options: {
//         simple: true,
//         width: 0.01,
//         color: color0,
//       },
//     },
//   ],
//   mods: {
//     scenarios: {
//       default: { position: [-1.5, 2], scale: 1 },
//       smallold: { position: [-0.6, 0.8], scale: 1 },
//       small: { position: [-1.85, 1.5], scale: 1 },
//     },
//   },
// });


// const spacePlot = figure.getElement('spacePlot');
// const spaceX = spacePlot.getElement('xAxis');
// const spaceXSmall = spacePlot.getElement('xAxisSmall');
// const balls = spacePlot.getElement('balls');



// const data = new Recorder();
// let enableMaxTime = false;
// let timeMax = false;
// let maxRecordTime = 5;

// const ballSize = 0.12;
// const xValues = range(0, longXRange, ballSize);
// xValues.forEach((x, index) => {
//   const drawX = spaceX.valueToDraw(x);
//   figure.add(ball(drawX, index));
//   const b = balls.getElement(`ball${index}`);
//   b.custom.x = x;
//   b.custom.drawX = drawX;
//   b.custom.drawXSmall = spaceXSmall.valueToDraw(x);
// });
// const b0 = balls.getElement('ball0');
// balls.toFront(['ball0']);
// b0.setColor(color0);
// const longBalls = [];
// const minIndex = Math.floor(shortXRange / ballSize) + 1;
// const maxIndex = Math.floor(longXRange / ballSize);
// for (let i = minIndex; i <= maxIndex; i += 1) {
//   longBalls.push(balls.getElement(`ball${i}`));
// }

const medium1 = addMedium('medium1', 1.8, 5);
const medium2 = addMedium('medium2', 1.8, 5);
const timePlot1 = addTimePlot('timePlot1', 2, 5);
medium1.setPosition(0.1, 1.9);
medium2.setPosition(0.1, 0.8);
medium1.custom.movePad.setMovable();
medium2.custom.movePad.setMovable();
// medium1.custom.c = 2;
medium1.custom.f = 0.5;
timePlot1.setPosition(0, 0);
// medium1.hide();
// medium2.hide();
timePlot1.hide();
/*
........######...#######..##....##.########.########...#######..##......
.......##....##.##.....##.###...##....##....##.....##.##.....##.##......
.......##.......##.....##.####..##....##....##.....##.##.....##.##......
.......##.......##.....##.##.##.##....##....########..##.....##.##......
.......##.......##.....##.##..####....##....##...##...##.....##.##......
.......##....##.##.....##.##...###....##....##....##..##.....##.##......
........######...#######..##....##....##....##.....##..#######..########
*/
// const timePlot = figure.getElement('timePlot');
// const timeTrace = timePlot.getElement('trace');
// const timeX = timePlot.getElement('xAxis');
// const movePad = spacePlot.getElement('movePad');

const stop = () => {
  medium1.custom.stop();
  medium2.custom.stop();
  figure.stop();
  // movePad.animations.cancel('_noStop_sine');
};
const reset = () => {
  stop();
  medium1.custom.reset();
  medium2.custom.reset();
  time.reset();
  pause();
};
// const timeAxisShow = () => {
//   pause();
//   spaceX.hide();
//   spaceXSmall.showAll();
//   showTimeButton.setLabel('Hide');
//   spacePlot.setScenario('small');
//   timePlot.showAll();
//   longBalls.forEach(b => b.hide());
//   reset();
//   recordingLine.show();
// };
// const timeAxisHide = () => {
//   pause();
//   spaceX.showAll();
//   spaceXSmall.hide();
//   timePlot.hide();
//   showTimeButton.setLabel('Show');
//   spacePlot.setScenario('default');
//   longBalls.forEach(b => b.show());
//   reset();
//   recordingLine.hide();
// };
const setTimeSpeed = (timeSpeed, buttonLabel) => {
  // unpause();
  time.setTimeSpeed(timeSpeed);
  // medium1.setTimeSpeed(timeSpeed);
  // medium2.setTimeSpeed(timeSpeed);
  // movePad.animations.setTimeSpeed(timeSpeed);
  slowTimeButton.setLabel(buttonLabel);
};
// const setVelocity = (velocity, buttonLabel) => {
//   reset();
//   c = velocity;
//   velocityButton.setLabel(buttonLabel);
// };
// const setFrequency = (frequency, buttonLabel) => {
//   // reset();
//   f = frequency;
//   frequencyButton.setLabel(buttonLabel);
// };


// movePad.subscriptions.add('setTransform', () => {
//   if (enableMaxTime && timeMax) {
//     return;
//   }
//   if (movePad.state.isBeingMoved && movePad.isAnimating()) {
//     stop();
//   }
//   unpause();
// });


// Update function for everytime we want to update the signal
function update() {
  // if (!spacePlot.isShown) {
  //   return;
  // }
  const deltaTime = time.step();
  if (medium1.isShown) {
    medium1.custom.update(deltaTime);
  }
  if (medium2.isShown) {
    medium2.custom.update(deltaTime);
  }
  if (timePlot1.isShown) {
    timePlot1.custom.update();
  }
  // const { y } = movePad.transform.order[2];
  // data.record(y, deltaTime);
  // if (enableMaxTime && time.now() > maxRecordTime && timeMax === false) {
  //   timeMax = true;
  //   pause();
  //   resetButton.pulse({ scale: 1.1, duration: 10000, frequency: 1.5 });
  // }
  // for (let i = 0; i < xValues.length; i += 1) {
  //   const b = balls[`_ball${i}`];
  //   if (b.isShown) {
  //     const by = data.getValueAtTimeAgo((b.custom.x) / c);
  //     if (spaceX.isShown) {
  //       b.setPosition(b.custom.drawX, by);
  //     } else if (spaceXSmall.isShown) {
  //       b.setPosition(b.custom.drawXSmall, by);
  //     }
  //   }
  // }
  // if (timePlot.isShown) {
  //   const trace = data.getRecording();
  //   const points = Array(trace.time.length);
  //   // console.log(trace.time.slice(-3, -1))
  //   for (let i = 0; i < points.length; i += 1) {
  //     points[i] = new Point(timeX.valueToDraw(trace.time[i]), trace.data[i]);
  //   }
  //   timeTrace.custom.updatePoints({ points });

  //   if (Math.abs(y) < 0.01) {
  //     recordingLine.hide();
  //   } else {
  //     recordingLine.show();
  //     const lastTime = trace.time.slice(-1)[0];
  //     const draw = timeX.valueToDraw(lastTime) - 1.95;
  //     recordingLine.custom.updatePoints({ p1: [draw, y], p2: [0, y] });
  //   }
  // }
}

// Before each draw, update the points
figure.subscriptions.add('beforeDraw', () => {
  update();
});

// After each draw, call a next animation frame so udpates happen on each frame
figure.subscriptions.add('afterDraw', () => {
  figure.animateNextFrame();
});


resetButton.onClick = () => reset();

// showTimeButton.onClick = () => {
//   pause();
//   if (spaceX.isShown) {
//     timeAxisShow();
//   } else {
//     timeAxisHide();
//   }
//   reset();
// };

freezeButton.onClick = () => {
  if (time.isPaused()) unpause(); else pause();
};

slowTimeButton.onClick = () => {
  // unpause();
  if (time.getTimeSpeed() === 1) {
    setTimeSpeed(0.3, 'Slow');
  } else {
    setTimeSpeed(1, 'Normal');
  }
};

// velocityButton.onClick = () => {
//   reset();
//   time.pause();
//   if (c === 0.5) {
//     setVelocity(1, 'Normal');
//   } else if (c === 1) {
//     setVelocity(2, 'Fast');
//   } else {
//     setVelocity(0.5, 'Slow');
//   }
// };
// frequencyButton.onClick = () => {
//   reset();
//   time.pause();
//   if (f === 0.555) {
//     setFrequency(0.3, '3s');
//   } else {
//     setFrequency(0.555, '2s');
//   }
// };
// timeAxisShow();

const symmetricPulse = (movePad, resetSignal, amplitude = randSign() * rand(0.3, 0.6)) => {
  if (resetSignal) {
    reset();
  }
  unpause();
  const startTime = time.now();
  movePad.animations.new('_noStop_sine')
    .custom({
      callback: () => {
        if (!time.isPaused()) {
          const t = time.now() - startTime;
          movePad.setPosition(0, A * amplitude * Math.exp(-(((t - 0.6) * 4 - t) ** 2)));
        }
      },
      duration: 10000,
    })
    .start();
};

const sineWave = (med, delay = 0, resetSignal = true) => {
  // if (resetSignal) {
  //   reset();
  // }
  // unpause();
  const movePad = med.custom.movePad;
  movePad.animations.new('_noStop_sine')
    .delay(delay)
    .custom({
      callback: () => {
        if (!time.isPaused()) {
          const t = time.now();
          movePad.setPosition(0, A * 0.8 * Math.sin(2 * Math.PI * med.custom.f * t));
        }
      },
      duration: 10000,
    })
    .start();
};

const assymetricPulse = (movePad, resetSignal = true) => {
  // if (resetSignal) {
  //   reset();
  // }
  // unpause();
  // stop();
  const startTime = time.now();
  movePad.animations.new()
    .custom({
      callback: () => {
        if (!time.isPaused()) {
          const t = time.now() - startTime;
          let scaler = 4;
          let amp = 0.6;
          if (t - 0.65 > 0) {
            scaler = (4 - (t - 0.65) * 2);
            amp = 0.6 - (t - 0.65) * 0.2;
          }
          movePad.setPosition(0, A * amp * Math.exp(-(((t - 0.6) * scaler - t) ** 2)));
        }
      },
      duration: 10000,
    })
    .start();
  // movePad.animations.new()
  //   .custom({
  //     callback: () => {
  //       if (!time.isPaused()) {
  //         const deltaT = time.now() - startTime;
  //         const Y = 0.3;
  //         const t1 = 0.4;
  //         const t2 = 1.5;
  //         if (deltaT < t1) {
  //           movePad.setPosition(0, Y * (deltaT / t1));
  //         } else if (deltaT < t2 + t1) {
  //           movePad.setPosition(0, Y - (Y * (deltaT - t1) / t2));
  //         }
  //       }
  //     },
  //     duration: 10000,
  //   })
  //   .start();
};

pulseButton.onClick = () => {
  // if (resetSignal) {
  //   reset();
  // }
  unpause();
  stop();
  symmetricPulse(medium1.custom.movePad, false, 0.5);
  symmetricPulse(medium2.custom.movePad, false, 0.5);
};
sineButton.onClick = () => {
  reset();
  unpause();
  stop();
  sineWave(medium1);
  sineWave(medium2);
};

// balls.highlight([
//   'ball0', 'ball10', 'ball20', 'ball30', 'ball40', 'ball50', 'ball60', 'ball70',
// ]);

// spacePlot.setScenario('small');
// spaceXSmall.show();
// spaceX.hide();
// timePlot.show();
// timePlot.setScenario('small');
// enableMaxTime = true;

/**
  Why does c = lf for a travelling sine wave?
  
  A wave is a disturbance that propagates through a medium or field.

  >>The disturbance propagates through the medium without moving the medium in the direction of the wave.

  The velocity of the disturbance changes how it is distributed in space. Make the velocity faster or slower to see how it changes.

  If the disturbance travels faster, the distribution of the disturbance in space is more spread out.

  If the disturbance travels slower, the distribution of the disturbance in space is more compressed.

  When the disturbance travels with a velocity v, then in time t1 it will travel a distance x1 where:
        x1 = vt1

  If we know the disturbance at x0 is:
  y(x0, t) = f(t)

  Then, the disturbance at x1 is the disturbance at x0 from time t1 ago.
  >>Assuming the disturbance doesn't attenuate significantly
  y(x1, t) = y(x0, t-t1) = f(t - t1)

  Now, let's say we know our disturbance at x0 is a sine function:
  y(x0, t) = f(t) = sin(wt)

  Then at some point x1, our disturbance will be:
  y(x1, t) = f(t - t1) = sin(w(t - t1))
  y(x1, t) = sin(wt - wt1)
  y(x1, t) = sin(wt - wx1/c)

  Or as x1 is arbitrary we can say:
  y(x, t) = sin(wt - wx/c)

  Now, let's freeze time and take a snapshot of how the disturbance is distributed through space.

  Our resulting equation is simply a general form of a sine equation over x where wt is a constant phase shift, and the negative sign signifies an additional phase shift of π.







  f(t-x1/c)
  Now, let's assume our disturbance at x0 is a sine function
  y(x0, t) = sin(wt)

  Then our 

  Now, let's assume the particle at x0 is disturbed with a sine function:
  y(x0, t) = sin(wt)

  Therefore, the disturbance at x1 is:
  y(x1, t) = sin(w(t-t1))
  y(x1, t) = sin(wt-wt1))

  Substituting in (1)
  y(x1, t) = sin(wt - wx1/v)

  Freeze

  Slow/Normal Time

  Slow/Normal Velocity

  Show Time Recording

  Pulse

  Sine Wave



 */

 
// const x = Fig.tools.math.range(-10, 10, 0.01);
// const t = Fig.tools.math.range(0, 5, 0.01);
// const ft = (tt) => Math.exp(-((tt*2 - 2) ** 2));
// // const ft = (tt) => {
// //   if (tt < 0) {
// //     return 0;
// //   }
// //   if (tt < 1.5) {
// //     return tt / 3;
// //   }
// //   if (tt < 2) {
// //     return 1.5 / 3 - (tt - 1.5);
// //   }
// //   return 0;
// // };
// const ftPoints = t.map(tt => new Point(tt, ft(tt)));
// // const v = 2;
// // const tNow = 4;
// // // const fxPoints = x.map(xx => xx <= 0 ? new Point(xx, ft(tNow + xx / v)) : new Point(xx, ft(tNow - xx / v)));
// // const fxPoints = x.map(xx => xx <= 1 ? new Point(xx, ft(tNow + (xx - 1) / v)) : new Point(xx, ft(tNow - (xx - 1) / v)));
// // const v = 1;
// // const tNow = 1;
// // const fxtNow = t.map(tt => {

// // });

// figure.add({
//   name: 'plot',
//   method: 'collections.plot',
//   options: {
//     trace: ftPoints,
//     width: 1,
//     yAxis: {
//       start: -0.5,
//       stop: 1,
//       ticks: { step: 0.25 },
//     },
//     xAxis: { ticks: { step: 0.5 }, labels: { precision: 1 } },
//     position: [-1.5, 1],
//   },
// });

// figure.add({
//   name: 'plotX',
//   method: 'collections.plot',
//   options: {
//     trace: fxPoints,
//     width: 2,
//     yAxis: {
//       start: -0.5,
//       stop: 1,
//       ticks: { step: 0.25 },
//       labels: { precision: 2 },
//     },
//     xAxis: { ticks: { step: 2 }, labels: { precision: 1 }, stop: 10 },
//     position: [0, 1],
//   },
// });
