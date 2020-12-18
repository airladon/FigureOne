const figure = new Fig.Figure({ limits: [-2, -1.7, 4, 3], color: [1, 0, 0, 1] });

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
    this.lastTime = new Date().getTime();
  }

  // Update the signal data with the new value. Signal data is has a resolution
  // of 0.02s, so if this value comes in more than 0.04s after the last value
  // was recorder, then use interpolation to fill in the missing samples.
  update(value) {
    const currentTime = new Date().getTime();
    const deltaTime = (currentTime - this.lastTime) / 1000;

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
    const count = Math.floor(deltaTime / this.timeStep);

    // Interpolate between the last recorded value and the new value
    const newValues = [];
    const deltaValue = (this.data[0] - value) / (count);
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
  method: 'collections.rectangle',
  options: {
    label: {
      text: label,
      font: { size: 0.1 },
    },
    touchBorder: 0.1,
    position,
    color: [0.4, 0.4, 0.4, 1],
    width: 0.7,
    height: 0.25,
    corner: { radius: 0.05, sides: 10 },
    fill: [0.9, 0.9, 0.9, 1],
    button: {
      fill: [0.95, 0.95, 0.95, 1],
    },
  },
  mods: {
    isTouchable: true,
  },
});

figure.add([
  {
    name: 'diagram',
    method: 'collection',
    options: {
      position: [-1, 0],
    },
    elements: [
      {
        name: 'x',
        method: 'line',
        options: {
          length: 3.6,
          position: [-r, 0],
          width: 0.005,
          color: [0.7, 0.7, 0.7, 1],
        }
      },
      {
        name: 'y',
        method: 'line',
        options: {
          length: r * 2,
          position: [0, -r],
          width: 0.005,
          angle: Math.PI / 2,
          color: [0.7, 0.7, 0.7, 1],
        },
      },
      {
        name: 'circle',
        method: 'polygon',
        options: {
          radius: r,
          sides: 200,
          line: { width: 0.005 },
          color: [0.7, 0.7, 0.7, 1],
        },
      },
      {
        name: 'sine',
        method: 'collections.line',
        options: {
          maxLength: 3,
          width: 0.005,
          dash: [0.01, 0.02],
          color: [0.7, 0.7, 0.7, 1],
        },
      },
      {
        name: 'rotator',
        method: 'line',
        options: {
          length: r,
          width: 0.015,
          touchBorder: 0.3,
        },
        mods: {
          isMovable: true,
          move: { type: 'rotation' },
        },
      },
      {
        name: 'signalLine',
        method: 'polyline',
        options: {
          width: 0.01,
          cornerStyle: 'none',
          fast: true,
        },
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

// Update function for everytime we want to update the signal
function update() {
  const angle = rotator.getRotation();
  const endPoint = Fig.polarToRect(r, angle);
  sine.setEndPoints(endPoint, [r + space, endPoint.y]);
  signal.update(endPoint.y);
  const points = signal.getPoints()
  // const t = performance.now()
  signalLine.custom.updatePoints({
    points,
  })
  // console.log(Fig.tools.math.round(performance.now() - t, 0))
  figure.animateNextFrame();
};

// Before each draw, update the points
figure.subscriptions.add('beforeDraw', () => {
  update();
});

// After each draw, call a next animation frame so udpates happen on each frame
figure.subscriptions.add('afterDraw', () => {
  figure.animateNextFrame();
});


// ////////////////////////////////////////////////////////////////////////
// Button Logic
// ////////////////////////////////////////////////////////////////////////

function spinner(initialAngle, duration, frequency, percent) {
  const angle = initialAngle + 2 * Math.PI * frequency * percent * duration;
  rotator.setRotation(angle);
}

function startSpinning(frequency) {
  rotator.stop();
  const angle = rotator.getRotation();
  rotator.animations.new()
    .custom({
      callback: this.spinner.bind(this, angle, 100, frequency),
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

rotator.animations.new()
  .rotation({ target: Math.PI / 4, duration: 1.5 })
  // .trigger({ callback: updateNext })
  .start();