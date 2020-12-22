
/* global __frames __steps __duration __timeStep */
__steps = [];
let index = 0;
let [time] = __frames[0];
// const duration = 19;
// const step = 0.5;
for (t = 0; t <= __duration; t = Math.round((t + __timeStep) * 10) / 10) {
  let same = false;
  while (time <= t) {
    __steps.push(__frames[index]);
    index += 1;
    if (time === t) {
      same = true;
    }
    if (index < __frames.length) {
      [time] = __frames[index];
    } else {
      time = __duration + 1;
    }
  }
  if (!same) {
    __steps.push([t]);
  }
}

if (typeof process === 'object') {
} else {
  const startSteps = () => {
    __frames.forEach((touch) => {
      if (Array.isArray(touch)) {
        const [time, action, location] = touch;
        if (action != null) {
          if (action.startsWith('touch')) {
            const loc = Fig.tools.g2.getPoint(location || [0, 0]);
            setTimeout(() => {
              figure[action](location);
            }, time * 1000);
          } else {
            setTimeout(() => {
              // action(figure);
              eval(action);
            }, time * 1000);
          }
        }
      }
    });
  }

  timeoutId = setTimeout(() => {
    startSteps();
  }, 1000);
}

