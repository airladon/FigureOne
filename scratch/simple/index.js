/* globals Fig */
const figure = new Fig.Figure({ limits: [0, 0, 6, 6 ]});

const label = figure.primitives.text({
  text: 'Line 1',
  position: [1, 0.1],
  font: { color: [0, 0, 1, 1] },
  xAlign: 'center',
});
const line = figure.primitives.line({
  p1: [0, 0],
  p2: [2, 0],
  width: 0.01,
  color: [0, 0, 1, 1],
});

const labeledLine = figure.collections.collection({
  position: [3, 2],
  touchBorder: 0.3,
});
figure.elements.add('labeledLine', labeledLine);
labeledLine.add('line', line);
labeledLine.add('label', label);
labeledLine.move.type = 'rotation';
labeledLine.setMovable();