
if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  var { tools } = require('../../../index.js').default;
}

let index = 0;
function makeAngle (name, options, mods, getPos) {
  const { x, y } = getPos(index);
  const indexName = `${index}`;
  index += 1;
  const o = {
    name,
    method: 'collections.angle',
    options: tools.misc.joinObjects({}, {
      color: [1, 0, 0, 0.8],
      position: [0, 0],
      curve: {
        radius: 0.3,
        width: 0.05,
      },
      corner: {
        width: 0.05,
        length: 0.4,
      },
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    }, mods),
  };
  if (o.options.position != null) {
    o.options.position = tools.g2.getPoint(o.options.position).add(x, y);
  }
  if (o.options.p1 != null) {
    o.options.p1 = tools.g2.getPoint(o.options.p1).add(x, y);
  }
  if (o.options.p2 != null) {
    o.options.p2 = tools.g2.getPoint(o.options.p2).add(x, y);
  }
  if (o.options.p3 != null) {
    o.options.p3 = tools.g2.getPoint(o.options.p3).add(x, y);
  }
  return o;
}

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  module.exports = {
    makeAngle,
  };
}
