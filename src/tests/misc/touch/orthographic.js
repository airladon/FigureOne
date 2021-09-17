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

createFigure('orthographic');
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
    expect: 1,
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
    expect: 2,
    when: e => e.custom.count,
  },
  'collection-with-scale': {
    element: 'collection-with-scale',
    expect: 4,
    when: e => e.custom.count,
  },
};


const move = {
  standard: {
    element: 'standard',
    events: [
      ['touchDown', [0.2, 0]],
      ['touchUp'],
      ['touchDown', [0.21, 0]],
      ['touchUp'],
    ],
  },
  larger: {
    element: 'larger',
    events: [
      ['touchDown', [0, 0]],
      ['touchUp'],
      ['touchDown', [0.21, 0]],
      ['touchUp'],
      ['touchDown', [0.4, 0]],
      ['touchUp'],
      ['touchDown', [0.42, 0]],
      ['touchUp'],
    ],
  },
  smaller: {
    element: 'smaller',
    events: [
      ['touchDown', [0, 0]],
      ['touchUp'],
      ['touchDown', [0.1, 0]],
      ['touchUp'],
      ['touchDown', [0.11, 0]],
      ['touchUp'],
    ],
  },
  'collection-no-scale': {
    element: 'collection-no-scale',
    events: [
      ['touchDown', [0, 0]],
      ['touchUp'],
      ['touchDown', [0.1, 0]],
      ['touchUp'],
      ['touchDown', [0.1, -0.2]],
      ['touchUp'],
      ['touchDown', [-0.1, -0.2]],
      ['touchUp'],
    ],
  },
  'collection-with-scale': {
    element: 'collection-with-scale',
    events: [
      ['touchDown', [0, 0.1]],
      ['touchUp'],
      ['touchDown', [0, 0]],
      ['touchUp'],
      ['touchDown', [0.1, 0]],
      ['touchUp'],
      ['touchDown', [0.1, -0.2]],
      ['touchUp'],
      ['touchDown', [-0.1, -0.2]],
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
        figure[action]([loc.x + p.x, loc.y + p.y]);
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
