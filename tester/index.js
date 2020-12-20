const figure = new Fig.Figure({
  limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1]
});

// // const figure = new Fig.Figure({ limits: [-8, -8, 16, 16], color: [1, 0, 0, 1]});
// figure.add([
//   {
//     name: 'origin',
//     method: 'polygon',
//     options: {
//       radius: 0.01,
//       line: { width: 0.01 },
//       sides: 10,
//       color: [0.7, 0.7, 0.7, 1]
//     },
//   },
//   {
//     name: 'grid',
//     method: 'grid',
//     options: {
//       bounds: [-4.5, -4.5, 9, 9],
//       yStep: 0.1,
//       xStep: 0.1,
//       color: [0.9, 0.9, 0.9, 1],
//       line: { width: 0.004 },
//     },
//   },
//   {
//     name: 'gridMajor',
//     method: 'grid',
//     options: {
//       bounds: [-4.5, -4.5, 9, 9],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.7, 0.7, 0.7, 1],
//       line: { width: 0.004 },
//     },
//   },
// ]);

const { Transform } = Fig;
const { range } = Fig.tools.math;
// const space = 0.2;
// const r = 0.8;

class Recording {
  constructor(initialValue) {
    // This data class will hold signal data for the most recent 10s at a
    // resolution (sampling rade) of 0.02s.
    this.duration = 10;
    this.timeStep = 0.01;
    this.len = this.duration / this.timeStep;
    // const time = Fig.range(0, this.duration, this.timeStep);

    // The xRange is the x distance the duration will be plotted over
    // const xRange = 2 - space;

    // Get the x values of the signal
    // this.x = time.map(t => t * xRange / this.duration + r + space);

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

    // // If more than 10s has passed, since the last value update, then
    // // udpate all values to the latest value
    // if (deltaTime > this.duration) {
    //   this.data = Array(this.x.length).fill(value);
    //   return;
    // }

    // Count the number of samples that need to be added to the signal
    const count = Math.floor(deltaTime / this.timeStep);

    // Interpolate between the last recorded value and the new value
    const newValues = [];
    const deltaValue = (this.data[0] - value) / (count);
    for (let i = 0; i < count; i += 1) {
      newValues.push(value + deltaValue * i);
    }
    this.data = [...newValues, ...this.data.slice(0, this.len - count)];
  }

  getY(timeDelta) {
    const index = Math.floor(timeDelta / this.timeStep);
    return this.data[index];
  }

  // Make an array of points where this.data is plotted against this.x
  getPoints() {
    return this.data.map((value, index) => new Fig.Point(this.x[index], value));
  }
}


const ball = (x, index) => ({
  name: `ball${index}`,
  method: 'primitives.polygon',
  options: {
    sides: 10,
    radius: 0.025,
    transform: new Transform().translate(x, 0),
  },
  mods: {
    dimColor: [0.5, 0.5, 0.5, 0.8],
  },
});

const startX = -1.5;
const f = 0.3;
const A = 1;
// const lambda = 2;
// const k = 2 * Math.PI / lambda;
const c = 0.5;
const yB0 = t => A * Math.sin(2 * Math.PI * f * t);

const xValues = range(-1.475, 1.5, 0.025);
figure.add(ball(-1.5, 0));
const data = new Recording(0);

const b0 = figure.getElement('ball0');
b0.setMovable();
b0.touchBorder = 0.2;

// b0.subscriptions.add('setTransform', (t) => {
//   const { y } = t[0].order[0];
//   data.update(y);
// });

let time = 0;

xValues.forEach((x, index) => {
  figure.add(ball(x, index + 1));
  const b = figure.getElement(`ball${index + 1}`);
  b.custom.x = x;
  // b0.subscriptions.add('setTransform', () => {
  //   const y = data.getY((x - startX) / c);
  //   // const y = yB0(time - x / c)
  //   b.setPosition(x, y);
  //   // data.update(y);
  // });
});

// Update function for everytime we want to update the signal
function update() {
  const { y } = figure.elements._ball0.transform.order[0];
  data.update(y);
  for (let i = 1; i < xValues.length; i += 1) {
    const b = figure.elements[`_ball${i}`];
    const by = data.getY((b.custom.x - startX) / c);
    b.setPosition(b.custom.x, by);
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

const duration = 100;
// b0.animations.new()
//   .custom({
//     duration,
//     callback: (p) => {
//       time = p * duration;
//       b0.setPosition(startX, yB0(time - startX / c));
//     },
//   })
//   .start();

// figure.getElement('ball10').setColor([1, 0, 0, 1])
// figure.getElement('ball0').setColor([1, 0, 0, 1])
figure.elements.highlight(['ball0', 'ball10']);