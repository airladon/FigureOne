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
      method: 'collections.line',
      options: tools.misc.joinObjects({}, {
        color: [1, 0, 0, 0.8],
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
    line('translator', { move: { type: 'translation' } }),
    line('start-rotator', { align: 'start', move: { type: 'rotation' } }),
    line('center-rotator', { align: 'center', move: { type: 'rotation' } }),
    line('end-rotator', { align: 'end', move: { type: 'rotation' } }),
    line('translate-rotate', { align: 'center', move: { type: 'centerTranslateEndRotation' } }),
    // line('lengthAnimation'),
    // line('lengthAnimationStep'),
    // line('pulse-defaults', {
    //   label: { text: 'a', offset: 0.05, color: [1, 0, 1, 1] },
    //   arrow: { head: 'barb', scale: 1 },
    //   width: 0.01,
    //   pulseWidth: {
    //     line: 5, arrow: 2, label: { scale: 3, yAlign: 'bottom' }, duration: 2,
    //   },
    // }),
    // line('pulseWidth', {
    //   label: { text: 'a', offset: 0.05 },
    //   arrow: { head: 'barb', scale: 1 },
    //   width: 0.01,
    // }),
  ];
}

let timeoutId;
let startUpdates;

const updates = {
  translate: {
    element: 'translator',
    events: [
      ['touchDown', [0.1, 0]],
      ['touchMove', [0.2, 0]],
      ['touchMove', [0.2, 0]],
      ['touchUp'],
    ],
  },
  rotateStart: {
    element: 'start-rotator',
    events: [
      ['touchDown', [0.3, 0]],
      ['touchMove', [0.3, 0.1]],
      ['touchMove', [0.3, 0.1]],
      ['touchUp'],
    ],
  },
  rotateCenter: {
    element: 'center-rotator',
    events: [
      ['touchDown', [0.1, 0]],
      ['touchMove', [0.1, 0.1]],
      ['touchMove', [0.1, 0.1]],
      ['touchUp'],
    ],
  },
  rotateEnd: {
    element: 'end-rotator',
    events: [
      ['touchDown', [-0.3, 0]],
      ['touchMove', [-0.3, 0.1]],
      ['touchMove', [-0.3, 0.1]],
      ['touchUp'],
    ],
  },
  translateRotate: {
    element: 'translate-rotate',
    events: [
      ['touchDown', [0.2, 0]],
      ['touchMove', [0.3, 0]],
      ['touchMove', [0.3, 0]],
      ['touchUp'],
      ['touchDown', [0.45, 0]],
      ['touchMove', [0.45, 0.1]],
      ['touchMove', [0.45, 0.1]],
      ['touchUp'],
    ],
  },
};


if (typeof process === 'object') {
  module.exports = {
    getShapes,
    updates,
  };
} else {
  figure.add(getShapes(index => getPosition(index)));
  figure.setFirstTransform();
  startUpdates = () => {
    Object.keys(updates).forEach((name) => {
      const element = figure.getElement(updates[name].element);
      const p = element.getPosition('figure');
      updates[name].events.forEach((event) => {
        const [action] = event;
        const loc = tools.g2.getPoint(event[1] || [0, 0]);
        figure[action]([loc.x + p.x, loc.y + p.y]);
      });
    });
  };
  startUpdates();

  // timeoutId = setTimeout(() => {
  //   startUpdates();
  // }, (1000));
}

