
/* global __frames __steps __duration __timeStep __startSteps figure timeoutId Fig */
/* eslint-disable no-global-assign, no-eval */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
// eslint-disable-next-line no-unused-vars
function __finish(__figure) {
  __steps = [];
  let index = 0;
  let [cumTime] = __frames[0];
  if (__duration === -1) {
    __duration = 0;
    __frames.forEach((f) => {
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
    const mouseWheelZoom = (delta, position) => {
      const figureToPixelMatrix = figure.elements.spaceTransformMatrix('figure', 'pixel');
      const positionPixel = Fig.getPoint(position).transformBy(figureToPixelMatrix);
      const positionClient = figure.pixelToClient(positionPixel);
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: positionClient.x,
        clientY: positionClient.y,
      });
      const mouseWheelEvent = new Event('wheel', { bubbles: true, cancelable: true });
      // eslint-disable-next-line prefer-destructuring
      mouseWheelEvent.deltaX = delta[0];
      // eslint-disable-next-line prefer-destructuring
      mouseWheelEvent.deltaY = delta[1];
      figure.gestureCanvas.dispatchEvent(mouseMoveEvent);
      figure.gestureCanvas.dispatchEvent(mouseWheelEvent);
    };
    const mousePan = (start, stop) => {
      const figToClient = (p) => {
        const figureToPixelMatrix = figure.elements.spaceTransformMatrix('figure', 'pixel');
        const q = Fig.getPoint(p).transformBy(figureToPixelMatrix);
        return figure.pixelToClient(q);
      };
      const startClient = figToClient(start);
      const stopClient = figToClient(stop);
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: startClient.x,
        clientY: startClient.y,
      });
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: stopClient.x,
        clientY: stopClient.y,
      });
      const mouseUpEvent = new MouseEvent('mouseup', {});

      figure.gestureCanvas.dispatchEvent(mouseDownEvent);
      figure.gestureCanvas.dispatchEvent(mouseMoveEvent);
      figure.gestureCanvas.dispatchEvent(mouseMoveEvent);
      figure.gestureCanvas.dispatchEvent(mouseMoveEvent);
      figure.gestureCanvas.dispatchEvent(mouseUpEvent);
      figure.gesture.endHandler();
    };
    const mouseClick = (pos) => {
      const figToClient = (p) => {
        const figureToPixelMatrix = figure.elements.spaceTransformMatrix('figure', 'pixel');
        const q = Fig.getPoint(p).transformBy(figureToPixelMatrix);
        return figure.pixelToClient(q);
      };
      const downClient = figToClient(pos);
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: downClient.x,
        clientY: downClient.y,
      });
      const mouseUpEvent = new MouseEvent('mouseup', {});

      figure.gestureCanvas.dispatchEvent(mouseDownEvent);
      figure.gestureCanvas.dispatchEvent(mouseUpEvent);
      figure.gesture.endHandler();
    };
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
              let loc;
              if (Fig.tools.g2.isParsablePoint(location)) {
                loc = Fig.tools.g2.getPoint(location || [0, 0]);
              }
              setTimeout(() => {
                __figure[action](loc);
              }, cumTime * 1000);
            } else if (action === 'mouseWheelZoom') {
              setTimeout(() => {
                mouseWheelZoom(location[0], location[1]);
              }, cumTime * 1000);
            } else if (action === 'mousePan') {
              setTimeout(() => {
                mousePan(location[0], location[1]);
              }, cumTime * 1000);
            } else if (action === 'mouseClick') {
              setTimeout(() => {
                mouseClick(location[0]);
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
    }, __startSteps);
  }
}
if (typeof process === 'object') {
  module.exports = { __finish };
}
