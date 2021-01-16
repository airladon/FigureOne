
const { Transform, Point } = Fig;
const { range, rand, randSign } = Fig.tools.math;
// const figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1] });


const figure = new Fig.Figure({
  limits: [-2, 0, 4, 3],
  color: [0.3, 0.3, 0.3, 1],
  font: { size: 0.1 },
});

let f = 0.3;     // Hz
const A = 0.6;   // m
let c = 1;       // m/s

const equationPosition = new Point(0, 2.2);
const sideEquationPosition = new Point(1.4, 2.5);
const colorText = [0.3, 0.3, 0.3, 1];
const color0 = [1, 0, 0, 1];
const color1 = [0, 0.5, 1, 1];
/*
..........###....##.....##.####..######.
.........##.##....##...##...##..##....##
........##...##....##.##....##..##......
.......##.....##....###.....##...######.
.......#########...##.##....##........##
.......##.....##..##...##...##..##....##
.......##.....##.##.....##.####..######.
*/
const xAxis = (name, title, units, length = 3) => ({
  name,
  method: 'collections.axis',
  options: {
    start: 0,
    stop: 5.5,
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
    start: -A - 0.1,
    stop: A + 0.1,
    length: A * 2 + 0.2,
    line: { width: 0.005 },
    position: [0, -A - 0.1],
    title: {
      font: { style: 'italic', family: 'serif', size: 0.12 },
      text: [title, { font: { size: 0.06 }, lineSpace: 0.08, text: units }],
      rotation: 0,
      offset: [0.1, A + 0.15],
    },
  },
});

