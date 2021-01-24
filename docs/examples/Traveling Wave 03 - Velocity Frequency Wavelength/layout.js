
/* globals Fig, Recorder, TimeKeeper */


const figure = new Fig.Figure({
  limits: [-3, 0, 6, 3],
  color: [0.3, 0.3, 0.3, 1],
  font: { size: 0.1 },
});

// Global colors used in equations.js and slides.js
const colorText = [0.3, 0.3, 0.3, 1];
const color0 = [1, 0, 0, 1];
const color1 = [0, 0.5, 1, 1];
const color2 = [0.3, 0.3, 0.3, 1];
const color3 = [1, 0, 1, 1];

function setupFigure() {
  const { Transform, Point } = Fig;
  const { range, rand, randSign } = Fig.tools.math;
  const minVelocity = 0.5;
  const time = new TimeKeeper();
  let maxTime = 0;
  let maxTimeReached = false;

  /*
  .########.####.########.##.......########
  ....##.....##.....##....##.......##......
  ....##.....##.....##....##.......##......
  ....##.....##.....##....##.......######..
  ....##.....##.....##....##.......##......
  ....##.....##.....##....##.......##......
  ....##....####....##....########.########
  */
  // Title text on the first slide
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

  /*
  ..######..##.....##.##.....##.##.....##....###....########..##....##
  .##....##.##.....##.###...###.###...###...##.##...##.....##..##..##.
  .##.......##.....##.####.####.####.####..##...##..##.....##...####..
  ..######..##.....##.##.###.##.##.###.##.##.....##.########.....##...
  .......##.##.....##.##.....##.##.....##.#########.##...##......##...
  .##....##.##.....##.##.....##.##.....##.##.....##.##....##.....##...
  ..######...#######..##.....##.##.....##.##.....##.##.....##....##...
  */
  // Text on the last slide summarizing the learnings
  figure.add({
    name: 'summary',
    method: 'primitives.textLines',
    options: {
      text: [
        { text: 'Summary', font: { size: 0.25 }, justify: 'center' },
        '', '', '',
        'A |wave| is a disturbance that propagates through a',
        'medium or field.',
        '', '',
        'A sinusoidal disturbance at a point produces a',
        '|sine wave| disturbance in space.',
        '', '',
        'The |wavelength| |lambda| of the sine wave is related to',
        'the |frequency| |f| of the initial disturbance, and the',
        'propagation |velocity| |v| in the medium or field.',
      ],
      modifiers: {
        wave: { font: { color: color1, style: 'italic' } },
        wavelength: { font: { color: color1, style: 'italic' } },
        frequency: { font: { color: color1, style: 'italic' } },
        velocity: { font: { color: color1, style: 'italic' } },
        'sine wave': { font: { color: color1, style: 'italic' } },
        lambda: { text: '\u03bb', font: { family: 'Times New Roman', style: 'italic', size: 0.18 } },
        f: { font: { family: 'Times New Roman', style: 'italic', size: 0.18 } },
        v: { font: { family: 'Times New Roman', style: 'italic', size: 0.18 } },
      },
      font: { size: 0.15, color: colorText },
      xAlign: 'center',
      yAlign: 'middle',
      justify: 'left',
      position: [0, 1.75],
      lineSpace: 0.2,
    },
  });

  /*
  .########..##.....##.########.########..#######..##....##..######.
  .##.....##.##.....##....##.......##....##.....##.###...##.##....##
  .##.....##.##.....##....##.......##....##.....##.####..##.##......
  .########..##.....##....##.......##....##.....##.##.##.##..######.
  .##.....##.##.....##....##.......##....##.....##.##..####.......##
  .##.....##.##.....##....##.......##....##.....##.##...###.##....##
  .########...#######.....##.......##.....#######..##....##..######.
  */
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

  figure.add([
    button('pulseButton1', [1.7, 0.15], 'Pulse 1'),
    button('pulseButton2', [2.1, 0.15], 'Pulse 2'),
    button('sineButton', [1.3, 0.15], 'Sine'),
    button('resetButton', [0.9, 0.15], 'Reset'),
    button('freezeTimeButton', [-1.6, 0.15], 'Off'),
    button('slowTimeButton', [-0.6, 0.15], 'Off'),
    button('velocityButton1', [2, 1.9], 'Fast'),
    button('velocityButton2', [2, 1.04], 'Fast'),
    button('freqButton1', [-0.7, 1.9], 'Fast'),
    button('freqButton2', [-0.7, 1.04], 'Fast'),
  ]);

  const resetButton = figure.getElement('resetButton');
  const pulseButton1 = figure.getElement('pulseButton1');
  const pulseButton2 = figure.getElement('pulseButton2');
  const sineButton = figure.getElement('sineButton');
  const freezeButton = figure.getElement('freezeTimeButton');
  const slowTimeButton = figure.getElement('slowTimeButton');
  const velocityButton1 = figure.getElement('velocityButton1');
  const velocityButton2 = figure.getElement('velocityButton2');
  const freqButton1 = figure.getElement('freqButton1');
  const freqButton2 = figure.getElement('freqButton2');

  const pause = () => {
    time.pause();
    freezeButton.setLabel('On');
  };
  const unpause = () => {
    freezeButton.setLabel('Off');
    time.unpause();
  };

  /*
  .##..........###....########..########.##........######.
  .##.........##.##...##.....##.##.......##.......##....##
  .##........##...##..##.....##.##.......##.......##......
  .##.......##.....##.########..######...##........######.
  .##.......#########.##.....##.##.......##.............##
  .##.......##.....##.##.....##.##.......##.......##....##
  .########.##.....##.########..########.########..######.
  */
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
    label('freezeTimeLabel', [-1.95, 0.15], colorText, 'Freeze:'),
    label('slowTimeLabel', [-1.05, 0.15], colorText, ['Slow Motion:']),
    label('disturbance', [0.45, 0.15], colorText, ['Disturbance:']),
    label('velocity', [2, 2.1], colorText, 'Velocity'),
    label('frequency', [-0.7, 2.1], colorText, 'Sine Frequency'),
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

  /*
  ....###....########..########...#######..##......##..######.
  ...##.##...##.....##.##.....##.##.....##.##..##..##.##....##
  ..##...##..##.....##.##.....##.##.....##.##..##..##.##......
  .##.....##.########..########..##.....##.##..##..##..######.
  .#########.##...##...##...##...##.....##.##..##..##.......##
  .##.....##.##....##..##....##..##.....##.##..##..##.##....##
  .##.....##.##.....##.##.....##..#######...###..###...######.
  */
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


  /*
  .##.....##.########.########..####.##.....##.##.....##
  .###...###.##.......##.....##..##..##.....##.###...###
  .####.####.##.......##.....##..##..##.....##.####.####
  .##.###.##.######...##.....##..##..##.....##.##.###.##
  .##.....##.##.......##.....##..##..##.....##.##.....##
  .##.....##.##.......##.....##..##..##.....##.##.....##
  .##.....##.########.########..####..#######..##.....##
  */
  // Axis helper functions
  const xAxis = (name, title, units, length, maxValue) => ({
    name,
    method: 'collections.axis',
    options: {
      start: 0,
      stop: maxValue + 0.1,
      length,
      line: { width: 0.008, arrow: { end: 'barb' } },
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
        text: {
          text: `${title} |unitsText|`,
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

  // Particle creater
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
        // movePad moves the first particle in the medium
        {
          name: 'movePad',
          method: 'primitives.polygon',
          options: {
            radius: 0.4,
            sides: 8,
            color: [0, 0, 0, 0],
          },
          mods: {
            move: {
              bounds: {
                translation: {
                  left: 0, right: 0, bottom: -A, top: A,
                },
              },
            },
          },
        },
        // Arrowed line showing a wavelength of a sine wave
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
    const axis = medium.getElement('xAxis');
    const ballSize = 0.02;
    const xValues = range(0, length - 0.1, ballSize * 2);
    const balls = medium.getElement('balls');
    xValues.forEach((x, index) => {
      balls.add(ball(x, index, ballSize));
      const b = balls.getElement(`ball${index}`);
      b.custom.x = axis.drawToValue(x);
      b.custom.drawX = x;
      if (index === 0) { b.setColor(color0); }
    });
    balls.toFront(['ball0', 'ball40']);
    const [tracker] = medium.add(ball(0, 'Tracker', ballSize));
    tracker.setColor(color3);
    const movePad = medium.getElement('movePad');
    const wavelength = medium.getElement('wavelength');
    medium.custom = {
      f: 0.2,   // Current frequency of sine wave for medium
      c: 1,     // Propagation velocity of medium
      A,        // Amplitude of pulse or sine wave for medium
      axis,     // Make some elements easily available
      balls,
      tracker,
      wavelength,
      trackingTime: -10000,
      ball0: balls.getElement('ball0'),
      recording: new Recorder(maxValue / minVelocity),
      // Update function gets the position of the movePad, then records it, and
      // updates all the particles with their current displacement.
      update: (deltaTime) => {
        // Get movePad displacement
        const { y } = movePad.transform.order[2];
        // Record the displacement
        medium.custom.recording.record(y, deltaTime);

        // Calculate the displacement of each particle and set it
        for (let i = 0; i < xValues.length; i += 1) {
          const b = balls[`_ball${i}`];
          const by = medium.custom.recording.getValueAtTimeAgo((b.custom.x) / medium.custom.c);
          b.setPosition(b.custom.drawX, by);
        }

        // If the tracker is being used, then calculate its current position and
        // place it there
        if (tracker.isShown) {
          // The space between particles in seconds (from the velocity)
          const ballSpaceTime = axis.drawToValue(ballSize * 2) / medium.custom.c;
          // Quantize the space so the tracker particle can only exist on an
          // existing particle and not between
          const t = Math.floor(
            (time.now() + medium.custom.trackingTime) / ballSpaceTime,
          ) * ballSpaceTime;

          // If the tracker is within the axis, then position it appropriately,
          // otherwise position it way off
          const xValue = Math.max(t * medium.custom.c, 0);
          const x = axis.valueToDraw(xValue);
          if (t > 0 && axis.inAxis(xValue + 0.2)) {
            const by = medium.custom.recording.getValueAtTimeAgo(t);
            tracker.setPosition(x, by);
          } else {
            tracker.setPosition(100, 0);
          }
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
      setVelocity: (velocity) => {
        medium.custom.c = velocity;
      },
      setFrequency: (frequency) => {
        medium.custom.f = frequency;
      },
      // Find the minimum of the displayed sine curve and position the
      // wavelength arrow annotation to align with it.
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
      // If the movePad has been manually moved, then stop current animations
      if (movePad.state.isBeingMoved && movePad.isAnimating()) {
        medium.custom.stop();
      }
      unpause();
    });
    return medium;
  };

  // Create the mediums
  const medium = addMedium('medium', 4, 10, 0.6, [-2, 0.9], false);
  const medium1 = addMedium('medium1', 2.2, 5, 0.35, [-0, 1.65], true);
  const medium2 = addMedium('medium2', 2.2, 5, 0.35, [-0, 0.8], true);

  // Tie medium1 and medium2 movePads together so if one is manually moved,
  // then the other moves identically.
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

  /*
  .########.####.##.....##.########....########..##........#######..########
  ....##.....##..###...###.##..........##.....##.##.......##.....##....##...
  ....##.....##..####.####.##..........##.....##.##.......##.....##....##...
  ....##.....##..##.###.##.######......########..##.......##.....##....##...
  ....##.....##..##.....##.##..........##........##.......##.....##....##...
  ....##.....##..##.....##.##..........##........##.......##.....##....##...
  ....##....####.##.....##.########....##........########..#######.....##...
  */
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

  const timePlot1 = addTimePlot(
    'timePlot1', 1.5, 5, medium1.custom.recording, 0.35, [-2, 1.65],
  );
  const timePlot2 = addTimePlot(
    'timePlot2', 1.5, 5, medium2.custom.recording, 0.35, [-2, 0.8],
  );

  /*
  .##........#######...######...####..######.
  .##.......##.....##.##....##...##..##....##
  .##.......##.....##.##.........##..##......
  .##.......##.....##.##...####..##..##......
  .##.......##.....##.##....##...##..##......
  .##.......##.....##.##....##...##..##....##
  .########..#######...######...####..######.
  */
  // The leading edge of a disturbance animation resets the medium, then pulses
  // the first particle and freezes time when the pulse is done. The user can
  // then highlight the particle where the initial disturbance has travelled to.
  // However, if during animation or after freezing, the medium is disturbed
  // again, the particle being highlighted may not make any sense, so the
  // animation needs to be restarted.
  //
  // The inAnimation flag holds the state of whether the medium has been
  // disturbed since the start of the animation. The text button that lets
  // the user highlight the initial disturbance can then use it do determine
  // whether to highlight the particle, or restart the animation.
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

  // Update function for everytime we want to update the particles
  function update() {
    if (maxTime > 0 && time.now() > maxTime) {
      maxTimeReached = true;
      pause();
      resetButton.pulse({ scale: 1.1, duration: 10000, frequency: 1.5 });
    }
    const deltaTime = time.step();
    if (medium.isShown) { medium.custom.update(deltaTime); }
    if (medium1.isShown) { medium1.custom.update(deltaTime); }
    if (medium2.isShown) { medium2.custom.update(deltaTime); }
    if (timePlot1.isShown) { timePlot1.custom.update(); }
    if (timePlot2.isShown) { timePlot2.custom.update(); }
  }

  // Before each draw, update the points
  figure.subscriptions.add('beforeDraw', () => {
    update();
  });

  // After each draw, call a next animation frame so udpates happen on each frame
  figure.subscriptions.add('afterDraw', () => {
    figure.animateNextFrame();
  });

  // Functions used by slides to set state of the mediums
  const slowMotion = () => setTimeSpeed(0.3, 'On');
  const normalMotion = () => setTimeSpeed(1, 'Off');

  /*
  .########..####..######..########.##.....##.########..########.
  .##.....##..##..##....##....##....##.....##.##.....##.##.....##
  .##.....##..##..##..........##....##.....##.##.....##.##.....##
  .##.....##..##...######.....##....##.....##.########..########.
  .##.....##..##........##....##....##.....##.##...##...##.....##
  .##.....##..##..##....##....##....##.....##.##....##..##.....##
  .########..####..######.....##.....#######..##.....##.########.
  */
  // Pulse disturbance - disturb the first particle with a pulse
  // Instead of using the normal animation time step (which is real time)
  // a custom animation step is used where time is taken from the TimeKeeper.
  // This means if the TimeKeeper pauses, or is sped up or slowed down, then the
  // animation will be too.
  const pulse = (med, amplitude = randSign() * rand(0.3, 0.6)) => {
    unpause();
    const startTime = time.now();
    const { movePad, A } = med.custom;
    movePad.animations.new()
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

  // Sine wave disturbance
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

  // Assymetric pulse disturbance
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

  // When called, this will pause time after some delay, where the delay is
  // tied to the time kept by TimeKeeper.  
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

  // It is desirable to always have a disturbance travelling down a medium, so
  // the plots are always doing something. Therefore, the slides can
  // `startDisturbances` which will send a new disturbance at a defined time
  // interval after the last disturbance (animated or manual). Any manual
  // intervention will reset this timer.

  // Time of last disturbance global variable
  let lastDisturbance = time.now() - 100;
  let timerId = null;

  // Stop all disturbance timers and cancel current animations
  const stopDisturbances = () => {
    if (timerId != null) {
      clearTimeout(timerId);
    }
    figure.elements.animations.cancel('pauseAfterDelay');
  };

  // Create a disturbance
  const disturb = (med, style = 'pulse', parameter = 0.6, inAnimationValue = false) => {
    if (Array.isArray(med)) {
      med.forEach((m) => {
        if (style === 'asymPulse') {
          assymetricPulse(m);
        } else if (style === 'pulse') {
          pulse(m, parameter);
        } else {
          sineWave(m, parameter);
        }
      });
    } else if (style === 'asymPulse') {
      assymetricPulse(med);
    } else if (style === 'pulse') {
      pulse(med, parameter);
    } else {
      sineWave(med, parameter);
    }
    lastDisturbance = time.now();
    setInAnimation(inAnimationValue);
  };

  // Start timed disturbances
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

  // Reset the lastDisturbance timer if the movePad of the medium is moved
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

  // Start a disturbance, then freeze after some time
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

  /*
  .########..##.....##.########.########..#######..##....##..######.
  .##.....##.##.....##....##.......##....##.....##.###...##.##....##
  .##.....##.##.....##....##.......##....##.....##.####..##.##......
  .########..##.....##....##.......##....##.....##.##.##.##..######.
  .##.....##.##.....##....##.......##....##.....##.##..####.......##
  .##.....##.##.....##....##.......##....##.....##.##...###.##....##
  .########...#######.....##.......##.....#######..##....##..######.
  */
  resetButton.onClick = () => reset();
  freezeButton.onClick = () => {
    if (time.isPaused()) unpause(); else pause();
  };
  slowTimeButton.onClick = () => {
    if (time.getTimeSpeed() === 1) {
      setTimeSpeed(0.3, 'On');
    } else {
      setTimeSpeed(1, 'Off');
    }
  };
  pulseButton1.onClick = () => {
    reset();
    unpause();
    startDisturbances([medium1, medium2], 8, true, 'pulse', 0.6);
  };
  pulseButton2.onClick = () => {
    reset();
    unpause();
    startDisturbances([medium1, medium2], 8, true, 'asymPulse', 0.6);
  };
  sineButton.onClick = () => {
    reset();
    unpause();
    startDisturbances([medium1, medium2], 8, true, 'sineWave', 0);
  };
  const setMaxTime = (t) => { maxTime = t; };
  const setVelocity = (med, velocity, velocityButtonIndex) => {
    reset();
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

  return {
    setMaxTime,
    reset,
    sineWave,
    pause,
    unpause,
    slowMotion,
    normalMotion,
    setTimeSpeed,
    startDisturbances,
    stopDisturbances,
    setVelocity,
    setFrequency,
    disturb,
    pauseAfterDelay,
    getInAnimation,
    disturbThenFreeze,
  };
}

const layout = setupFigure();
