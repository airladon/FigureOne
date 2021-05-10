// const figure = new Fig.Figure();

const figure = new Fig.Figure();

const eqn = figure.add({
  make: 'equation',
  // Define all the symbols that will be used, including customizations to them
  elements: {
    lb: { symbol: 'bracket', side: 'left' },
    rb: { symbol: 'bracket', side: 'right' },
    slb: { symbol: 'squareBracket', side: 'left' },
    srb: { symbol: 'squareBracket', side: 'right' },
    int: { symbol: 'int' },
    sigma: { symbol: 'sum' },
    r: { symbol: 'radical' },
    v: { symbol: 'vinculum' },
    v2: { symbol: 'vinculum' },
    brace: { symbol: 'brace', side: 'top', lineWidth: 0.01 },
    arrow: { symbol: 'arrow', direction: 'right' },
    s: { symbol: 'strike', lineWidth: 0.005 },
  },
  // Use phrases to keep the forms a little cleaner
  phrases: {
    rootFrac: { frac: [{ root: { symbol: 'r', content: 'c', root: 'b' } }, 'v', { sub: ['a', 'd'] }] },
    aPlusD: ['a', '_ + ', 'd'],
  },
  // Forms that show how elements can move around, and symbols can grow or
  // shrink to fit
  forms: {
    1: { matrix: [[2, 2], 'slb', ['a', 'c', 'b', 'd'], 'srb'] },
    2: { matrix: [[1, 4], 'slb', ['a', 'b', 'c', 'd', 'e'], 'srb'] },
    3: ['a', { int: ['int', 'd', 'c', 'b'] }],
    4: { int: ['int', 'rootFrac'] },
    5: { topComment: [{ brac: ['lb', 'aPlusD', 'rb'] }, ['b', 'c'], 'brace', 0.05, 0.05] },
    6: { sumOf: ['sigma', 'aPlusD', 'c', 'b'] },
    7: { sumOf: ['sigma', { frac: ['b', 'v', ['aPlusD', '_ + _2', 'c'], 0.8] }] },
    8: [{ bar: [['a', 'd'], 'arrow', 'top'] }, '   ', { strike: [['b', 'c'], 's'] }],
  },
});

eqn.animations.new()
  .nextForm({ delay: 1 })
  .nextForm({ delay: 1 })
  .nextForm({ delay: 1 })
  .nextForm({ delay: 1 })
  .nextForm({ delay: 1 })
  .nextForm({ delay: 1 })
  .nextForm({ delay: 1 })
  .start();
