/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure steps */
/* eslint-disable block-scoped-var, object-property-newline */


// if (typeof process === 'object') {
//   /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
//   var { tools } = require('../../../index.js').default;
// } else {
//   var { tools } = Fig;
// }

const touches = [
  [0.1, 'touchDown', [-1.5, -1], 'Touch Total Angle New'],
  [0.1001, 'touchUp'],
  [3, 'touchDown', [-0.5, -1], 'Touch Total Angle Old'],
  [3.001, 'touchUp'],
  [5, 'touchDown', [0, -1], 'Touch -a'],
  [5.01, 'touchUp'],
  [7.0, 'touchDown', [0.4, -1], 'Touch -b'],
  [7.01, 'touchUp'],
  [9, 'touchDown', [1.2, -1], 'Touch -c'],
  [9.01, 'touchUp'],
  [11, 'touchDown', [1, -1.5], 'Touch simplify'],
  [11.01, 'touchUp'],
];

var steps = [];
let index = 0;
let [time] = touches[0]
const duration = 14;
const step = 0.3;
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
  module.exports = { steps };
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

