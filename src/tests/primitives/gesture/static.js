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

const mousePan = (start, stop) => {
  const figureToPixelMatrix = figure.elements.spaceTransformMatrix('figure', 'pixel');
  const startPixel = Fig.getPoint(start).transformBy(figureToPixelMatrix);
  const stopPixel = Fig.getPoint(stop).transformBy(figureToPixelMatrix);
  const startClient = figure.pixelToClient(startPixel);
  const stopClient = figure.pixelToClient(stopPixel);
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
    ...shape('wheelZoomIn'),
    ...shape('wheelZoomOut'),
    ...shape('wheelZoomInOut'),
    ...shape('wheelZoomInOutDiffPos'),
    ...shape('wheelZoomInPan'),
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
  // 'on-color': {
  //   element: 'on-color',
  //   events: [
  //     ['touchDown', [0, 0]],
  //   ],
  // },
  // 'colors-switch': {
  //   element: 'colors-switch',
  //   events: [
  //     ['touchDown', [0, 0]],
  //   ],
  // },
  // movePad: {
  //   element: 'move-pad',
  //   events: [
  //     ['touchDown', [0, 0]],
  //     ['touchMove', [-0.1, -0.1]],
  //     ['touchMove', [-0.1, -0.1]],
  //     ['touchUp'],
  //     ['touchDown', [0.3, 0]],
  //     ['touchMove', [0.4, 0.1]],
  //     ['touchMove', [0.4, 0.1]],
  //     ['touchUp'],
  //     ['touchDown', [0, 0.3]],
  //     ['touchMove', [-0.1, 0.4]],
  //     ['touchMove', [-0.1, 0.4]],
  //     ['touchUp'],
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
