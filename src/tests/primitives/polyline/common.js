/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  var { tools } = require('../../../index.js').default;
}

let index = 0;
function makeShape(name, options, mods, getPos) {
  const { x, y } = getPos(index);
  const indexName = `${index}`;
  index += 1;
  const o = {
    name,
    method: 'primitives.polyline',
    options: tools.misc.joinObjects({}, {
      points: [[0, 0], [0.5, 0], [0, 0.5]],
      width: 0.05,
      drawBorderBuffer: 0.05,
      color: [1, 0, 0, 0.6],
      touchBorder: 'buffer',
      position: [0, 0],
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    }, mods),
  };
  o.options.points = o.options.points.map(p => tools.g2.getPoint(p).add(-0.3, -0.3));
  o.options.position = tools.g2.getPoint(o.options.position).add(x, y);
  return o;
}

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  module.exports = {
    makeShape,
  };
}
