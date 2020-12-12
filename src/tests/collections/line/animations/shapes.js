let tools;
if (typeof process === 'object') {
  // eslint-disable-next-line global-require
  tools = require('../../../index.js').default.tools;
} else {
  // eslint-disable-next-line no-undef
  tools = Fig.tools;
}


// ***************************************************
// ***************************************************
// ***************************************************
const xValues = tools.math.range(-4, 3.5, 1);
const yValues = tools.math.range(3.5, -3.5, -1);
let index = 0;

const line = (name, options, mods) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
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
// eslint-disable-next-line no-unused-vars
const shapes = [
  /*
  .......########...#######..########..########..########.########.
  .......##.....##.##.....##.##.....##.##.....##.##.......##.....##
  .......##.....##.##.....##.##.....##.##.....##.##.......##.....##
  .......########..##.....##.########..##.....##.######...########.
  .......##.....##.##.....##.##...##...##.....##.##.......##...##..
  .......##.....##.##.....##.##....##..##.....##.##.......##....##.
  .......########...#######..##.....##.########..########.##.....##
  */
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


if (typeof process === 'object') {
  module.exports = {
    shapes,
  };
}
