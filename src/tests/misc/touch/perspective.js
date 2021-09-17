/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition Fig */
/* eslint-disable block-scoped-var, object-property-newline */

if (typeof process === 'object') {
  /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
  var { tools } = require('../../../index').default;
  var { makePrimitive, makeCollection, createFigure } = require('./layout');
}

createFigure('perspective');
function getShapes(getPos) {
  // const angle = (name, options, mods) => makeAngle(name, options, mods, getPos);

  /* eslint-disable object-curly-newline */
  return [
    makePrimitive('standard'),
    makePrimitive('larger', { touchScale: 2 }),
    makePrimitive('smaller', { touchScale: 0.5 }),
    makeCollection('collection-no-scale'),
    makeCollection('collection-with-scale', { touchScale: 2 }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  // 'label-autoForm': (e) => {
  //   e.label.eqn.showForm('1');
  // },
};

const getValues = {
  standard: {
    element: 'standard',
    expect: 2,
    when: e => e.custom.count,
  },
  larger: {
    element: 'larger',
    expect: 3,
    when: e => e.custom.count,
  },
  smaller: {
    element: 'smaller',
    expect: 2,
    when: e => e.custom.count,
  },
  'collection-no-scale': {
    element: 'collection-no-scale',
    expect: 3,
    when: e => e.custom.count,
  },
  'collection-with-scale': {
    element: 'collection-with-scale',
    expect: 3,
    when: e => e.custom.count,
  },
};

const twoDtoGL = (x, y, px, py) => {
  const ox = (x + px) / 4.5;
  const oy = (y + py) / 4.5;
  return [ox, oy];
};

const move = {
  standard: {
    element: 'standard',
    events: [
      ['touchDownHandler', twoDtoGL(-4, 4, 0.2, 0)], // touch
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-4, 4, 0.3, 0)], // miss
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-4, 4, -0.3, 0.4)], // touch
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-4, 4, -0.3, -0.2)], // miss
      ['touchUp'],
    ],
  },
  larger: {
    element: 'larger',
    events: [
      ['touchDownHandler', twoDtoGL(-3, 4, 0, 0)], // touch
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-3, 4, -0.4, 0)], // touch
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-3, 4, -0.55, 0)], // miss
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-3, 4, 0.35, -0.65)], // touch
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-3, 4, 0.4, -0.7)], // miss
      ['touchUp'],
    ],
  },
  smaller: {
    element: 'smaller',
    events: [
      ['touchDownHandler', twoDtoGL(-2, 4, 0, 0)], // touch
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-2, 4, 0.1, 0)], // touch
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-2, 4, 0.2, 0)], // miss
      ['touchUp'],
    ],
  },
  'collection-no-scale': {
    element: 'collection-no-scale',
    events: [
      ['touchDownHandler', twoDtoGL(-1, 4, 0, 0)], // miss
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-1, 4, 0, -0.2)], // miss
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-1, 4, 0.18, 0.05)], // touch
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-1, 4, 0.1, -0.2)], // touch
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(-1, 4, -0.1, -0.2)], // touch
      ['touchUp'],
    ],
  },
  'collection-with-scale': {
    element: 'collection-with-scale',
    events: [
      ['touchDownHandler', twoDtoGL(0, 4, 0, 0)], // touch
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(0, 4, 0, -0.5)], // touch
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(0, 4, 0, -0.6)], // miss
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(0, 4, -0.4, -0.4)], // touch
      ['touchUp'],
      ['touchDownHandler', twoDtoGL(0, 4, -0.5, -0.5)], // miss
      ['touchUp'],
    ],
  },
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

  startMove = () => {
    if (move == null || Object.keys(move).length === 0) {
      return;
    }
    Object.keys(move).forEach((name) => {
      const element = figure.getElement(move[name].element);
      const p = element.getPosition('figure');
      move[name].events.forEach((event) => {
        const [action] = event;
        const loc = Fig.tools.g2.getPoint(event[1] || [0, 0]);
        figure[action](loc);
      });
    });
    figure.setFirstTransform();
  };
  startMove();

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
        Fig.tools.misc.Console(`pass: ${title}`);
      } else {
        Fig.tools.misc.Console(`fail: ${title}: Expected: ${getValues[title].expect} - Got: ${value}`);
      }
    });
  };
  startGetValues();
}
