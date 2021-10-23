/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  var { tools } = require('../../../index').default;
}


const pow = (pow = 3, stop = 10, step = 0.05) => {
  const xValues = Fig.range(-stop, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** pow));
};

let index = 0;
function makeShape(name, options = {}, offset = [0, 0], getPos) {
  const { x, y } = getPos(index);
  // const indexName = `${index}`;
  index += 1;
  const o = {
    name,
    make: 'collections.plot',
    options: tools.misc.joinObjects({}, {
      position: Fig.getPoint([x - 0.25, y - 0.25]).add(Fig.getPoint(offset)),
      width: 1,
      height: 1,
      trace: pow(),
    }, options),
  };
  if (o.options.start === -999) { o.options.start = undefined; }
  if (o.options.stop === -999) { o.options.stop = undefined; }
  if (o.options.step === -999) { o.options.step = undefined; }
  return o;
}

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  module.exports = {
    makeShape,
  };
}
