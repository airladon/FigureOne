const figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

// const figure = new Fig.Figure({ limits: [-8, -8, 16, 16], color: [1, 0, 0, 1]});
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
//       bounds: [-3, -3, 6, 6],
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
//       bounds: [-3, -3, 6, 6],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.7, 0.7, 0.7, 1],
//       line: { width: 0.004 }
//     },
//   },
// ]);




const r = 0.8;
const timeDuration = 10;
const xRange = 2;
const timeStep = 0.02;
const time = Fig.range(0, timeDuration, timeStep);
// const points = time.map(t => new Fig.Point(t / 10 + r + 0.2, 0));

class DynamicSignal {
  constructor(initialValue, maxDuration) {
    this.timeStep = 0.02;
    this.data = Array(maxDuration / this.timeStep).fill(initialValue);
    this.lastTime = new Date().getTime();
  }

  update(value) {
    const currentTime = new Date().getTime();
    const deltaTime = currentTime - this.lastTime;
    const count = Math.ceil(deltaTime / 1000 / this.timeStep);

    if (count === 0) {
      return;
    }
    this.lastTime = currentTime;
    // console.log(deltaTime, count)
    if (count >= this.data.length) {
      this.data = Array(this.data.length).fill(value);
      return;
    }

    // Interpolate the points so we don't have steps in the output
    const newValues = [];
    const deltaValue = (this.data[0] - value) / (count);
    for (let i = 0; i < count; i += 1) {
      newValues.push(value + deltaValue * i);
    }
    this.data = [...newValues, ...this.data.slice(0, this.data.length - count)];
  }
}

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
        name: 'sine',
        method: 'collections.line',
        options: {
          maxLength: 3,
          width: 0.005,
          dash: [0.007, 0.02],
        },
      },
      {
        name: 'rotator',
        method: 'line',
        options: {
          length: r,
          width: 0.015,
          touchBorder: 0.5,
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
        },
      },
    ],
  },
]);


const rotator = figure.getElement('diagram.rotator');
const sine = figure.getElement('diagram.sine');
const signalLine = figure.getElement('diagram.signalLine');

const signal = new DynamicSignal(r * Math.sin(Math.PI / 4), 10);

function update() {
  const angle = rotator.getRotation();
  const endPoint = Fig.polarToRect(r, angle);
  sine.setEndPoints(endPoint, [r + 0.2, endPoint.y]);
  signal.update(endPoint.y);
  const newPoints = signal.data.map(
    (y, index) => new Fig.Point(time[index] / 7 + r + 0.2, y),
  );
  signalLine.custom.updatePoints({ points: newPoints });
  figure.animateNextFrame();
};

rotator.subscriptions.add('setTransform', () => {
  update();
});

function updateNext() {
  update();
  setTimeout(updateNext, 20);
};

rotator.setRotation(Math.PI / 4);

updateNext();
