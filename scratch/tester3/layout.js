
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
const color2 = [0.3, 0.3, 0.3, 1];
const color3 = [1, 0, 1, 1];

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
          text: 'Velocity, wavelength and frequency',
          font: { size: 0.12 },
          lineSpace: 0.25,
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
      touchBorder: [0.05, 0.05, 0.05, 0.1],
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
    button('pulseButton', [1.7, 0.15], 'Pulse'),
    button('sineButton', [1.3, 0.15], 'Sine'),
    button('resetButton', [0.9, 0.15], 'Reset'),
    button('freezeTimeButton', [-1.6, 0.15], 'Off'),
    label('freezeTimeLabel', [-1.95, 0.15], colorText, 'Freeze:'),
    button('slowTimeButton', [-0.6, 0.15], 'Off'),
    label('slowTimeLabel', [-1.05, 0.15], colorText, ['Slow Motion:']),
    label('disturbance', [0.45, 0.15], colorText, ['Disturbance:']),
    button('velocityButton1', [2, 1.9], 'Fast'),
    button('velocityButton2', [2, 1.04], 'Fast'),
    button('freqButton1', [-0.7, 1.9], 'Fast'),
    button('freqButton2', [-0.7, 1.04], 'Fast'),
    label('velocity', [2, 2.1], colorText, 'Velocity'),
    label('frequency', [-0.7, 2.1], colorText, 'Sine Frequency'),
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
  const velocityButton1 = figure.getElement('velocityButton1');
  const velocityButton2 = figure.getElement('velocityButton2');
  const freqButton1 = figure.getElement('freqButton1');
  const freqButton2 = figure.getElement('freqButton2');

  
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
      color: color1,
      position: [x, 0],
    },
    mods: {
      // dimColor: [0.5, 0.5, 0.5, 1],
      dimColor: color2,
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
        {
          name: 'wavelength',
          method: 'collections.line',
          options: {
            width: 0.01,
            color: color1,
            arrow: 'barb',
            label: {
              text: '\u03bb',
              offset: 0.04,
              location: 'bottom',
            },
            p1: [100, 0],
            p2: [101, 0],
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
      // if (index % 10 === 0) { b.setColor(color1); }
      if (index === 0) { b.setColor(color0); }
    });
    balls.toFront(['ball0', 'ball40']);
    const [tracker] = medium.add(ball(0, 'Tracker', ballSize));
    tracker.setColor(color3);
    const movePad = medium.getElement('movePad');
    const wavelength = medium.getElement('wavelength');
    medium.custom = {
      f: 0.2,
      c: 1,
      A,
      axis,
      balls,
      tracker,
      wavelength,
      trackingTime: -10000,
      ball0: balls.getElement('ball0'),
      recording: new Recorder(maxValue / minVelocity),
      update: (deltaTime) => {
        const { y } = movePad.transform.order[2];
        medium.custom.recording.record(y, deltaTime);
        if (medium.custom.tracker < xValues.length) {
          balls[`_ball${medium.custom.tracker}`].setColor(color2);
        }
        // medium.custom.tracker = xValues.length + 1;
        for (let i = 0; i < xValues.length; i += 1) {
          const b = balls[`_ball${i}`];
          const by = medium.custom.recording.getValueAtTimeAgo((b.custom.x) / medium.custom.c);
          b.setPosition(b.custom.drawX, by);
        }
        if (tracker.isShown) {
          // const ballSizeTime = ballSize * 2 / medium.custom.c;
          const ballSpaceTime = axis.drawToValue(ballSize * 2) / medium.custom.c;
          const t = Math.floor((time.now() + medium.custom.trackingTime) / ballSpaceTime) * ballSpaceTime;
          
          const xValue = Math.max(t * medium.custom.c, 0);
          const x = axis.valueToDraw(xValue);
          if (t > 0 && axis.inAxis(xValue + 0.2)) {
            const by = medium.custom.recording.getValueAtTimeAgo(t);
            tracker.setPosition(x, by);
          } else {
            tracker.setPosition(100, 0);
          }
        }
        // if (medium.custom.tracker < xValues.length) {
        //   balls[`_ball${medium.custom.tracker}`].setColor(color3);
        // }
      },
      // pulseTracked: (scale = 4) => {
      //   if (medium.custom.tracker < xValues.length) {
      //     const ballName = `ball${medium.custom.tracker}`;
      //     balls.toFront([ballName]);
      //     balls.elements[ballName].pulse({ scale });
      //   }
      // },
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
      setWavelengthPosition: (deltaX = 0) => {
        const t = time.now();
        const x0Phase = (2 * Math.PI * medium.custom.f * t) % (2 * Math.PI);
        const lambda = medium.custom.c / medium.custom.f;
        const wavelengthDraw = axis.valueToDraw(lambda);
        const wavelengthStartPhase = Math.PI / 2 * 3;
        let deltaPhase = Math.PI * 2 - (wavelengthStartPhase - x0Phase);
        if (x0Phase > wavelengthStartPhase) {
          deltaPhase = x0Phase - wavelengthStartPhase;
        }
        const xDistanceToStart = deltaPhase / Math.PI / 2 * lambda;
        const xDraw = axis.valueToDraw(xDistanceToStart) + deltaX;
        wavelength.setEndPoints([xDraw, -A], [xDraw + wavelengthDraw, -A]);
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

  let inAnimation = false;

  const setInAnimation = (value = true) => {
    inAnimation = value;
  };

  const getInAnimation = () => inAnimation;


  const stop = () => {
    medium1.custom.stop();
    medium2.custom.stop();
    figure.stop();
  };
  const reset = () => {
    stop();
    setInAnimation(false);
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
  // const setVelocity = (medium, velocity, buttonLabel) => {
  //   // reset();
  //   // unpause();
  //   const med = num === 1 ? medium1 : medium2;
  //   med.custom.c = velocity;
  //   const vButton = num === 1 ? velocityButton1 : velocityButton2;
  //   vButton.setLabel(buttonLabel);
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

  // const setWaveLength = (med) => {
  //   const lambda = med.custom.c / med.custom.f;
  //   const drawLength = med.custom.axis.valueToDraw(lambda);
  //   wavelength.setLength(drawLength);
  // };

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

  let lastDisturbance = time.now() - 100;
  let timerId = null;

  const stopDisturbances = () => {
    if (timerId != null) {
      clearTimeout(timerId);
    }
    figure.elements.animations.cancel('pauseAfterDelay');
  };

  const pauseAfterDelay = (delay) => {
    const startTime = time.now();
    figure.elements.animations.new('pauseAfterDelay')
      .custom({
        duration: 10000,
        callback: () => {
          if (time.now() - startTime >= delay) {
            return true;
          }
          return false;
        },
      })
      .trigger(() => pause())
      .start();
  };

  const disturb = (med, style = 'pulse', parameter = 0.6, inAnimationValue = false) => {
    if (Array.isArray(med)) {
      med.forEach((m) => {
        if (style === 'pulse') {
          pulse(m, parameter);
        } else {
          sineWave(m, parameter);
        }
      });
    } else if (style === 'pulse') {
      pulse(med, parameter);
    } else {
      sineWave(med, parameter);
    }
    lastDisturbance = time.now();
    setInAnimation(inAnimationValue);
  };

  const startDisturbances = (med, timeTillNext = 10, immediately = true, style = 'pulse', parameter) => {
    if (timerId != null) {
      clearTimeout(timerId);
    }
    const now = time.now();
    if (Array.isArray(med)) {
      med.forEach((m) => {
        if (m.custom.movePad.isAnimating() && style === 'sineWave') {
          lastDisturbance = now;
        }
      });
    } else if (med.custom.movePad.isAnimating() && style === 'sineWave') {
      lastDisturbance = now;
    }
    if (now - lastDisturbance > timeTillNext || immediately) {
      disturb(med, style, parameter);
    }
    timerId = setTimeout(() => {
      startDisturbances(med, timeTillNext, false, style, parameter);
    }, 1000);
  };

  const setVelocity = (med, velocity, velocityButtonIndex) => {
    reset();
    // unpause();
    med.custom.setVelocity(velocity);
    let velocityButton = velocityButton1;
    if (velocityButtonIndex === 2) {
      velocityButton = velocityButton2;
    }
    if (velocity === 0.5) {
      velocityButton.setLabel('1v');
    } else {
      velocityButton.setLabel('2v');
    }
    // startDisturbances([medium1, medium2], 5.5, true, 'sineWave', 0);
  };
  const toggleVelocity = (med, velocityButtonIndex) => {
    if (med.custom.c === 0.5) {
      setVelocity(med, 0.9, velocityButtonIndex);
    } else {
      setVelocity(med, 0.5, velocityButtonIndex);
    }
  };
  velocityButton1.onClick = () => toggleVelocity(medium1, 1);
  velocityButton2.onClick = () => toggleVelocity(medium2, 2);

  const setFrequency = (med, frequency, frequencyButtonIndex) => {
    reset();
    unpause();
    med.custom.setFrequency(frequency);
    let frequencyButton = freqButton1;
    if (frequencyButtonIndex === 2) {
      frequencyButton = freqButton2;
    }
    if (frequency === 0.5) {
      frequencyButton.setLabel('2f');
    } else {
      frequencyButton.setLabel('1f');
    }
    startDisturbances([medium1, medium2], 5.5, true, 'sineWave', 0);
  };
  const toggleFrequency = (med, frequencyButtonIndex) => {
    if (med.custom.f === 0.5) {
      setFrequency(med, 0.25, frequencyButtonIndex);
    } else {
      setFrequency(med, 0.5, frequencyButtonIndex);
    }
  };
  freqButton1.onClick = () => toggleFrequency(medium1, 1);
  freqButton2.onClick = () => toggleFrequency(medium2, 2);

  medium.custom.movePad.subscriptions.add('setTransform', () => {
    if (medium.custom.movePad.state.isBeingMoved) {
      lastDisturbance = time.now();
      figure.elements.animations.cancel('pauseAfterDelay');
      setInAnimation(false);
    }
  });

  medium1.custom.movePad.subscriptions.add('setTransform', () => {
    if (medium1.custom.movePad.state.isBeingMoved) {
      lastDisturbance = time.now();
      figure.elements.animations.cancel('pauseAfterDelay');
      setInAnimation(false);
    }
  });

  medium2.custom.movePad.subscriptions.add('setTransform', () => {
    if (medium2.custom.movePad.state.isBeingMoved) {
      lastDisturbance = time.now();
      figure.elements.animations.cancel('pauseAfterDelay');
      setInAnimation(false);
    }
  });

  const disturbThenFreeze = () => {
    reset();
    disturb([medium1, medium2], 'pulse', 0.6, true);
    figure.elements.animations.cancelAll();
    pauseAfterDelay(1.4);
    const startTime = time.now();
    figure.elements.animations.new()
      .custom({
        duration: 10000,
        callback: () => {
          if (figure.elements.animations.get('pauseAfterDelay') == null) {
            return true;
          }
          if (time.now() - startTime >= 1.35) {
            return true;
          }
          return false;
        },
      })
      .trigger({
        delay: 0.2,
        callback: () => {
          if (getInAnimation()) {
            medium1.custom.tracker.pulse({ scale: 4 });
            medium2.custom.tracker.pulse({ scale: 4 });
          }
        },
      })
      .start();
  };

  pulseButton.onClick = () => {
    reset();
    unpause();
    startDisturbances([medium1, medium2], 8, true, 'pulse', 0.6);
  };
  sineButton.onClick = () => {
    reset();
    unpause();
    startDisturbances([medium1, medium2], 8, true, 'sineWave', 0);
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
    startDisturbances,
    stopDisturbances,
    setVelocity,
    setFrequency,
    disturb,
    pauseAfterDelay,
    setInAnimation,
    getInAnimation,
    disturbThenFreeze,
    // setWavelengthPosition,
  };
}

const layout = setupFigure();
