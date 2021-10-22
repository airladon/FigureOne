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


function getShapes(getPos) {
  const shape = (name, options, mods) => makeShape(name, options, mods, getPos);

  /* eslint-disable object-curly-newline */
  return [
    /*
    .##........#######...######.....###....########.####..#######..##....##
    .##.......##.....##.##....##...##.##......##.....##..##.....##.###...##
    .##.......##.....##.##........##...##.....##.....##..##.....##.####..##
    .##.......##.....##.##.......##.....##....##.....##..##.....##.##.##.##
    .##.......##.....##.##.......#########....##.....##..##.....##.##..####
    .##.......##.....##.##....##.##.....##....##.....##..##.....##.##...###
    .########..#######...######..##.....##....##....####..#######..##....##
    */
    shape('labelsBottomTicksBottom', { labels: 'bottom', ticks: 'bottom' }),
    shape('labelsBottomTicksCenter', { labels: 'bottom', ticks: 'center' }),
    shape('labelsBottomTicksTop', { labels: 'bottom', ticks: 'top' }),
    shape('labelsTopTicksBottom', { labels: 'top', ticks: 'bottom' }),
    shape('labelsTopTicksCenter', { labels: 'top', ticks: 'center' }),
    shape('labelsTopTicksTop', { labels: 'top', ticks: 'top' }),
    shape('labelsLeftTicksLeft', { labels: 'left', ticks: 'left', axis: 'y' }),
    shape('labelsLeftTicksCenter', { labels: 'left', ticks: 'center', axis: 'y' }),
    shape('labelsLeftTicksRight', { labels: 'left', ticks: 'right', axis: 'y' }),
    shape('labelsRightTicksLeft', { labels: 'right', ticks: 'left', axis: 'y' }),
    shape('labelsRightTicksCenter', { labels: 'right', ticks: 'center', axis: 'y' }),
    shape('labelsRightTicksRight', { labels: 'right', ticks: 'right', axis: 'y' }),

    // No ticks
    shape('labelsBottomNoTicks', { labels: 'bottom', ticks: false }),
    shape('labelsTopNoTicks', { labels: 'top', ticks: false }),
    shape('labelsLeftNoTicks', { labels: 'left', ticks: false, axis: 'y' }),
    shape('labelsRightNoTicks', { labels: 'right', ticks: false, axis: 'y' }),

    // Location defined in objects
    shape('ObjectLocation', { labels: { location: 'top' }, ticks: { location: 'top' } }),

    // Multi ticks
    shape('topTop', { ticks: ['top', 'top'] }),
    shape('topTrue', { ticks: ['top', true] }),
    shape('locationAndOffset', { ticks: { location: 'top', offset: 0.1 } }),

    // Label and offset
    shape('labelTopOffset', { labels: { location: 'top', offset: [0.1, 0.1] } }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  // pan: e => e.panDeltaValue(0.5),
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
