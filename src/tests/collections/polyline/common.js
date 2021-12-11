/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  var { tools } = require('../../../index').default;
}

let index = 0;
function makeShape(name, options, mods, getPos) {
  const { x, y } = getPos(index);
  const indexName = `${index}`;
  index += 1;
  const o = {
    name,
    make: 'collections.polyline',
    options: tools.misc.joinObjects({}, {
      color: [1, 0, 0, 0.7],
      width: 0.05,
      points: [[0, 0], [0.3, 0], [0, 0.3]],
      font: { size: 0.2, family: 'Times New Roman' },
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    }, mods),
  };
  o.options.points = o.options.points.map(p => tools.g2.getPoint(p).add(x, y));
  return o;
}

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  module.exports = {
    makeShape,
  };
}
