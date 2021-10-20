/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var, object-property-newline */

if (typeof process === 'object') {
  /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
  var { tools } = require('../../../index').default;
  var { makeShape } = require('./common');
}

const figToClient = (p) => {
  const figureToPixelMatrix = figure.elements.spaceTransformMatrix('figure', 'pixel');
  const q = Fig.getPoint(p).transformBy(figureToPixelMatrix);
  return figure.pixelToClient(q);
};

const mousePan = (start, stop) => {
  const figureToPixelMatrix = figure.elements.spaceTransformMatrix('figure', 'pixel');
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
  figure.gestureCanvas.dispatchEvent(mouseUpEvent);
  figure.gesture.endHandler();
};

const toTouch = (...p) => p.map(q => ({ clientX: q.x, clientY: q.y }));

const touchPan = (startFig, stopFig) => {
  const start = figToClient(startFig);
  const stop = figToClient(stopFig);
  const tdEvent = new Event('touchstart', { bubbles: true, cancelable: true });
  tdEvent.touches = toTouch(start);
  tdEvent.targetTouches = toTouch(start);

  const tmEvent = new Event('touchmove', { bubbles: true, cancelable: true });
  tmEvent.touches = toTouch(stop);
  tmEvent.targetTouches = toTouch(stop);

  const touchEndEvent = new Event('touchend', {});
  touchEndEvent.targetTouches = [];

  figure.gestureCanvas.dispatchEvent(tdEvent);
  figure.gestureCanvas.dispatchEvent(tmEvent);
  figure.gestureCanvas.dispatchEvent(tmEvent);
  figure.gestureCanvas.dispatchEvent(touchEndEvent);
  figure.gesture.touchEndHandler(touchEndEvent);
};


const touchZoom = (start, stop) => {
  const figureToPixelMatrix = figure.elements.spaceTransformMatrix('figure', 'pixel');

  const startp1 = figToClient(start.p1);
  const startp2 = figToClient(start.p2);
  const stopp1 = figToClient(stop.p1);
  const stopp2 = figToClient(stop.p2);

  const tdEvent1 = new Event('touchstart', { bubbles: true, cancelable: true });
  tdEvent1.touches = toTouch(startp1);
  tdEvent1.targetTouches = toTouch(startp1);
  const tdEvent2 = new Event('touchstart', { bubbles: true, cancelable: true });
  tdEvent2.touches = toTouch(startp1, startp2);
  tdEvent2.targetTouches = toTouch(startp1, startp2);

  const tmEvent = new Event('touchmove', { bubbles: true, cancelable: true });
  tmEvent.touches = toTouch(stopp1, stopp2);
  tmEvent.targetTouches = toTouch(stopp1, stopp2);

  const touchEndEvent = new Event('touchend', {});
  touchEndEvent.targetTouches = [];

  figure.gestureCanvas.dispatchEvent(tdEvent1);
  figure.gestureCanvas.dispatchEvent(tdEvent2);
  figure.gestureCanvas.dispatchEvent(tmEvent);
  figure.gestureCanvas.dispatchEvent(tmEvent);
  figure.gestureCanvas.dispatchEvent(touchEndEvent);
  figure.gesture.touchEndHandler(touchEndEvent);
};

const mouseWheelZoom = (deltaY, position) => {
  const figureToPixelMatrix = figure.elements.spaceTransformMatrix('figure', 'pixel');
  const positionPixel = Fig.getPoint(position).transformBy(figureToPixelMatrix);
  const positionClient = figure.pixelToClient(positionPixel);
  const mouseMoveEvent = new MouseEvent('mousemove', {
    clientX: positionClient.x,
    clientY: positionClient.y,
  });
  const mouseWheelEvent = new Event('wheel', { bubbles: true, cancelable: true });
  mouseWheelEvent.deltaY = deltaY;
  figure.gestureCanvas.dispatchEvent(mouseMoveEvent);
  figure.gestureCanvas.dispatchEvent(mouseWheelEvent);
};

