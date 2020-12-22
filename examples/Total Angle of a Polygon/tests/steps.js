/* global figure steps */

// //////////////////////////////////////////////////////////////////
// Customize this
// //////////////////////////////////////////////////////////////////
const title = 'Total Angle of a Polygon';
const touches = [
  [0.1, 'touchDown', [-1.5, -1], 'Touch Total Angle New'],
  [0.11, 'touchUp'],
  [1.5, 'touchDown', [-0.5, -1], 'Touch Total Angle Old'],
  [1.51, 'touchUp'],
  [3, 'touchDown', [0, -1], 'Touch -a'],
  [3.01, 'touchUp'],
  [5, 'touchDown', [0.4, -1], 'Touch -b'],
  [5.01, 'touchUp'],
  [7, 'touchDown', [1.2, -1], 'Touch -c'],
  [7.01, 'touchUp'],
  [9, 'touchDown', [1, -1.5], 'Touch simplify 1'],
  [9.01, 'touchUp'],
  [11.5, 'touchDown', [1, -1.5], 'Touch simplify 2'],
  [11.51, 'touchUp'],
  [12.5, 'touchDown', [1, -1.5], 'Touch simplify 3'],
  [12.51, 'touchUp'],
  [15, 'touchDown', [1, -1.5], 'Touch simplify 4'],
  [15.01, 'touchUp'],
  [16.5, 'touchDown', [1, -1.5], 'Touch simplify 5'],
  [16.51, 'touchUp'],
];
// //////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////


var steps = [];
let index = 0;
let [time] = touches[0]
const duration = 19;
const step = 0.5;
for (t = 0; t <= duration; t = Math.round((t + step) * 10) / 10) {
  let same = false;
  while (time <= t) {
    steps.push(touches[index]);
    index += 1;
    if (time === t) {
      same = true;
    }
    if (index < touches.length) {
      [time] = touches[index];
    } else {
      time = duration + 1;
    }
  }
  if (!same) {
    steps.push([t]);
  }
}


if (typeof process === 'object') {
  module.exports = { steps, title };
} else {
  const startSteps = () => {
    steps.forEach((step) => {
      if (Array.isArray(step)) {
        const [time, action, location] = step;
        if (action != null) {
          const loc = Fig.tools.g2.getPoint(location || [0, 0]);
          setTimeout(() => {
            figure[action](location);
          }, time * 1000);
        }
      }
    });
  }

  timeoutId = setTimeout(() => {
    startSteps();
  }, 1000);
}

