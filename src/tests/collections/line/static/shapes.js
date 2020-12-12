let tools;
if (typeof process === 'object') {
  // eslint-disable-next-line global-require
  tools = require('../../../../index.js').default.tools;
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
  line('border-default'),
  line('border-diagonal-p2', { p2: [0.2, 0.4] }),
  line('border-diagonal-angle', { angle: Math.PI / 4 }),
  line('border-arrow', { arrow: { head: 'triangle', scale: 0.3 } }),
  line('border-diagonal-arrow', { angle: Math.PI / 4, arrow: { head: 'triangle', scale: 0.3 } }),
  line('border-label', { label: 'a' }),
  line('border-label-diagonal', { label: 'a', angle: Math.PI / 4 }),

  line('border-children', { border: 'children', angle: Math.PI / 4 }),
  line('border-rect', { border: 'rect', angle: Math.PI / 4 }),
  line('border-number', { border: 0.05, angle: Math.PI / 4 }),
  line('border-bufferX', { border: [0.05, 0], angle: Math.PI / 4 }),
  line('border-bufferY', { border: [0, 0.05], angle: Math.PI / 4 }),
  line('border-bufferRect', { border: [0, 0.05, 0.1, 0.15], angle: Math.PI / 4 }),
  line('border-custom1d', { border: [[0, 0], [0.3, 0], [0, 0.3]], angle: Math.PI / 4 }),
  line('border-custom2d', { border: [[[0, 0], [0.3, 0], [0, 0.3]]], angle: Math.PI / 4 }),

  line('touchBorder-children', { touchBorder: 'children', angle: Math.PI / 4 }),
  line('touchBorder-rect', { touchBorder: 'rect', angle: Math.PI / 4 }),
  line('touchBorder-number', { touchBorder: 0.05, angle: Math.PI / 4 }),
  line('touchBorder-bufferX', { touchBorder: [0.05, 0], angle: Math.PI / 4 }),
  line('touchBorder-bufferY', { touchBorder: [0, 0.05], angle: Math.PI / 4 }),
  line('touchBorder-bufferRect', { touchBorder: [0, 0.05, 0.1, 0.15], angle: Math.PI / 4 }),
  line('touchBorder-custom1d', { touchBorder: [[0, 0], [0.3, 0], [0, 0.3]], angle: Math.PI / 4 }),
  line('touchBorder-custom2d', { touchBorder: [[[0, 0], [0.3, 0], [0, 0.3]]], angle: Math.PI / 4 }),
  line('touchBorder-arrow-label', {
    arrow: { head: 'triangle', scale: 0.3 },
    label: 'a',
    angle: Math.PI / 4,
  }),
  line('touchBorder-rect-arrow-label', {
    arrow: { head: 'triangle', scale: 0.3 },
    label: 'a',
    angle: Math.PI / 4,
    touchBorder: 'rect',
  }),
  line('touchBorder-rect-arrow-label1', {
    arrow: { head: 'triangle', scale: 0.3 },
    label: {
      text: 'a',
      touchBorder: [[]],
    },
    angle: Math.PI / 4,
    touchBorder: 'rect',
  }),

  /*
  .......########..########.########.####.##....##.########
  .......##.....##.##.......##........##..###...##.##......
  .......##.....##.##.......##........##..####..##.##......
  .......##.....##.######...######....##..##.##.##.######..
  .......##.....##.##.......##........##..##..####.##......
  .......##.....##.##.......##........##..##...###.##......
  .......########..########.##.......####.##....##.########
  */
  line('p1p2', { p1: [0.2, -0.2], p2: [-0.2, 0.2] }),
  line('p1LengthAngle', { p1: [0.2, -0.2], length: 0.4, angle: Math.PI / 2 }),
  line('override', { p1: [0.2, -0.2], p2: [-0.2, 0.2], length: 0.4, angle: Math.PI / 2 }),
  line('offset-pos', { offset: 0.2, p1: [0.2, -0.2], p2: [-0.2, 0.2] }),
  line('offset-net', { offset: -0.2, p1: [0.2, -0.2], p2: [-0.2, 0.2] }),
  line('align-start', { align: 'start' }),
  line('align-center', { align: 'center' }),
  line('align-end', { align: 'end' }),
  line('align-neg', { align: -0.2 }),
  line('width', { width: 0.1 }),

  /*
  .......########.....###.....######..##.....##
  .......##.....##...##.##...##....##.##.....##
  .......##.....##..##...##..##.......##.....##
  .......##.....##.##.....##..######..#########
  .......##.....##.#########.......##.##.....##
  .......##.....##.##.....##.##....##.##.....##
  .......########..##.....##..######..##.....##
  */
  line('dash', { dash: [0.05, 0.05] }),
  line('dash-offset', { dash: [0.025, 0.05, 0.05] }),


  /*
  ..........###....########..########...#######..##......##
  .........##.##...##.....##.##.....##.##.....##.##..##..##
  ........##...##..##.....##.##.....##.##.....##.##..##..##
  .......##.....##.########..########..##.....##.##..##..##
  .......#########.##...##...##...##...##.....##.##..##..##
  .......##.....##.##....##..##....##..##.....##.##..##..##
  .......##.....##.##.....##.##.....##..#######...###..###.
  */
  line('arrow', { width: 0.01, arrow: 'triangle' }),
  line('arrow-start', { arrow: {
    start: 'triangle',
  } }),
  line('arrow-detail', { arrow: {
    head: 'barb',
    scale: 0.4,
    tail: 0,
  } }),

  /*
  .......##..........###....########..########.##......
  .......##.........##.##...##.....##.##.......##......
  .......##........##...##..##.....##.##.......##......
  .......##.......##.....##.########..######...##......
  .......##.......#########.##.....##.##.......##......
  .......##.......##.....##.##.....##.##.......##......
  .......########.##.....##.########..########.########
  */
  line('label', { label: 'a' }),
  line('label-null', { label: null }),
  line('label-offset', { label: { text: 'a', offset: 0.05 } }),
  line('label-scale', { label: { text: 'a', scale: 2, offset: 0.05 } }),
  line('label-color', { label: { text: 'a', color: [1, 0, 1, 1] } }),
  line('label-linePosition', { label: { text: 'a', offset: 0.05, linePosition: 0.3 } }),
  line('label-location-left-horizontal', {
    angle: Math.PI / 4,
    label: {
      text: 'a', location: 'left', orientation: 'horizontal', offset: 0.05,
    },
  }),
  line('label-location-right-baseToLine', {
    angle: Math.PI / 4,
    label: {
      text: 'a', location: 'right', orientation: 'baseToLine', offset: 0.05,
    },
  }),
  line('label-location-top-baseAway', {
    angle: Math.PI / 4,
    label: {
      text: 'a', location: 'top', orientation: 'baseAway', offset: 0.05,
    },
  }),
  line('label-location-bottom-upright', {
    angle: Math.PI / 4,
    label: {
      text: 'a', location: 'bottom', orientation: 'upright', offset: 0.05,
    },
  }),
  line('label-subLocation-horizontal-bottom', {
    angle: 0,
    label: {
      text: 'a', location: 'right', subLocation: 'bottom', offset: 0.05,
    },
  }),
  line('label-subLocation-horizontal-top', {
    angle: 0,
    label: {
      text: 'a', location: 'right', subLocation: 'top', offset: 0.05,
    },
  }),
  line('label-subLocation-vertical-left', {
    angle: Math.PI / 2,
    label: {
      text: 'a', location: 'top', subLocation: 'left', offset: 0.05,
    },
  }),
  line('label-subLocation-vertical-right', {
    angle: Math.PI / 2,
    label: {
      text: 'a', location: 'top', subLocation: 'right', offset: 0.05,
    },
  }),
  line('label-equation', {
    angle: Math.PI / 4,
    label: { text: { forms: { 0: { frac: ['a', 'vinculum', 'b'] } } } },
  }),
  line('label-autoForm', {
    label: { text: ['form1', 'form2'] },
  }),
  line('label-updateOff', {
    label: { text: 'a', orientation: 'horizontal', update: false },
  }),
  line('label-updateOn', {
    label: { text: 'a', orientation: 'horizontal', update: true },
  }),

  /*
  .......##.....##.########.########.##.....##..#######..########...######.
  .......###...###.##..........##....##.....##.##.....##.##.....##.##....##
  .......####.####.##..........##....##.....##.##.....##.##.....##.##......
  .......##.###.##.######......##....#########.##.....##.##.....##..######.
  .......##.....##.##..........##....##.....##.##.....##.##.....##.......##
  .......##.....##.##..........##....##.....##.##.....##.##.....##.##....##
  .......##.....##.########....##....##.....##..#######..########...######.
  */
  line('setLength'),
  line('setLength-dash', { dash: [0.025, 0.05, 0.05] }),
  line('setLabelToRealLength', { label: 'a' }),
  line('setLabel', { label: 'a' }),
  line('setEndPoints', { p1: [0, 0], align: 'start' }),
];

if (typeof process === 'object') {
  module.exports = {
    shapes,
  };
}
