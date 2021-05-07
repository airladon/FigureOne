import {
  Point, Transform,
} from '../../tools/g2';
// import * as tools from '../../tools/tools';
// import * as math from '../../tools/math';
import { round } from '../../tools/math';
import makeFigure from '../../__mocks__/makeFigure';

const point = value => new Point(value, value);

describe('Animation Examples', () => {
  let figure;
  let a;
  let b;
  let animations;
  beforeEach(() => {
    jest.useFakeTimers();
    figure = makeFigure();
    [a, b] = figure.add([
      {
        name: 'a',
        method: 'polygon',
        options: { color: [0, 1, 0, 1] },
        mods: {
          dimColor: [1, 0, 0, 1],
          scenarios: {
            s1: { position: [1, 1] },
            s2: { transform: [['t', 1, 1], ['r', 1], ['s', 2, 2]] },
            s3: { color: [1, 0, 1, 1] },
            s4: { isShown: false },
          },
        },
      },
      {
        name: 'b',
        method: 'polygon',
      },
    ]);
    animations = {
      position: {
        builder: {
          numbers: () => {
            a.animations.new()
              .position(1, 1)
              .start();
          },
          arrayPoint: () => {
            a.animations.new()
              .position([1, 1])
              .start();
          },
          point: () => {
            a.animations.new()
              .position(new Point(1, 1))
              .start();
          },
          options: () => {
            a.animations.new()
              .position({ target: [1, 1] })
              .start();
          },
        },
        step: {
          numbers: () => {
            a.animations.new()
              .then(a.animations.position(1, 1))
              .start();
          },
          arrayPoint: () => {
            a.animations.new()
              .then(a.animations.position([1, 1]))
              .start();
          },
          point: () => {
            a.animations.new()
              .then(a.animations.position(new Point(1, 1)))
              .start();
          },
          options: () => {
            a.animations.new()
              .then(a.animations.position({ target: [1, 1] }))
              .start();
          },
        },
      },
      scale: {
        builder: {
          numbers: () => {
            a.animations.new()
              .scale(2, 2)
              .start();
          },
          arrayPoint: () => {
            a.animations.new()
              .scale([2, 2])
              .start();
          },
          point: () => {
            a.animations.new()
              .scale(new Point(2, 2))
              .start();
          },
          value: () => {
            a.animations.new()
              .scale(2)
              .start();
          },
          options: () => {
            a.animations.new()
              .scale({ target: [2, 2] })
              .start();
          },
        },
        step: {
          numbers: () => {
            a.animations.new()
              .then(a.animations.scale(2, 2))
              .start();
          },
          arrayPoint: () => {
            a.animations.new()
              .then(a.animations.scale([2, 2]))
              .start();
          },
          point: () => {
            a.animations.new()
              .then(a.animations.scale(new Point(2, 2)))
              .start();
          },
          value: () => {
            a.animations.new()
              .then(a.animations.scale(2))
              .start();
          },
          options: () => {
            a.animations.new()
              .then(a.animations.scale({ target: [2, 2] }))
              .start();
          },
        },
      },
      rotation: {
        builder: {
          number: () => {
            a.animations.new()
              .rotation(1)
              .start();
          },
          options: () => {
            a.animations.new()
              .rotation({ target: 1 })
              .start();
          },
        },
        step: {
          number: () => {
            a.animations.new()
              .then(a.animations.rotation(1))
              .start();
          },
          options: () => {
            a.animations.new()
              .then(a.animations.rotation({ target: 1 }))
              .start();
          },
        },
      },
      color: {
        builder: {
          number: () => {
            a.animations.new()
              .color([1, 0, 0, 1])
              .start();
          },
          options: () => {
            a.animations.new()
              .color({ target: [1, 0, 0, 1] })
              .start();
          },
        },
        step: {
          number: () => {
            a.animations.new()
              .then(a.animations.color([1, 0, 0, 1]))
              .start();
          },
          options: () => {
            a.animations.new()
              .then(a.animations.color({ target: [1, 0, 0, 1] }))
              .start();
          },
        },
      },
      dim: {
        builder: {
          defaultDuration: () => {
            a.animations.new()
              .dim()
              .start();
          },
          number: () => {
            a.animations.new()
              .dim(1)
              .start();
          },
          options: () => {
            a.animations.new()
              .dim({ duration: 1 })
              .start();
          },
        },
        step: {
          defaultDuration: () => {
            a.animations.new()
              .then(a.animations.dim())
              .start();
          },
          number: () => {
            a.animations.new()
              .then(a.animations.dim(1))
              .start();
          },
          options: () => {
            a.animations.new()
              .then(a.animations.dim({ duration: 1 }))
              .start();
          },
        },
      },
      undim: {
        builder: {
          defaultDuration: () => {
            a.dim();
            a.animations.new()
              .undim()
              .start();
          },
          number: () => {
            a.dim();
            a.animations.new()
              .undim(1)
              .start();
          },
          options: () => {
            a.dim();
            a.animations.new()
              .undim({ duration: 1 })
              .start();
          },
        },
        step: {
          defaultDuration: () => {
            a.dim();
            a.animations.new()
              .then(a.animations.undim())
              .start();
          },
          number: () => {
            a.dim();
            a.animations.new()
              .then(a.animations.undim(1))
              .start();
          },
          options: () => {
            a.dim();
            a.animations.new()
              .then(a.animations.undim({ duration: 1 }))
              .start();
          },
        },
      },
      opacity: {
        builder: {
          number: () => {
            a.animations.new()
              .opacity(0)
              .start();
          },
          options: () => {
            a.animations.new()
              .opacity({ target: 0 })
              .start();
          },
        },
        step: {
          number: () => {
            a.animations.new()
              .then(a.animations.opacity(0))
              .start();
          },
          options: () => {
            a.animations.new()
              .then(a.animations.opacity({ target: 0 }))
              .start();
          },
        },
      },
      dissolveOut: {
        builder: {
          defaultDuration: () => {
            a.animations.new()
              .dissolveOut()
              .start();
          },
          number: () => {
            a.animations.new()
              .dissolveOut(1)
              .start();
          },
          options: () => {
            a.animations.new()
              .dissolveOut({ duration: 1 })
              .start();
          },
        },
        step: {
          defaultDuration: () => {
            a.animations.new()
              .then(a.animations.dissolveOut())
              .start();
          },
          number: () => {
            a.animations.new()
              .then(a.animations.dissolveOut(1))
              .start();
          },
          options: () => {
            a.animations.new()
              .then(a.animations.dissolveOut({ duration: 1 }))
              .start();
          },
        },
      },
      dissolveIn: {
        builder: {
          defaultDuration: () => {
            a.animations.new()
              .dissolveIn()
              .start();
          },
          number: () => {
            a.animations.new()
              .dissolveIn(1)
              .start();
          },
          options: () => {
            a.animations.new()
              .dissolveIn({ duration: 1 })
              .start();
          },
        },
        step: {
          defaultDuration: () => {
            a.animations.new()
              .then(a.animations.dissolveIn())
              .start();
          },
          number: () => {
            a.animations.new()
              .then(a.animations.dissolveIn(1))
              .start();
          },
          options: () => {
            a.animations.new()
              .then(a.animations.dissolveIn({ duration: 1 }))
              .start();
          },
        },
      },
      scenario: {
        builder: {
          name: () => {
            a.animations.new()
              .scenario('s1')
              .start();
          },
          obj: () => {
            a.animations.new()
              .scenario({ position: [1, 1] })
              .start();
          },
          options: () => {
            a.animations.new()
              .scenario({ target: 's1' })
              .start();
          },
        },
        step: {
          name: () => {
            a.animations.new()
              .then(a.animations.scenario('s1'))
              .start();
          },
          obj: () => {
            a.animations.new()
              .then(a.animations.scenario({ position: [1, 1] }))
              .start();
          },
          options: () => {
            a.animations.new()
              .then(a.animations.scenario({ target: 's1' }))
              .start();
          },
        },
      },
      transform: {
        builder: {
          arrayTransform: () => {
            a.animations.new()
              .transform([['s', 2, 2], ['r', 1], ['t', 1, 1]])
              .start();
          },
          transform: () => {
            a.animations.new()
              .transform(new Transform().scale(2, 2).rotate(1).translate(1, 1))
              .start();
          },
          options: () => {
            a.animations.new()
              .transform({ target: [['s', 2, 2], ['r', 1], ['t', 1, 1]] })
              .start();
          },
        },
        step: {
          arrayTransform: () => {
            a.animations.new()
              .transform([['s', 2, 2], ['r', 1], ['t', 1, 1]])
              .start();
          },
          transform: () => {
            a.animations.new()
              .then(a.animations.transform(new Transform().scale(2, 2).rotate(1).translate(1, 1)))
              .start();
          },
          options: () => {
            a.animations.new()
              .transform({ target: [['s', 2, 2], ['r', 1], ['t', 1, 1]] })
              .start();
          },
        },
      },
    };
  });
  describe('position', () => {
    afterEach(() => {
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      expect(a.getPosition().round(4)).toEqual(point(0.5));
    });
    test('builder position numbers', () => {
      animations.position.builder.numbers();
    });
    test('builder position arrayPoint', () => {
      animations.position.builder.arrayPoint();
    });
    test('builder position point', () => {
      animations.position.builder.point();
    });
    test('builder position options', () => {
      animations.position.builder.options();
    });
    test('step position numbers', () => {
      animations.position.step.numbers();
    });
    test('step position arrayPoint', () => {
      animations.position.step.arrayPoint();
    });
    test('step position point', () => {
      animations.position.step.point();
    });
    test('step position options', () => {
      animations.position.step.options();
    });
  });
  describe('scenario', () => {
    afterEach(() => {
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      expect(a.getPosition().round(4)).toEqual(point(0.5));
    });
    test('builder scenario name', () => {
      animations.scenario.builder.name();
    });
    test('builder scenario obj', () => {
      animations.scenario.builder.obj();
    });
    test('builder scenario options', () => {
      animations.scenario.builder.options();
    });
    test('step scenario name', () => {
      animations.scenario.step.name();
    });
    test('step scenario obj', () => {
      animations.scenario.step.obj();
    });
    test('step scenario options', () => {
      animations.scenario.step.options();
    });
  });
  describe('transform', () => {
    afterEach(() => {
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      expect(a.getPosition().round(4)).toEqual(point(0.5));
      expect(a.getScale().round(4)).toEqual(point(1.5));
      expect(round(a.getRotation(), 4)).toEqual(0.5);
    });
    test('builder transform arrayTransform', () => {
      animations.transform.builder.arrayTransform();
    });
    test('builder transform transform', () => {
      animations.transform.builder.transform();
    });
    test('builder transform options', () => {
      animations.transform.builder.options();
    });
    test('step transform arrayTransform', () => {
      animations.transform.step.arrayTransform();
    });
    test('step transform transform', () => {
      animations.transform.step.transform();
    });
    test('step transform options', () => {
      animations.transform.step.options();
    });
  });
  describe('rotation', () => {
    afterEach(() => {
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      expect(round(a.getRotation(), 4)).toEqual(0.5);
    });
    test('builder rotation number', () => {
      animations.rotation.builder.number();
    });
    test('builder rotation options', () => {
      animations.rotation.builder.options();
    });
    test('step rotation number', () => {
      animations.rotation.step.number();
    });
    test('step rotation options', () => {
      animations.rotation.step.options();
    });
  });
  describe('color', () => {
    afterEach(() => {
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      expect(round(a.color, 4)).toEqual([0.5, 0.5, 0, 1]);
    });
    test('builder color number', () => {
      animations.color.builder.number();
    });
    test('builder color options', () => {
      animations.color.builder.options();
    });
    test('step color number', () => {
      animations.color.step.number();
    });
    test('step color options', () => {
      animations.color.step.options();
    });
  });
  describe('dim', () => {
    afterEach(() => {
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      expect(round(a.color, 4)).toEqual([0.5, 0.5, 0, 1]);
    });
    test('builder dim defaultDuration', () => {
      animations.dim.builder.defaultDuration();
    });
    test('builder dim number', () => {
      animations.dim.builder.number();
    });
    test('builder dim options', () => {
      animations.dim.builder.options();
    });
    test('step dim defaultDuration', () => {
      animations.dim.step.defaultDuration();
    });
    test('step dim number', () => {
      animations.dim.step.number();
    });
    test('step dim options', () => {
      animations.dim.step.options();
    });
  });
  describe('undim', () => {
    afterEach(() => {
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      expect(round(a.color, 4)).toEqual([0.5, 0.5, 0, 1]);
    });
    test('builder undim defaultDuration', () => {
      animations.undim.builder.defaultDuration();
    });
    test('builder undim number', () => {
      animations.undim.builder.number();
    });
    test('builder undim options', () => {
      animations.undim.builder.options();
    });
    test('step undim number', () => {
      animations.undim.step.number();
    });
    test('step undim options', () => {
      animations.undim.step.options();
    });
    test('step undim defaultDuration', () => {
      animations.undim.step.defaultDuration();
    });
  });
  describe('opacity', () => {
    afterEach(() => {
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      expect(round(a.opacity, 4)).toEqual(0.5);
    });
    test('builder opacity number', () => {
      animations.opacity.builder.number();
    });
    test('builder opacity options', () => {
      animations.opacity.builder.options();
    });
    test('step opacity number', () => {
      animations.opacity.step.number();
    });
    test('step opacity options', () => {
      animations.opacity.step.options();
    });
  });
  describe('dissolveOut', () => {
    afterEach(() => {
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      expect(round(a.opacity, 4)).toEqual(0.5005);
    });
    test('builder opacity defaultDuration', () => {
      animations.dissolveOut.builder.defaultDuration();
    });
    test('builder opacity number', () => {
      animations.dissolveOut.builder.number();
    });
    test('builder dissolveOut options', () => {
      animations.dissolveOut.builder.options();
    });
    test('step opacity defaultDuration', () => {
      animations.dissolveOut.step.defaultDuration();
    });
    test('step dissolveOut number', () => {
      animations.dissolveOut.step.number();
    });
    test('step dissolveOut options', () => {
      animations.dissolveOut.step.options();
    });
  });
  describe('dissolveIn', () => {
    afterEach(() => {
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      expect(round(a.opacity, 4)).toEqual(0.5005);
    });
    test('builder opacity defaultDuration', () => {
      animations.dissolveIn.builder.defaultDuration();
    });
    test('builder opacity number', () => {
      animations.dissolveIn.builder.number();
    });
    test('builder dissolveIn options', () => {
      animations.dissolveIn.builder.options();
    });
    test('step opacity defaultDuration', () => {
      animations.dissolveIn.step.defaultDuration();
    });
    test('step dissolveIn number', () => {
      animations.dissolveIn.step.number();
    });
    test('step dissolveIn options', () => {
      animations.dissolveIn.step.options();
    });
  });
  describe('scale', () => {
    afterEach(() => {
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      expect(a.getScale().round(4)).toEqual(point(1.5));
    });
    test('builder scale numbers', () => {
      animations.scale.builder.numbers();
    });
    test('builder scale arrayPoint', () => {
      animations.scale.builder.arrayPoint();
    });
    test('builder scale point', () => {
      animations.scale.builder.point();
    });
    test('builder scale value', () => {
      animations.scale.builder.value();
    });
    test('builder scale options', () => {
      animations.scale.builder.options();
    });
    test('step scale numbers', () => {
      animations.scale.step.numbers();
    });
    test('step scale arrayPoint', () => {
      animations.scale.step.arrayPoint();
    });
    test('step scale point', () => {
      animations.scale.step.point();
    });
    test('step scale value', () => {
      animations.scale.step.value();
    });
    test('step scale options', () => {
      animations.scale.step.options();
    });
  });
});
