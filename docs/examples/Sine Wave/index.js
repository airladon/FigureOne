/* globals Fig */
const figure = new Fig.Figure({ scene: [-2, -1.7, 2, 1.3], color: [1, 0, 0, 1] });

// ////////////////////////////////////////////////////////////////////////
// Radius and Space between radius and recorded signal
// ////////////////////////////////////////////////////////////////////////

const r = 0.8;
const space = 0.2;


// ////////////////////////////////////////////////////////////////////////
// Data Class Setup
// ////////////////////////////////////////////////////////////////////////

// This class holds a time signal - when data is added slower than the sampling
// rate, then interpolated data for missing samples in time will be added.
// This class does not use FigureOne.
class DynamicSignal {
  constructor(initialValue) {
    // This data class will hold signal data for the most recent 10s at a
    // resolution (sampling rade) of 0.02s.
    this.duration = 10;
    this.timeStep = 0.01;
    const time = Fig.range(0, this.duration, this.timeStep);

    // The xRange is the x distance the duration will be plotted over
    const xRange = 2 - space;

    // Get the x values of the signal
    this.x = time.map(t => t * xRange / this.duration + r + space);

    // initial signal data
    // this.data = Array(this.duration / this.timeStep).fill(initialValue);
    this.data = [initialValue];

    // record the current time
    this.lastTime = figure.timeKeeper.now();
  }

  // Update the signal data with the new value. Signal data is has a resolution
  // of 0.02s, so if this value comes in more than 0.04s after the last value
  // was recorder, then use interpolation to fill in the missing samples.
  update(value) {
    const currentTime = figure.timeKeeper.now();
    const deltaTime = Fig.tools.math.round((currentTime - this.lastTime) / 1000, 6);

    // If the value has come in faster than the time resolution, then
    // do nothing
    if (deltaTime < this.timeStep) {
      return;
    }

    this.lastTime = currentTime;

    // If more than 10s has passed, since the last value update, then
    // udpate all values to the latest value
    if (deltaTime > this.duration) {
      this.data = Array(this.x.length).fill(value);
      return;
    }

    // Count the number of samples that need to be added to the signal
    const count = Math.floor(Fig.tools.math.round(deltaTime / this.timeStep, 6));

    // Interpolate between the last recorded value and the new value
    const newValues = [];
    const deltaValue = Fig.tools.math.round((this.data[0] - value) / (count), 6);
    for (let i = 0; i < count; i += 1) {
      newValues.push(value + deltaValue * i);
    }
    this.data = [...newValues, ...this.data.slice(0, this.x.length - count)];
  }

  // Make an array of points where this.data is plotted against this.x
  getPoints() {
    return this.data.map((value, index) => new Fig.Point(this.x[index], value));
  }
}

// Make a new signal
const signal = new DynamicSignal(0, 10);


// ////////////////////////////////////////////////////////////////////////
// Setup the figure
// ////////////////////////////////////////////////////////////////////////

// Helper method to create text buttons
const button = (name, label, position) => ({
  name,
  make: 'collections.button',
  label: {
    text: label,
    font: { size: 0.1, weight: '100' },
  },
  touchBorder: 0.1,
  position,
  color: [0.4, 0.4, 0.4, 1],
  width: 0.7,
  height: 0.25,
  corner: { radius: 0.05, sides: 10 },
  line: { width: 0.005 },
  touch: true,
});

figure.add([
  {
    name: 'diagram',
    make: 'collection',
    position: [-1, 0],
    elements: [
      {
        name: 'x',
        make: 'line',
        length: 3.6,
        position: [-r, 0],
        width: 0.005,
        color: [0.4, 0.4, 0.4, 1],
      },
      {
        name: 'y',
        make: 'line',
        length: r * 2,
        position: [0, -r],
        width: 0.005,
        angle: Math.PI / 2,
        color: [0.4, 0.4, 0.4, 1],
      },
      {
        name: 'circle',
        make: 'polygon',
        radius: r,
        sides: 70,
        line: { width: 0.005 },
        color: [0.4, 0.4, 0.4, 1],
      },
      {
        name: 'sine',
        make: 'collections.line',
        maxLength: 3,
        width: 0.005,
        dash: [0.03, 0.01],
        color: [0.4, 0.4, 0.4, 1],
      },
      {
        name: 'rotator',
        make: 'line',
        length: r,
        width: 0.015,
        touchBorder: 0.3,
        move: { type: 'rotation' },
      },
      {
        name: 'signalLine',
        make: 'polyline',
        width: 0.01,
        simple: true,
      },
    ],
  },
  button('slow', 'Slow', [-1, -1.3]),
  button('fast', 'Fast', [0, -1.3]),
  button('stop', 'Stop', [1, -1.3]),
]);

// Get the rotator, sine line and signal line figure elements
const rotator = figure.getElement('diagram.rotator');
const sine = figure.getElement('diagram.sine');
const signalLine = figure.getElement('diagram.signalLine');

// When the rotator is rotated, or as time passes, the 'signalLine' and 'sine'
// lines need to be updated. This function finds the end point of the rotator,
// whose y coordinate is the sine, to update both lines.
function update() {
  const angle = rotator.getRotation();
  const endPoint = Fig.polarToRect(r, angle);
  sine.setEndPoints(endPoint, [r + space, endPoint.y]);
  signal.update(endPoint.y);
  const points = signal.getPoints();
  signalLine.custom.updatePoints({ points });
  figure.animateNextFrame();
}

// Update the signal to the latest rotator value before each draw
figure.notifications.add('beforeDraw', () => {
  update();
});

// After each draw, call, queue the next animation, forcing a redraw on it.
// Therefore, every frame the signal is updated and drawn.
figure.notifications.add('afterDraw', () => {
  figure.animateNextFrame();
});


// ////////////////////////////////////////////////////////////////////////
// Button Logic
// ////////////////////////////////////////////////////////////////////////
// Two buttons set the rotator to spin automatically, while the third stops all rotation.
function spinner(initialAngle, duration, frequency, percent) {
  const angle = initialAngle + 2 * Math.PI * frequency * percent * duration;
  rotator.setRotation(angle);
}

function startSpinning(frequency) {
  rotator.stop();
  const angle = rotator.getRotation();
  rotator.animations.new()
    .custom({
      callback: spinner.bind(this, angle, 100, frequency),
      duration: 100,
    })
    .start();
}

figure.getElement('fast').onClick = () => startSpinning(0.7);
figure.getElement('slow').onClick = () => startSpinning(0.2);
figure.getElement('stop').onClick = () => { rotator.stop(); };


// ////////////////////////////////////////////////////////////////////////
// Initialize
// ////////////////////////////////////////////////////////////////////////
// To initialize the figure, we start by animating a rotation to make it
// obvious that the signal is being recorded, and then start the 20ms updates.
rotator.animations.new()
  .rotation({ target: Math.PI / 4, duration: 1.5 })
  .start();

// Globally available pulse function to be used from HTML page
// eslint-disable-next-line no-unused-vars
const pulseRotator = () => {
  rotator.pulse({ rotation: 0.1, min: -0.1, frequency: 3 });
};
