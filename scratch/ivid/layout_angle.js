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
      {
        name: 'border',
        method: 'rectangle',
        options: {
          line: {
            width: 0.006,
          },
          corner: {
            radius: 0.02,
            sides: 10,
          },
          width: 4,
          height: 2.5,
          color: [0.7, 0.7, 0.7, 1],
        },
      },
      {
        name: 'close',
        method: 'collection',
        elements: [
          {
            name: 'x',
            method: 'polyline',
            options: {
              points: [[-0.05, -0.05], [0.05, 0.05], [0, 0], [-0.05, 0.05], [0.05, -0.05]],
            },
          },
          {
            name: 'circle',
            method: 'polygon',
            options: {
              radius: 0.1,
              line: { width: 0.006 },
              sides: 50,
            },
          },
        ],
        options: {
          position: [1.8, 1.05],
        },
        mods: {
          onClick: () => figure.getElement('totalAngle').hide(),
          isTouchable: true,
          touchBorder: 0.1,
        },
      },
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
            // alignment: { fixTo: 'equals' },
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
  });

  const eqn = figure.getElement('totalAngle.eqn');

  totalAngle.add({
    name: 'summary',
    method: 'primitives.textLines',
    options: {
      text: [
        'Angles in a triangle always |add to 180|.',
        'Thus, only |two angles| are needed to |find all three|.',
      ],
      lineSpace: 1.7,
      modifiers: {
        'add to 180': {
          text: 'add to 180\u00b0',
          onClick: () => {
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
          },
          font: { color: color1 },
          touchBorder: 0.08,
        },
        'two angles': {
          onClick: () => {
            eqn.pulse({ elements: ['a', 'b'] });
          },
          font: { color: color1 },
          touchBorder: 0.08,
        },
        'find all three': {
          onClick: () => {
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
          },
          font: { color: color1 },
          touchBorder: 0.08,
        },
      },
      position: [-1.5, 0.8],
    },
    mods: {
      isTouchable: true,
    },
  });
}

totalAngleLayout();
