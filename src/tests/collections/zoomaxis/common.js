/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  var { tools } = require('../../../index').default;
}

let index = 0;
function makeShape(name, options = {}, mods, getPos) {
  const { x, y } = getPos(index);
  // const indexName = `${index}`;
  index += 1;
  const o = {
    name,
    make: 'collections.zoomAxis',
    options: tools.misc.joinObjects({}, {
      position: [x, y],
      axis: 'x',
      start: 0,
      stop: 2,
      length: 0.5,
      step: 1,
      ticks: true,
      labels: true,
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
