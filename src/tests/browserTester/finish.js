
/* global __frames __steps __duration __timeStep figure timeoutId Fig */
/* eslint-disable no-global-assign, no-eval */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
function __finish() {
  __steps = [];
  let index = 0;
  let [cumTime] = __frames[0];
  // const duration = 19;
  // const step = 0.5;
  for (let t = 0; t <= __duration; t = Math.round((t + __timeStep) * 10) / 10) {
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
        cumTime += delta;
        if (delta === 0) {
          cumTimeIncremental += 0.001;
        }
      } else {
        cumTime = __duration + 1;
      }
    }
    if (!same) {
      __steps.push([t]);
    }
  }
  console.log(__steps);

  if (typeof process !== 'object') {
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
                figure[action](loc);
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
__finish();