function getShapes(getPos) {
  const shape = (name, options, mods) => makeShape(name, options, mods, getPos);

  /* eslint-disable object-curly-newline */
  return [
    // Basic zoom and pan
    ...shape('wheelZoomIn'),
    ...shape('wheelZoomOut'),
    ...shape('wheelZoomInOut'),
    ...shape('wheelZoomInOutDiffPos'),
    ...shape('wheelZoomInPan'),
    ...shape('touchPan'),
    ...shape('touchPanx2'),
    ...shape('touchZoom', { zoom: { sensitivity: 2 } }),
    ...shape('touchZoomSensitive', { zoom: { sensitivity: 10 } }),
    ...shape('touchZoomOut', { zoom: { sensitivity: 5 } }),

    // options
    ...shape('wheelPanDisabled', { pan: false }),
    ...shape('wheelZoomDisabled', { zoom: false }),
    ...shape('widthHeight', { width: 1, height: 0.5 }),
    ...shape('align', { width: 0.5, height: 0.2, xAlign: 'left', yAlign: 'bottom' }),
    ...shape('sensitivity', { zoom: { sensitivity: 1.5 } }),
    ...shape('max', { zoom: { max: 1.1 } }),
    ...shape('min', { zoom: { min: 0.9 } }),
    ...shape('position', { zoom: { position: [2.5, 3.5] } }),
    ...shape('setZoom'),
    ...shape('setZoomOffset'),
    ...shape('setPan'),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  wheelZoomIn: (e) => {
    const p = e.getPosition().add(-0.05, -0.1);
    mouseWheelZoom(500, p);
  },
  wheelZoomOut: (e) => {
    const p = e.getPosition().add(-0.05, -0.1);
    mouseWheelZoom(-500, p);
  },
  wheelZoomInOut: (e) => {
    const p = e.getPosition().add(-0.05, -0.1);
    mouseWheelZoom(500, p);
    mouseWheelZoom(-500, p);
  },
  wheelZoomInOutDiffPos: (e) => {
    const p = e.getPosition().add(-0.05, -0.1);
    mouseWheelZoom(500, p);
    mouseWheelZoom(-500, p.add(0.15, 0));
  },
  wheelZoomInPan: (e) => {
    const p = e.getPosition().add(-0.05, -0.1);
    mouseWheelZoom(500, p);
    mousePan(p, p.add(0.1, 0.1));
  },
  touchPan: (e) => {
    const p = e.getPosition().add(-0.05, -0.1);
    touchPan(p, p.add(-0.05, 0.1));
  },
  touchPanx2: (e) => {
    const p = e.getPosition().add(-0.05, -0.1);
    touchPan(p, p.add(0, 0.1));
    touchPan(p, p.add(-0.05, 0.15));
  },
  touchZoom: (e) => {
    const p = e.getPosition().add(-0.05, -0.1);
    touchZoom(
      { p1: p.add(-0.05, -0.05), p2: p.add(0.05, 0.05) },
      { p1: p.add(-0.1, -0.1), p2: p.add(0.1, 0.1) },
    );
  },
  touchZoomSensitive: (e) => {
    const p = e.getPosition().add(-0.05, -0.1);
    touchZoom(
      { p1: p.add(-0.05, -0.05), p2: p.add(0.05, 0.05) },
      { p1: p.add(-0.1, -0.1), p2: p.add(0.1, 0.1) },
    );
  },
  touchZoomOut: (e) => {
    const p = e.getPosition().add(-0.05, -0.1);
    touchZoom(
      { p1: p.add(-0.1, -0.1), p2: p.add(0.1, 0.1) },
      { p1: p.add(-0.05, -0.05), p2: p.add(0.05, 0.05) },
    );
  },
  wheelPanDisabled: (e) => {
    const p = e.getPosition().add(-0.05, -0.1);
    mousePan(p, p.add(0.1, 0.1));
  },
  wheelZoomDisabled: (e) => {
    const p = e.getPosition().add(-0.05, -0.1);
    mouseWheelZoom(500, p);
  },
  widthHeight: (e) => {
    const p = e.getPosition().add(-0.4, -0.2);
    mouseWheelZoom(500, p);
  },
  sensitivity: (e) => {
    const p = e.getPosition().add(-0.25, -0.1);
    mouseWheelZoom(500, p);
  },
  max: (e) => {
    const p = e.getPosition().add(-0.25, -0.1);
    mouseWheelZoom(500, p);
  },
  min: (e) => {
    const p = e.getPosition().add(-0.25, -0.1);
    mouseWheelZoom(-500, p);
  },
  position: (e) => {
    const p = e.getPosition().add(-0.25, -0.1);
    mouseWheelZoom(500, p);
  },
  setZoom: (e) => {
    const p = e.getPosition().add(-0.25, -0.1);
    e.setZoom({ mag: 1.5, position: p });
  },
  setZoomOffset: (e) => {
    const p = e.getPosition().add(-0.25, -0.1);
    e.setZoom({ mag: 1.5, offset: p.scale(1 / 1.5).sub(p).scale(-1) });
  },
  setPan: (e) => {
    const p = e.getPosition().add(-0.25, -0.1);
    e.setPan([0.1, 0.1]);
  },
};

const getValues = {
  // getAngle: {
  //   element: 'border-children',
  //   expect: 1,
  //   when: e => tools.math.round(e.getAngle(), 3),
  // },
};


const move = {
  // defaultTouch: {
  //   element: 'defaultTouch',
  //   events: [
  //     ['touchDown', [0, 0]],
  //   ],
  // },
};

if (typeof process === 'object') {
  module.exports = {
    getShapes,
    updates,
    getValues,
    move,
  };
} else {
  figure.add(getShapes(index => getPosition(index)));
  startUpdates = () => {
    Object.keys(updates).forEach((name) => {
      updates[name](figure.getElement(name));
      figure.setFirstTransform();
    });
  };
  startUpdates();

  startGetValues = () => {
    if (getValues == null || Object.keys(getValues).length === 0) {
      return;
    }
    // tools.misc.Console('');
    // tools.misc.Console('Get Values');
    Object.keys(getValues).forEach((title) => {
      const value = getValues[title].when(figure.getElement(getValues[title].element));
      const expected = getValues[title].expect;
      const result = JSON.stringify(expected) === JSON.stringify(value);
      if (result) {
        tools.misc.Console(`pass: ${title}`);
      } else {
        tools.misc.Console(`fail: ${title}: Expected: ${getValues[title].expect} - Got: ${value}`);
      }
    });
  };
  startGetValues();

  startMove = () => {
    if (move == null || Object.keys(move).length === 0) {
      return;
    }
    Object.keys(move).forEach((name) => {
      const element = figure.getElement(move[name].element);
      const p = element.getPosition('figure');
      move[name].events.forEach((event) => {
        const [action] = event;
        const loc = tools.g2.getPoint(event[1] || [0, 0]);
        figure[action]([loc.x + p.x, loc.y + p.y]);
      });
    });
    figure.setFirstTransform();
  };
  startMove();
}
