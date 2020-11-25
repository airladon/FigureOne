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



class Queue {
  // data: Array<number>;
  // maxLen: number;

  constructor(initialArray) {
    this.data = initialArray;
    this.maxLen = this.data.length;
  }

  add(element, count = 1) {
    if (count === 1) {
      this.data.pop();
      this.data.unshift(element);
    } else if (count < this.maxLen) {
      const newElements = [];
      // Interpolate the points so we don't have steps in the output
      const delta = (this.data[0] - element) / (count);
      for (let i = 0; i < count; i += 1) {
        newElements.push(element + delta * i);
      }
      this.data = [...newElements, ...this.data.slice(0, this.data.length - count)];
    } else {
      this.data = Array(this.maxLen).fill(element);
    }
  }
}

const r = 0.8;
const timeDuration = 10;
const timeStep = 0.02;
const time = Fig.range(0, timeDuration, timeStep);
const points = time.map(t => new Fig.Point(t / 10 + r + 0.2, 0));

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
          // dash: [0.01, 0.01],
          // copy: { along: 'y', step: 0.4, num: 4 },
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
          // dash: [0.01, 0.01],
          // copy: { along: 'x', step: 0.4, num: 4 },
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
        name: 'line',
        method: 'polyline',
        options: {
          points,
          width: 0.01,
        },
      },
    ],
  },
]);


const rotator = figure.getElement('diagram.rotator');
const sine = figure.getElement('diagram.sine');
const line = figure.getElement('diagram.line');

const signal = new Queue(Array(time.length).fill(0));
let stationaryTime = 0;
let lastTime = new Date().getTime();

function getEndPoint() {
  const angle = rotator.getRotation();
  return Fig.polarToRect(r, angle);
}

function updateSine() {
  const endPoint = getEndPoint();
  sine.setEndPoints(endPoint, [r + 0.2, endPoint.y]);
}

function updateSignal() {
  const endPoint = getEndPoint();
  stationaryTime = 0;
  const slowDown = 4;
  if (stationaryTime < timeDuration) {
    const currentTime = new Date().getTime();
    const delta = Math.min(currentTime - lastTime, timeDuration * 1000);
    const numSteps = Fig.round(delta / 1000 / timeStep, 0);
    lastTime = currentTime;
    if (numSteps > 0) {
      signal.add(endPoint.y, numSteps);
      const newPoints = signal.data.map(
        (y, index) => new Fig.Point(time[index] / slowDown + r + 0.2, y),
      );
      line.custom.updatePoints({ points: newPoints });
    }
    stationaryTime += delta / 1000;
    figure.animateNextFrame();
  }
}

rotator.subscriptions.add('setTransform', () => {
  stationaryTime = 0;
  updateSine();
  updateSignal();
});

function update() {
  setTimeout(() => {
    updateSignal();
    update();
  }, 20);
}

update();

rotator.setRotation(Math.PI / 4);


// function updateSine() {
//   // if (this.custom.recordState === 'pause') {
//   //   return;
//   // }
//   const slowDown = 4;
//   if (stationaryTime < timeDuration) {
//     const currentTime = new Date().getTime();
//     const delta = Math.min(currentTime - lastTime, timeDuration * 1000);
//     const numSteps = round(delta / 1000 / timeStep, 0);
//     lastTime = currentTime;
//     if (numSteps > 0) {
//       signal.add(this._rotator._v.p2.y, numSteps);
//       const newPoints = this.signal.data.map(
//         (y, index) => new Point(this.layout.time[index] / slowDown, y),
//       );
//       this._rotator._sine.updatePoints(newPoints);
//     }
//     stationaryTime += delta / 1000;
//     this.diagram.animateNextFrame();
//   }
// }
