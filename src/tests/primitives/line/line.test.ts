import makeFigure from '../../../js/__mocks__/makeFigure';

const { shapes } = require('./shapes');
const { updates } = require('./updates');

const tests = shapes.map(s => [s.name, s]);

describe('line tests', () => {
  let figure;
  beforeEach(() => {
    figure = makeFigure();
  });
  test.each(tests)(
    '%s',
    (name, shape) => {
      figure.add(shape);
      const element = figure.getElement(name);
      if (updates[name] != null) {
        element.custom.updatePoints(updates[name]);
      }
      expect(figure.timeKeeper).toBe(element.timeKeeper);
      element.uid = '';
      element.parent = null;
      element.figure = null;
      element.animations = null;
      element.anim = null;
      element.recorder = null;
      figure.timeKeeper.nowTime = 0;
      figure.timeKeeper.lastTime = 0;
      expect(element).toMatchSnapshot();
    },
  );
});