// Add the Space Axis
figure.add({
  name: 'spacePlot',
  method: 'collection',
  elements: [
    xAxis('xAxis', 'x', 'meters', 3),
    xAxis('xAxisSmall', 'x', 'meters', 1.75),
    yAxis('yAxis', 'y', 'meters'),
    { name: 'balls', method: 'collection' },
    {
      name: 'movePad',
      method: 'primitives.polygon',
      options: {
        radius: 0.4,
        sides: 8,
        color: [0, 0, 0, 0],
      },
      mods: {
        isMovable: true,
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
      name: 'recordingLine',
      method: 'primitives.line',
      options: {
        width: 0.005,
        color: color0,
      },
    },
  ],
  mods: {
    scenarios: {
      default: { position: [-1.5, 1.2], scale: 1 },
      small: { position: [0.1, 1.5], scale: 1 },
    },
  },
});

// Add the Time Axis
figure.add({
  name: 'timePlot',
  method: 'collection',
  elements: [
    xAxis('xAxis', 't', 'seconds', 1.75),
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
// Add reset button
figure.add([
  button('pulseButton', [-1.7, 0.2], 'Pulse'),
  button('sineButton', [-1.3, 0.2], 'Sine'),
  button('resetButton', [-0.9, 0.2], 'Reset'),
  button('freezeTimeButton', [-0.2, 0.2], 'Running'),
  button('slowTimeButton', [0.2, 0.2], 'Normal'),
  button('showTimeButton', [0.6, 0.2], 'Show'),
  button('velocityButton', [1.3, 0.2], 'Normal'),
  label('disturbanceLabel', [-1.3, 0.4], 'Disturbance'),
  label('timeLabel', [0.2, 0.4], 'Time'),
  label('velocityLabel', [1.3, 0.4], 'Velocity'),
]);


const spacePlot = figure.getElement('spacePlot');
const spaceX = spacePlot.getElement('xAxis');
const spaceXSmall = spacePlot.getElement('xAxisSmall');
const timePlot = figure.getElement('timePlot');
const timeTrace = timePlot.getElement('trace');
const timeX = timePlot.getElement('xAxis');
const balls = spacePlot.getElement('balls');
const movePad = spacePlot.getElement('movePad');
const resetButton = figure.getElement('resetButton');
const pulseButton = figure.getElement('pulseButton');
const sineButton = figure.getElement('sineButton');
const freezeButton = figure.getElement('freezeTimeButton');
const slowTimeButton = figure.getElement('slowTimeButton');
const velocityButton = figure.getElement('velocityButton');
const recordingLine = spacePlot.getElement('recordingLine');

const ball = (x, index, sides = 20) => ({
  name: `ball${index}`,
  method: 'primitives.polygon',
  path: 'spacePlot.balls',
  options: {
    sides,
    radius: 0.02,
    transform: new Transform().translate(x, 0),
    color: color1,
  },
  mods: {
    dimColor: [0.7, 0.7, 0.7, 1],
  },
});


const data = new Recorder();
const time = new TimeKeeper();
let enableMaxTime = false;
let timeMax = false;
let maxRecordTime = 5;

const xValues = range(0, 5, 0.12);
xValues.forEach((x, index) => {
  const drawX = spaceX.valueToDraw(x);
  figure.add(ball(drawX, index));
  const b = balls.getElement(`ball${index}`);
  b.custom.x = x;
  b.custom.drawX = drawX;
  b.custom.drawXSmall = spaceXSmall.valueToDraw(x);
});
const b0 = balls.getElement('ball0');
balls.toFront(['ball0']);
b0.setColor(color0);


const stop = () => {
  figure.stop();
  movePad.animations.cancel('_noStop_sine');
};
const reset = () => {
  stop();
  movePad.setPosition(0, 0);
  time.reset();
  data.reset(0);
  time.pause();
  timeMax = false;
};

movePad.subscriptions.add('setTransform', () => {
  if (enableMaxTime && timeMax) {
    return;
  }

  if (movePad.state.isBeingMoved && movePad.isAnimating()) {
    stop();
  }
  time.unpause();
});


// Update function for everytime we want to update the signal
function update() {
  if (!spacePlot.isShown) {
    return;
  }
  const deltaTime = time.step();
  const { y } = movePad.transform.order[2];
  data.record(y, deltaTime);
  if (enableMaxTime && time.now() > maxRecordTime && timeMax === false) {
    timeMax = true;
    time.pause();
    resetButton.pulse({ scale: 1.1, duration: 10000, frequency: 1.5 });
  }
  for (let i = 0; i < xValues.length; i += 1) {
    const b = balls[`_ball${i}`];
    const by = data.getValueAtTimeAgo((b.custom.x) / c);
    if (spaceX.isShown) {
      b.setPosition(b.custom.drawX, by);
    } else if (spaceXSmall.isShown) {
      b.setPosition(b.custom.drawXSmall, by);
    }
  }
  if (timePlot.isShown) {
    const trace = data.getRecording();
    const points = Array(trace.time.length);
    for (let i = 0; i < points.length; i += 1) {
      points[i] = new Point(timeX.valueToDraw(trace.time[i]), trace.data[i]);
    }
    timeTrace.custom.updatePoints({ points });

    if (Math.abs(y) < 0.01) {
      recordingLine.hide();
    } else {
      recordingLine.show();
      const lastTime = trace.time.slice(-1)[0];
      const draw = timeX.valueToDraw(lastTime) - 1.95;
      recordingLine.custom.updatePoints({ p1: [draw, y], p2: [0, y] });
    }
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


resetButton.onClick = () => {
  reset();
  time.pause();
};

freezeButton.onClick = () => {
  if (time.isPaused()) {
    freezeButton.setLabel('Running');
    time.unpause();
  } else {
    time.pause();
    freezeButton.setLabel('Frozen');
  }
};

slowTimeButton.onClick = () => {
  time.unpause();
  freezeButton.setLabel('Running');
  if (time.getTimeSpeed() === 1) {
    time.setTimeSpeed(0.3);
    movePad.animations.setTimeSpeed(0.3);
    slowTimeButton.setLabel('Slow');
  } else {
    time.setTimeSpeed(1);
    movePad.animations.setTimeSpeed(1);
    slowTimeButton.setLabel('Normal');
  }
};

velocityButton.onClick = () => {
  reset();
  time.pause();
  freezeButton.setLabel('Frozen');
  if (c === 0.5) {
    velocityButton.setLabel('Normal');
    c = 1;
  } else if(c === 1) {
    velocityButton.setLabel('Fast');
    c = 2;
  } else {
    velocityButton.setLabel('Slow');
    c = 0.5;
  }
};

const disturbPulse = () => {
  reset();
  time.unpause();
  const y = rand(0.1, 0.3) * randSign();
  const t = rand(0.2, 0.4);
  movePad.animations.new()
    .position({ duration: t, target: [0, y], progression: 'easeout' })
    .position({ duration: t, target: [0, 0], progression: 'easein' })
    .start();
};

const disturbSine = (delay = 0, resetSignal = true) => {
  if (resetSignal) {
    reset();
  }
  time.unpause();
  freezeButton.setLabel('Running');
  movePad.animations.new('_noStop_sine')
    .delay(delay)
    .custom({
      callback: () => {
        if (!time.isPaused()) {
          const t = time.now();
          movePad.setPosition(0, A * Math.sin(2 * Math.PI * f * t));
        }
      },
      duration: 10000,
    })
    .start();
};

const disturbPulse1 = () => {
  // reset();
  time.unpause();
  freezeButton.setLabel('Running');
  stop();
  const startTime = time.now();
  movePad.animations.new()
    .custom({
      callback: () => {
        if (!time.isPaused()) {
          const deltaT = time.now() - startTime;
          const Y = 0.3;
          const t1 = 0.4;
          const t2 = 1.5;
          if (deltaT < t1) {
            movePad.setPosition(0, Y * (deltaT / t1));
          } else if (deltaT < t2 + t1) {
            movePad.setPosition(0, Y - (Y * (deltaT - t1) / t2));
          }
          // movePad.setPosition(0, A * Math.sin(2 * Math.PI * f * t));
        }
      },
      duration: 10000,
    })
    // .position({ duration: 0, target: [0, 0], progression: 'easein' })
    // .position({ duration: 0.4, target: [0, 0.2], progression: 'easein' })
    // .position({ duration: 1.4, target: [0, 0], progression: 'easeinout' })
    .start();
};

pulseButton.onClick = () => disturbPulse1();
sineButton.onClick = () => disturbSine(true);

balls.highlight(['ball0', 'ball50']);

spacePlot.setScenario('small');
spaceXSmall.show();
spaceX.hide();
timePlot.show();
timePlot.setScenario('small');
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