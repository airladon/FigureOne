
/* global __frames __steps __duration __timeStep figure timeoutId Fig */
/* eslint-disable no-global-assign, no-eval */
/* eslint no-unused-vars: ['error', { 'vars': 'local' }] */
// eslint-disable-next-line no-unused-vars
function __finish(__figure) {
  __steps = [];
  let index = 0;
  let [cumTime] = __frames.jest[0];
  if (__duration === -1) {
    __duration = 0;
    __frames.jest.forEach((f) => {
      __duration += f[0];
    });
    __duration = Math.round(__duration * 1000) / 1000;
  }
  for (let t = 0; t <= __duration; t = Math.round((t + __timeStep) * 100) / 100) {
    let same = false;
    let cumTimeIncremental = 0;
    while (cumTime <= t) {
      __steps.push([
        Math.round((cumTime + cumTimeIncremental) * 1000) / 1000,
        ...__frames.jest[index].slice(1),
      ]);
      index += 1;
      if (cumTime === t) {
        same = true;
      }
      if (index < __frames.jest.length) {
        const [delta] = __frames.jest[index];
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
  console.log(__steps)
  if (typeof process !== 'object') {
    // eslint-disable-next-line no-console
    // console.log(__steps);
    const { nav } = figure.getElement(__frames.nav);
    const { slides, stop } = __frames;
    let lastSlide = slides.length - 1;
    if (stop != null) {
      lastSlide = stop;
    }
    let steps = '';
    const startSteps = () => {
      // cumTime = 0;
      let slideIndex = 0;
      let actionIndex = 0;
      let lastTime = performance.now();
      const getDeltaTime = () => {
        const now = performance.now();
        const delta = Math.round((performance.now() - lastTime) / 100) / 10;
        lastTime = now;
        return delta;
      };
      const { round } = Fig.tools.math;
      const nextAction = () => {
        let delay = 0;
        if (slides[slideIndex].length > 0) {
          const [deltaTime, action, location, description] = slides[slideIndex][actionIndex];
          if (action != null) {
            const loc = Fig.tools.g2.getPoint(location || [0, 0]);
            if (action.startsWith('touch')) {
              __figure[action](loc);
              // steps.push([getDeltaTime(), action, location]);
              steps = `${steps}[${deltaTime}, '${action}', [${round(loc.x, 2)}, ${round(loc.y, 2)}], '${description}'],\n`;
            } else if (action === 'tap') {
              __figure.touchDown(loc);
              __figure.touchUp();
              steps = `${steps}[${deltaTime}, 'touchDown', [${round(loc.x, 2)}, ${round(loc.y, 2)}], '${description}'],\n`;
              steps = `${steps}[0, 'touchUp'],\n`;
              // steps.push([deltaTime, 'touchDown', location]);
              // steps.push([0, 'touchUp']);
            } else {
              eval(action);
              // steps.push([deltaTime, action]);
              steps = `${steps}[${deltaTime}, ${action}]\n`;
            }
          }
          if (actionIndex + 1 < slides[slideIndex].length) {
            actionIndex += 1;
            setTimeout(() => nextAction(), deltaTime * 1000);
            return;
          }
          delay = deltaTime;
        }

        actionIndex = 0;
        if (slideIndex + 1 < slides.length && slideIndex + 1 <= lastSlide) {
          slideIndex += 1;
          setTimeout(() => {
            const loc = figure.getElement(__frames.next).getPosition('figure');
            nav.subscriptions.add('steady', () => {
              setTimeout(() => {
                steps = `${steps}[${getDeltaTime()}, 'touchDown', [${round(loc.x, 2)}, ${round(loc.y, 2)}], 'Next Slide - ${slideIndex}'],\n`;
                steps = `${steps}[0, 'touchUp'],\n`;
                nextAction();
              }, 500);
            }, 1);
            getDeltaTime();
            __figure.touchDown(loc);
            __figure.touchUp();
          }, delay * 1000);
        } else {
          console.log(steps)
        }
      };
      if (__frames.start !== 0) {
        nav.goToSlide(__frames.start);
        slideIndex = __frames.start;
      }
      nextAction();
      // __frames.slides.forEach((touch) => {
      //   if (Array.isArray(touch)) {
      //     const [deltaTime, action, location] = touch;
      //     if (action != null) {
      //       if (action.startsWith('touch')) {
      //         const loc = Fig.tools.g2.getPoint(location || [0, 0]);
      //         setTimeout(() => {
      //           __figure[action](loc);
      //         }, cumTime * 1000);
      //       } else {
      //         setTimeout(() => {
      //           // action(figure);
      //           eval(action);
      //         }, cumTime * 1000);
      //       }
      //     }
      //   }
      // });
    };

    timeoutId = setTimeout(() => {
      startSteps();
    }, 1000);
  }
}
if (typeof process === 'object') {
  module.exports = { __finish };
}
