/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
  var { tools } = require('../../../../index').default;
}

let index = 0;
function makeShape(name, options, mods, getPos) {
  const { x, y } = getPos(index);
  // const indexName = `${index}`;
  index += 1;
  const o = {
    name,
    make: 'collections.equation',
    options: tools.misc.joinObjects({}, {
      color: [1, 0, 0, 0.9],
      position: [0, 0],
      scale: 0.8,
    }, options),
    mods: tools.misc.joinObjects({}, mods),
  };
  o.options.position = tools.g2.getPoint(options.position || [0, 0]).add(x, y);
  return o;
}

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  module.exports = {
    makeShape,
  };
}

const col = content => ({ color: [content, [0, 0, 1, 1]] });

function getShapes(getPos) {
  const shape = (name, options, mods) => makeShape(name, options, mods, getPos);

  /* eslint-disable object-curly-newline */
  return [
    shape('color-only', {
      forms: {
        0: ['a', 'b', 'c'],
        1: ['a', col('b'), 'c'],
        2: ['a', 'b', 'c'],
      },
      position: [-0.3, 0],
    }),
    shape('color-out-only', {
      forms: {
        0: ['a', col('b'), 'c'],
        1: ['a', 'b', 'c'],
      },
      position: [-0.3, 0],
    }),
    shape('dissolveIn', {
      forms: {
        0: ['a', 'b', 'c'],
        1: ['a', col('b'), 'c', 'd'],
      },
      position: [-0.3, 0],
    }),
    shape('dissolveOut', {
      forms: {
        0: ['a', 'b', 'c'],
        1: ['a', col('b')],
      },
      position: [-0.3, 0],
    }),
    shape('move', {
      forms: {
        0: ['a', 'b', 'c'],
        1: ['a', col('b'), { container: ['c', 0.3] }],
      },
      position: [-0.3, 0],
    }),
    shape('dissolveOutMoveIn', {
      forms: {
        0: ['a', 'b', 'c'],
        1: ['a', 'd', col('b')],
      },
      position: [-0.3, 0],
    }),
    shape('dissolveOutDissolveIn', {
      forms: {
        0: ['a', 'b', 'c'],
        1: ['a', col('b'), 'd'],
      },
      position: [-0.3, 0],
    }),
  ];
}

let timeoutId;
let startUpdates;

const updates = {
  'color-only': (e) => {
    e.showForm('0');
    e.animations.new()
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .start();
  },
  'color-out-only': (e) => {
    e.showForm('0');
    e.animations.new()
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .start();
  },
  dissolveIn: (e) => {
    e.showForm('0');
    e.animations.new()
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .start();
  },
  dissolveOutMoveIn: (e) => {
    e.showForm('0');
    e.animations.new()
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .start();
  },
  dissolveOut: (e) => {
    e.showForm('0');
    e.animations.new()
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .start();
  },
  move: (e) => {
    e.showForm('0');
    e.animations.new()
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .start();
  },
  dissolveOutDissolveIn: (e) => {
    e.showForm('0');
    e.animations.new()
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .start();
  },
};

// const getValues = {};
// const move = {};

if (typeof process === 'object') {
  module.exports = {
    getShapes,
    updates,
    // getValues,
    // move,
  };
} else {
  figure.add(getShapes(i => getPosition(i)));
  startUpdates = () => {
    Object.keys(updates).forEach((name) => {
      updates[name](figure.getElement(name));
      figure.setFirstTransform();
    });
  };

  timeoutId = setTimeout(() => {
    startUpdates();
  }, (1000));
}

