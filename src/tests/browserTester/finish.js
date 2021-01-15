
/* global __frames __steps __duration __timeStep figure timeoutId Fig */
/* eslint-disable no-global-assign, no-eval */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
// eslint-disable-next-line no-unused-vars
function __finish(__figure) {
  __steps = [];
  let index = 0;
  let [cumTime] = __frames[0];
  // const duration = 19;
  // const step = 0.5;
  for (let t = 0; t <= __duration; t = Math.round((t + __timeStep) * 100) / 100) {
    let same = false;
    let cumTimeIncremental = 0;
    while (cumTime <= t) {
      __steps.push([
        Math.round((cumTime + cumTimeIncremental) * 1000) / 1000,
        ...__frames[index].slice(1),
      ]);
      index += 1;
      if (cumTime === t) {
        same = true;
      }
      if (index < __frames.length) {
        const [delta] = __frames[index];
        cumTime = Math.round((cumTime + delta) * 1000) / 1000;
        if (delta === 0) {
          cumTimeIncremental += 0.001;
        }
      } else {
        cumTime = Math.round((__duration + 1) * 1000) / 1000;
      }
    }
    if (!same) {
      __steps.push([t]);
    }
  }

  if (typeof process !== 'object') {
    // eslint-disable-next-line no-console
    console.log(__steps);
    const startSteps = () => {
      cumTime = 0;
      __frames.forEach((touch) => {
        if (Array.isArray(touch)) {
          const [deltaTime, action, location] = touch;
          cumTime += deltaTime;
          if (deltaTime === 0) {
            cumTime += 0.001;
          }
          if (action != null) {
            if (action.startsWith('touch')) {
              const loc = Fig.tools.g2.getPoint(location || [0, 0]);
              setTimeout(() => {
                __figure[action](loc);
              }, cumTime * 1000);
            } else {
              setTimeout(() => {
                // action(figure);
                eval(action);
              }, cumTime * 1000);
            }
          }
        }
      });
    };

    timeoutId = setTimeout(() => {
      startSteps();
    }, 1000);
  }
}
if (typeof process === 'object') {
  module.exports = { __finish };
}
