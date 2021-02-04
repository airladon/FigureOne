/* eslint-disable camelcase */
/* globals figure, color1 */

function totalAngleLayout() {
  const scale1 = 1.5;
  const triPoints = [[0, 0], [0.5 * scale1, 0.5 * scale1], [1.2 * scale1, 0]];

  const polyline = (name, points, position) => ({
    name,
    method: 'collections.polyline',
    options: {
      points,
      close: true,
      angle: [
        { curve: { radius: 0.15, width: 0.006 }, label: { text: 'a', offset: 0.05 } },
        { curve: { radius: 0.2, width: 0.006 }, label: { text: 'b', offset: 0.05 } },
        { curve: { radius: 0.2, width: 0.006 }, label: { text: 'c', offset: 0.05 } },
      ],
      position,
    },
  });

  const [totalAngle] = figure.add({
    name: 'totalAngle',
    method: 'collection',
    elements: [
      polyline('tri', triPoints, [-0.8, -0.2], ''),
      {
        name: 'eqn',
        method: 'collections.equation',
        options: {
          elements: {
            _180: '180\u00b0',
            equals: '  =  ',
          },
          formDefaults: {
            translation: {
              a: { style: 'curve', direction: 'down', mag: 0.5 },
              b: { style: 'curve', direction: 'down', mag: 0.5 },
            },
          },
          forms: {
            abc: ['a', '_ + _1', 'b', '_ + _2', 'c', 'equals', '_180'],
            ab: ['c', 'equals', '_180', '_ – ', 'a', '_ – _1', 'b'],
          },
          position: [-0.4, -0.5],
        },
      },
    ],
    mods: {
      scenarios: {
        default: { scale: 1.2, position: [0, 0] },
      },
    },
  });

  const eqn = figure.getElement('totalAngle.eqn');

  const pulse = () => {
    eqn.pulse({ elements: ['a', 'b'] });
  };
  const goToABC = () => {
    if (eqn.getCurrentForm().name === 'abc') {
      if (eqn.isAnimating()) {
        eqn.stop('complete');
      } else {
        eqn.pulse();
      }
    } else {
      eqn.stop('freeze');
      eqn.goToForm({ form: 'abc', animate: 'move' });
    }
  };
  const goToAB = () => {
    if (eqn.getCurrentForm().name === 'ab') {
      if (eqn.isAnimating()) {
        eqn.stop('complete');
      } else {
        eqn.pulse();
      }
    } else {
      eqn.stop('freeze');
      eqn.goToForm({ form: 'ab', animate: 'move' });
    }
  };
  figure.fnMap.global.add('totalAnglePulse', pulse);
  figure.fnMap.global.add('totalAngleGoToABC', goToABC);
  figure.fnMap.global.add('totalAngleGoToAB', goToAB);

  totalAngle.add({
    name: 'summary1',
    method: 'primitives.textLines',
    options: {
      text: 'Angles in a triangle always |add to 180|.',
      xAlign: 'center',
      fixColor: true,
      font: { size: 0.15, color: colText },
      modifiers: {
        'add to 180': {
          text: 'add to 180\u00b0',
          onClick: 'totalAngleGoToABC',
          font: { color: color1 },
          touchBorder: 0.08,
        },
      },
      position: [0, 0.8],
    },
    mods: {
      isTouchable: true,
    },
  });

  totalAngle.add({
    name: 'summary2',
    method: 'primitives.textLines',
    options: {
      text: 'Only |two angles| are needed to |find all three|.',
      xAlign: 'center',
      fixColor: true,
      font: { size: 0.15, color: colText },
      modifiers: {
        'two angles': {
          onClick: 'totalAnglePulse',
          font: { color: color1 },
          touchBorder: 0.08,
        },
        'find all three': {
          onClick: 'totalAngleGoToAB',
          font: { color: color1 },
          touchBorder: 0.08,
        },
      },
      position: [0, -0.9],
    },
    mods: {
      isTouchable: true,
    },
  });

  // return {
  //   pulse,
  // };
}

