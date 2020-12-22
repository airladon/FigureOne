
/* global touches steps */
steps = [];
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
  // module.exports = { steps, title };
} else {
  const startSteps = () => {
    touches.forEach((touch) => {
      if (Array.isArray(touch)) {
        const [time, action, location] = touch;
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

