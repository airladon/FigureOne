/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  var { tools } = require('../../../index.js').default;
}


function getShapes(getPos) {
  let index = 0;
  const line = (name, options, mods) => {
    const { x, y } = getPos(index);
    const indexName = `${index}`;
    index += 1;
    const o = {
      name,
      make: 'collections.line',
      options: tools.misc.joinObjects({}, {
        color: [1, 0, 0, 0.7],
        p1: [-0.2, 0],
        width: 0.05,
        length: 0.4,
      }, options),
      mods: tools.misc.joinObjects({}, {
        isTouchable: true,
        onClick: () => tools.misc.Console(`${indexName}: ${name}`),
      }, mods),
    };
    o.options.p1 = tools.g2.getPoint(o.options.p1).add(x, y);
    if (o.options.p2 != null) {
      o.options.p2 = tools.g2.getPoint(o.options.p2).add(x, y);
    }
    return o;
  };

  /* eslint-disable object-curly-newline */
  return [
    line('grow'),
    line('lengthAnimation'),
    line('lengthAnimationStep'),
    line('pulse-defaults', {
      label: { text: 'a', offset: 0.05, color: [1, 0, 1, 1] },
      arrow: { head: 'barb', scale: 1 },
      width: 0.01,
      pulseWidth: {
        line: 5, arrow: 2, label: { scale: 3, yAlign: 'bottom' }, duration: 2,
      },
    }),
    line('pulseWidth', {
      label: { text: 'a', offset: 0.05 },
      arrow: { head: 'barb', scale: 1 },
      width: 0.01,
    }),
  ];
}

let timeoutId;
let startUpdates;

const updates = {
  grow: (e) => {
    e.animations.new()
      .length({ start: 0, target: 0.5, duration: 2 })
      .start();
  },
  'pulse-defaults': (e) => {
    e.pulseWidth();
  },
  pulseWidth: (e) => {
    e.pulseWidth({
      line: 3, arrow: 1.5, label: 2, duration: 2,
    });
  },
  lengthAnimation: (e) => {
    e.animations.new()
      .length({ start: 0, target: 0.5, duration: 2 })
      .start();
  },
  lengthAnimationStep: (e) => {
    e.animations.new()
      .then(e.animations.length({ start: 0, target: 0.5, duration: 2 }))
      .start();
  },
};


if (typeof process === 'object') {
  module.exports = {
    getShapes,
    updates,
  };
} else {
  figure.add(getShapes(index => getPosition(index)));
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

