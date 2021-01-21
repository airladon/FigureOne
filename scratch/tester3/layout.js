
/* globals Fig, Recorder, TimeKeeper */
// const figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1] });


const figure = new Fig.Figure({
  limits: [-3, 0, 6, 3],
  color: [0.3, 0.3, 0.3, 1],
  font: { size: 0.1 },
});

const colorText = [0.3, 0.3, 0.3, 1];
const color0 = [1, 0, 0, 1];
const color1 = [0, 0.5, 1, 1];
const color2 = [0.4, 0.4, 0.4, 1];

function setupFigure() {
  const { Transform, Point } = Fig;
  const { range, rand, randSign } = Fig.tools.math;

  // let f = 0.3;     // Hz
  // const A = 0.4;   // m
  // let c = 1;       // m/s
  const minVelocity = 0.5;
  const time = new TimeKeeper();
  let maxTime = 0;
  let maxTimeReached = false;

  // const equationPosition = new Point(0, 2.2);
  // const sideEquationPosition = new Point(1.4, 2.5);
  // const colorText = [0.3, 0.3, 0.3, 1];
  figure.add({
    name: 'title',
    method: 'primitives.textLines',
    options: {
      text: [
        'Traveling Sine Waves',
        {
          text: 'Velocity, wavelength and frequency relationship.',
          font: { size: 0.15 },
        },
      ],
      font: { size: 0.25, color: colorText },
      xAlign: 'center',
      justify: 'center',
      position: [0, 2.6],
    },
  });
  // figure.add({
  //   name: 'subTitle',
  //   method: 'primitives.textLines',
  //   options: {
  //     text: 'Frequency, Wavelength and Velocity',
  //     font: { size: 0.1, color: colorText },
  //     xAlign: 'center',
  //     position: [0, 2],
  //   },
  // });
  const button = (name, position, text) => ({
    name,
    method: 'collections.rectangle',
    options: {
      button: true,
      line: { width: 0.005 },
      label: { text },
      width: 0.3,
      height: 0.2,
      corner: { radius: 0.03, sides: 3 },
      position,
    },
    mods: {
      isTouchable: true,
      touchBorder: [0.15, 0.05, 0.15, 0.15],
    },
  });

  const axisLabel = (name, position, col, text) => ({
    name,
    method: 'primitives.textLine',
    options: {
      text,
      position,
      font: {
        size: 0.13, color: col, family: 'Times New Roman', style: 'italic',
      },
      xAlign: 'center',
    },
  });

  const label = (name, position, col, text) => ({
    name,
    method: 'primitives.textLines',
    options: {
      text,
      position,
      font: { size: 0.09, color: col },
      xAlign: 'center',
      yAlign: 'middle',
    },
  });

  figure.add([
    button('pulseButton', [-1.7, 0.2], 'Pulse'),
    button('sineButton', [-1.3, 0.2], 'Sine'),
    button('resetButton', [-0.9, 0.2], 'Reset'),
    button('freezeTimeButton', [-1.6, 0.15], 'Off'),
    label('freezeTimeLabel', [-1.95, 0.15], colorText, 'Freeze:'),
    button('slowTimeButton', [-0.6, 0.15], 'Off'),
    label('slowTimeLabel', [-1.05, 0.15], colorText, ['Slow Motion:']),
    // button('velocityButton', [1.3, 0.2], 'Normal'),
    // button('frequencyButton', [1.7, 0.2], '3s'),
    // label('disturbanceLabel', [-1.3, 0.4], 'Disturbance'),
    // label('timeLabel', [0.2, 0.4], 'Time'),
    axisLabel('x0', [-2.1, 0.77], color0, [
      'x',
      { text: '0', font: { size: 0.1 }, offset: [0, -0.04] },
    ]),
    axisLabel('x1', [-0.38, 0.77], color1, [
      'x',
      { text: '1', font: { size: 0.1 }, offset: [0, -0.04] },
    ]),
    axisLabel('vFast', [2.1, 1.77], color1, [
      'fast',
    ]),
    axisLabel('vSlow', [2.1, 0.9], color1, [
      'slow',
    ]),
  ]);

  figure.add([
    {
      name: 'arrow1',
      method: 'collections.line',
      options: { width: 0.006, color: color1, arrow: { end: 'barb' } },
    },
    {
      name: 'arrow2',
      method: 'collections.line',
      options: { width: 0.006, color: color1, arrow: { end: 'barb' } },
    },
  ]);


  const resetButton = figure.getElement('resetButton');
  const pulseButton = figure.getElement('pulseButton');
  const sineButton = figure.getElement('sineButton');
  const freezeButton = figure.getElement('freezeTimeButton');
  const slowTimeButton = figure.getElement('slowTimeButton');
  // const velocityButton = figure.getElement('velocityButton');
  // const frequencyButton = figure.getElement('frequencyButton');
  // const recordingLine = spacePlot.getElement('recordingLine');

  const pause = () => {
    time.pause();
    freezeButton.setLabel('On');
  };
  const unpause = () => {
    freezeButton.setLabel('Off');
    time.unpause();
  };


  const xAxis = (name, title, units, length, maxValue) => ({
    name,
    method: 'collections.axis',
    options: {
      start: 0,
      stop: maxValue + 0.1,
      length,
      line: { width: 0.008, arrow: { end: 'barb' } },
      // ticks: { step: 1, length: 0.1 },
      // labels: [
      //   { font: { size: 0.08 }, text: [''], precision: 0 },
      //   {
      //     values: 0, text: '0', offset: [-0.1, 0.13], font: { size: 0.08 },
      //   },
      // ],
      title: {
        font: { style: 'italic', family: 'serif', size: 0.12 },
        text: [title, { font: { size: 0.06 }, lineSpace: 0.06, text: units }],
        position: [length - 0.03, -0.04],
      },
    },
  });

  const yAxis = (name, title, units, A, yAxisTitleSide) => ({
    name: 'yAxis',
    method: 'collections.axis',
    options: {
      axis: 'y',
      start: -A - 0.05,
      stop: A + 0.05,
      length: A * 2 + 0.1,
      line: { width: 0.008, arrow: 'barb' },
      position: [0, -A - 0.05],
      title: {
        font: { style: 'italic', family: 'serif', size: 0.12 },
        // text: [title, { font: { size: 0.06 }, lineSpace: 0.08, text: units }],
        text: {
          text: `${title} |unitsText|`,
          // text: title,
        },
        modifiers: {
          unitsText: { text: units, font: { size: 0.06 } },
        },
        xAlign: 'left',
        rotation: 0,
        offset: yAxisTitleSide ? [0, A - 0.06] : [0.05, A + 0.06],
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
      dimColor: [0.5, 0.5, 0.5, 1],
    },
  });

  const addMedium = (name, length, maxValue, A, defaultPosition, yAxisTitle) => {
    figure.add({
      name,
      method: 'collection',
      options: {
        transform: new Transform().scale(1, 1).translate(0, 0),
      },
      elements: [
        xAxis('xAxis', 'x', '', length, maxValue),
        yAxis('yAxis', 'y', '', A, yAxisTitle),
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
          default: { position: defaultPosition, scale: 1 },
          title: { position: [-2, 0.9], scale: 1 },
          small: { position: [0.1, 1.5], scale: 1 },
        },
      },
    });
    const medium = figure.getElement(name);
    // medium.custom.constants = {
    //   f: 0.3,
    //   A: 0.6,
    //   c: 1,
    // };
    const axis = medium.getElement('xAxis');
    const ballSize = 0.02;
    const xValues = range(0, length - 0.1, ballSize * 2);
    const balls = medium.getElement('balls');
    xValues.forEach((x, index) => {
      balls.add(ball(x, index, ballSize));
      const b = balls.getElement(`ball${index}`);
      b.custom.x = axis.drawToValue(x);
      b.custom.drawX = x;
      if (index % 10 === 0) { b.setColor(color1); }
      if (index === 0) { b.setColor(color0); }
    });
    balls.toFront(['ball0', 'ball40']);
    const movePad = medium.getElement('movePad');
    medium.custom = {
      f: 0.2,
      c: 1,
      A,
      balls,
      ball0: balls.getElement('ball0'),
      recording: new Recorder(maxValue / minVelocity),
      update: (deltaTime) => {
        const { y } = movePad.transform.order[2];
        medium.custom.recording.record(y, deltaTime);
        for (let i = 0; i < xValues.length; i += 1) {
          const b = balls[`_ball${i}`];
          const by = medium.custom.recording.getValueAtTimeAgo((b.custom.x) / medium.custom.c);
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
        medium.custom.recording.reset(0);
      },
      // setTimeSpeed: (speed) => {
      //   movePad.animations.setTimeSpeed(speed);
      // },
      setVelocity: (velocity) => {
        medium.custom.c = velocity;
      },
      setFrequency: (frequency) => {
        medium.custom.f = frequency;
      },
      movePad,
    };
    movePad.subscriptions.add('setTransform', () => {
      if (maxTimeReached) {
        return;
      }
      if (movePad.state.isBeingMoved && movePad.isAnimating()) {
        medium.custom.stop();
      }
      unpause();
    });
    return medium;
  };

  const addTimePlot = (name, length, maxValue, recording, A, defaultPosition) => {
    figure.add({
      name,
      method: 'collection',
      elements: [
        xAxis('xAxis', 't', '', length, maxValue),
        yAxis('yAxis', 'y', '', A, true),
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
          default: { position: defaultPosition, scale: 1 },
          smallold: { position: [-0.6, 0.8], scale: 1 },
          small: { position: [-1.85, 1.5], scale: 1 },
        },
      },
    });
    const timePlot = figure.getElement(name);
    const axis = timePlot.getElement('xAxis');
    const trace = timePlot.getElement('trace');
    // timePlot.custom.recording = new Recorder(maxValue);
    timePlot.custom.update = () => {
      const recorded = recording.getRecording();
      const points = Array(recorded.time.length);
      for (let i = 0; i < points.length; i += 1) {
        points[i] = new Point(axis.valueToDraw(recorded.time[i]), recorded.data[i]);
      }
      trace.custom.updatePoints({ points });
    };
    return timePlot;
  };


  const medium = addMedium('medium', 4, 10, 0.6, [-2, 0.9], false);
  const medium1 = addMedium('medium1', 2.2, 5, 0.35, [-0, 1.65], true);
  const medium2 = addMedium('medium2', 2.2, 5, 0.35, [-0, 0.8], true);
  const timePlot1 = addTimePlot('timePlot1', 1.5, 5, medium1.custom.recording, 0.35, [-2, 1.65]);
  const timePlot2 = addTimePlot('timePlot2', 1.5, 5, medium2.custom.recording, 0.35, [-2, 0.8]);
  // medium1.setPosition(-0.3, 1.9);
  // medium2.setPosition(-0.3, 0.8);
  medium1.custom.movePad.setMovable();
  medium2.custom.movePad.setMovable();
  medium1.custom.movePad.subscriptions.add('setTransform', () => {
    if (medium1.custom.movePad.state.isBeingMoved || medium1.custom.movePad.state.isMovingFreely) {
      medium2.custom.stop();
      medium2.custom.movePad.setPosition(medium1.custom.movePad.transform.t());
    }
  });
  medium2.custom.movePad.subscriptions.add('setTransform', () => {
    if (medium2.custom.movePad.state.isBeingMoved || medium2.custom.movePad.state.isMovingFreely) {
      medium1.custom.stop();
      medium1.custom.movePad.setPosition(medium2.custom.movePad.transform.t());
    }
  });
  medium1.custom.c = 2;
  // medium1.custom.f = 0.5;
  // timePlot1.setPosition(-1.9, 1.9);
  // timePlot2.setPosition(-1.9, 0.8);


  const stop = () => {
    medium1.custom.stop();
    medium2.custom.stop();
    figure.stop();
  };
  const reset = () => {
    stop();
    maxTimeReached = false;
    medium.custom.reset();
    medium1.custom.reset();
    medium2.custom.reset();
    time.reset();
    pause();
  };
  const setTimeSpeed = (timeSpeed, buttonLabel) => {
    time.setTimeSpeed(timeSpeed);
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
    if (maxTime > 0 && time.now() > maxTime) {
      maxTimeReached = true;
      pause();
      resetButton.pulse({ scale: 1.1, duration: 10000, frequency: 1.5 });
    }
    const deltaTime = time.step();
    if (medium.isShown) {
      medium.custom.update(deltaTime);
    }
    if (medium1.isShown) {
      medium1.custom.update(deltaTime);
    }
    if (medium2.isShown) {
      medium2.custom.update(deltaTime);
    }
    if (timePlot1.isShown) {
      timePlot1.custom.update();
    }
    if (timePlot2.isShown) {
      timePlot2.custom.update();
    }
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

  freezeButton.onClick = () => {
    if (time.isPaused()) unpause(); else pause();
  };

  slowTimeButton.onClick = () => {
    // unpause();
    if (time.getTimeSpeed() === 1) {
      setTimeSpeed(0.3, 'On');
    } else {
      setTimeSpeed(1, 'Off');
    }
  };

  const slowMotion = () => setTimeSpeed(0.3, 'On');
  const normalMotion = () => setTimeSpeed(1, 'Off');

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

  const pulse = (med, amplitude = randSign() * rand(0.3, 0.6)) => {
    unpause();
    const startTime = time.now();
    const { movePad, A } = med.custom;
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

  const sineWave = (med, delay = 0) => {
    unpause();
    const { movePad, A } = med.custom;
    const startTime = time.now();
    movePad.animations.new('_noStop_sine')
      .delay(delay)
      .custom({
        callback: () => {
          if (!time.isPaused()) {
            const t = time.now() - startTime;
            movePad.setPosition(0, A * 0.8 * Math.sin(2 * Math.PI * med.custom.f * t));
          }
        },
        duration: 10000,
      })
      .start();
  };

  const assymetricPulse = (med) => {
    unpause();
    const startTime = time.now();
    const { movePad, A } = med.custom;
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
  };

  pulseButton.onClick = () => {
    stop();
    unpause();
    pulse(medium1, 0.5);
    pulse(medium2, 0.5);
  };
  sineButton.onClick = () => {
    reset();
    unpause();
    stop();
    sineWave(medium1);
    sineWave(medium2);
  };
  const setMaxTime = (t) => { maxTime = t; };

  return {
    setMaxTime,
    sineWave,
    assymetricPulse,
    pulse,
    reset,
    pause,
    unpause,
    slowMotion,
    normalMotion,
    setTimeSpeed,
    time,
  };
}

const layout = setupFigure();

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
