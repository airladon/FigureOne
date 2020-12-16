const figure = new Fig.Figure({ limits: [-4.5, -4.5, 9, 9], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });
// const figure = new Fig.Figure({ limits: [-3, -2.25, 6, 4.5], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

// // const figure = new Fig.Figure({ limits: [-8, -8, 16, 16], color: [1, 0, 0, 1]});
// figure.add([
//   {
//     name: 'origin',
//     method: 'polygon',
//     options: {
//       radius: 0.01,
//       line: { width: 0.01 },
//       sides: 10,
//       color: [0.7, 0.7, 0.7, 1]
//     },
//   },
//   {
//     name: 'grid',
//     method: 'grid',
//     options: {
//       bounds: [-4.5, -4.5, 9, 9],
//       yStep: 0.1,
//       xStep: 0.1,
//       color: [0.9, 0.9, 0.9, 1],
//       line: { width: 0.004 },
//     },
//   },
//   {
//     name: 'gridMajor',
//     method: 'grid',
//     options: {
//       bounds: [-4.5, -4.5, 9, 9],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.7, 0.7, 0.7, 1],
//       line: { width: 0.004 }
//     },
//   },
// ]);


// ***************************************************
// ***************************************************
// ***************************************************

/*
....########.##.....##....###....##.....##.########..##.......########
....##........##...##....##.##...###...###.##.....##.##.......##......
....##.........##.##....##...##..####.####.##.....##.##.......##......
....######......###....##.....##.##.###.##.########..##.......######..
....##.........##.##...#########.##.....##.##........##.......##......
....##........##...##..##.....##.##.....##.##........##.......##......
....########.##.....##.##.....##.##.....##.##........########.########
*/

const { getPoints, threePointAngle } = Fig.tools.g2;
const points = [
  [2, 0.5], [1.4, 1.3], [-0.4, 1.5], [0.5, 0.7], [-0.4, 0], [1.5, 0]
];
const p = getPoints(points);
const angles = {
  a: {
    old: Math.PI * 2 - threePointAngle(p[4], p[2], p[1]),
    new: Math.PI * 2 - threePointAngle(p[3], p[2], p[1]),
  },
  b: {
    old: threePointAngle(p[5], p[4], p[2]),
    new: threePointAngle(p[5], p[4], p[3]),
  },
  c: {
    old: 0,
    new: threePointAngle(p[4], p[3], p[2]),
  },
}

const angle = (p1, p2, p3, name, label, alpha = 1, fill = false, direction = 1) => ({
  name,
  method: 'collections.angle',
  options: {
    p1, p2, p3,
    label: { offset: 0.01, text: label },
    curve: { width: 0.01, radius: 0.3, fill },
    direction,
    color: [1, 0, 0, alpha],
  },
});

const get = (name) => figure.getElement(name);

figure.add([
  {
    name: 'shape',
    method: 'collections.collection',
    elements: [
      {
        name: 'highlightRect',
        method: 'collections.rectangle',
        options: {
          line: { width: 0.01 },
          width: 0,
          height: 0,
        },
      },
      angle(p[1], p[2], p[4], 'angleAf', '', 0.7, true, -1),
      angle(p[5], p[4], p[2], 'angleBf', '', 0.7, true),
      angle(p[4], p[3], p[2], 'angleCf', '', 0.7, true),
      angle(p[4], p[2], p[3], 'angleA', 'a'),
      angle(p[3], p[4], p[2], 'angleB', 'b'),
      angle(p[2], p[3], p[4], 'angleC', 'c'),
      {
        name: 'oldShape',
        method: 'collections.polyline',
        options: {
          points: [p[0], p[1], p[2], p[4], p[5]],
          close: true,
          width: 0.015,
          cornerStyle: 'fill',
          angle: {
            direction: -1,
            curve: { fill: true, radius: 0.3 },
            color: [1, 0, 0, 0.7]
          },
        },
      },
      {
        name: 'newShape',
        method: 'collections.polyline',
        options: {
          points: [p[0], p[1], p[2], p[3], p[4], p[5]],
          dash: [0.05, 0.02],
          angle: {
            direction: -1,
            curve: { fill: true, radius: 0.3 },
            color: [1, 0, 0, 0.7]
          },
          close: true,
          cornerStyle: 'fill',
        },
      },
      {
        name: 'button',
        method: 'collections.rectangle',
        options: {
          width: 0.6,
          height: 0.3,
          color: [0.5, 0.5, 0.5, 1],
          line: {
            width: 0.004,
          },
          button: true,
          label: {
            text: 'Simplify',
            font: { size: 0.12, color: [0.3, 0.3, 0.3, 1] },
          },
          corner: { radius: 0.05, sides: 10 },
          position: [1.75, -1],
        },
        mods: {
          isTouchable: true,
        },
      },
    ],
    options: {
      position: [-0.5, -0.5],
    },
  },
  {
    name: 'eqn',
    method: 'collections.equation',
    options: {
      elements: {
        a: { mods: { touchBorder: 0.2, isTouchable: true } },
        b: { mods: { touchBorder: 0.2, isTouchable: true } },
        c: { mods: { touchBorder: [1, 0.3, 0.3, 0.3], isTouchable: true } },
        equals: '   =   ',
        _360: '360\u00b0',
        minus1: ' \u2212 ',
        minus2: ' \u2212 ',
        minus3: ' \u2212 ',
        minus180: ' \u2212 180\u00b0 ',
        plus: '  +  ',
        newBox: { symbol: 'tBox' },
        oldBox: { symbol: 'tBox' },
        brace: { symbol: 'brace', side: 'bottom', lineWidth: 0.01 },
        plus180: ' +  180\u00b0',
      },
      phrases: {
        tAngleOld: { bottomComment: ['total angle_1', 'old shape'] },
        tAngleNew: { bottomComment: ['total angle_2', 'new shape'] },
        new: { box: ['tAngleNew', 'newBox', false, 0.1] },
        old: { box: ['tAngleOld', 'oldBox', false, 0.1] },
      },
      forms: {
        0: {
          content: [
            'new', 'equals', 'old', '  ', 'minus1', 'a', '  ', 'minus2', 'b',
            '  ', 'plus', '_360', '  ', 'minus3', 'c',
          ],
          onShow: () => {
            get('eqn.a').isTouchable = true;
            get('eqn.b').isTouchable = true;
            get('eqn.c').isTouchable = true;
            get('eqn.newBox').isTouchable = true;
            get('eqn.oldBox').isTouchable = true;
          },
        },
        1: {
          content: [
            'new', 'equals', 'old', '  ', 'minus1', 'a', '  ', 'minus2', 'b',
            '  ', 'minus3', 'c', '  ', 'plus', '_360',
          ],
          animation: {
            translation: {
              c: { style: 'curve', direction: 'up', mag: 0.8 },
              minus3: { style: 'curve', direction: 'up', mag: 0.8 },
            },
            onStart: () => {
              get('eqn.a').isTouchable = false;
              get('eqn.b').isTouchable = false;
              get('eqn.c').isTouchable = false;
              get('eqn.newBox').isTouchable = false;
              get('eqn.oldBox').isTouchable = false;
            }
          },
        },
        2: {
          content: [
            'new', 'equals', 'old', '  ',
            {
              bottomComment: {
                content: ['minus1', 'a', '  ', 'minus2', 'b', '  ', 'minus3', 'c'],
                symbol: 'brace',
                comment: 'minus180',
              },
            },
            '  ', 'plus', '_360',
          ],
        },
        3: [
          'new', 'equals', 'old', '  ', 'minus180', 'plus', '_360',
        ],
        4: [
          'new', 'equals', 'old', '  ', {
            bottomComment: [['minus180', 'plus', '_360'], 'plus180', 'brace'],
          },
        ],
        5: {
          content: ['new', 'equals', 'old', '  ', 'plus180'],
          onShow: () => {
            get('eqn.newBox').isTouchable = true;
            get('eqn.oldBox').isTouchable = true;
            // get('shape.button.label').drawingObject.setText('Why?');
          }
        },
      },
      formSeries: ['0', '1', '2', '3', '4', '5'],
      position: [-1.2, -1],
    },
  },
]);


const highlighter = get('shape.highlightRect')
// const surround = (elementOrElements, space) => {
//   highlighter.show();
//   highlighter.surround(elementOrElements, space);
//   highlighter.pulse({ scale: 1.2 });
// };

const hideAngles = () => {
  figure.stop();
  get('shape.angleAf').hide();
  get('shape.angleBf').hide();
  get('shape.angleCf').hide();
}

const setAngleClick = (ang, eqnElement, angleFill, surround, oldAngle, newAngle) => {
  const element = get(`${eqnElement}`);
  element.onClick = () => {
    figure.stop('complete');
    figure.setFirstTransform();
    // surround([element, get(surround)], [0, 0.08, 0.05, 0.05])
    highlighter.show();
    highlighter.surround([element, get(surround)], [0, 0.08, 0.05, 0.05]);
    highlighter.pulse({ scale: 1.2 });
    if (oldAngle != null) {
      get(`shape.oldShape.angle${oldAngle}`).hide();
    }
    get(`shape.newShape.angle${newAngle}`).hide();
    get(angleFill).show();
    get(angleFill).animations.new()
      .angle({ target: ang.old, duration: 0 })
      .angle({ target: ang.new, duration: 1 })
      .pulse({ scale: 1.5, duration: 1 })
      .start();
  }
}

setAngleClick(angles.a, 'eqn.a', 'shape.angleAf', 'eqn.minus1', 1, 1);
setAngleClick(angles.b, 'eqn.b', 'shape.angleBf', 'eqn.minus2', 2, 3);
setAngleClick(angles.c, 'eqn.c', 'shape.angleCf', 'eqn.plus', null, 2);

const newBox = get('eqn.newBox');
newBox.onClick = () => {
  get('shape.oldShape').hideAngles();
  hideAngles()
  get('shape.newShape').showAngles();
  highlighter.show();
  highlighter.surround(newBox, -0.02);
  highlighter.pulse({ scale: 1.2 });
  // surround(newBox, -0.02)
};
const oldBox = get('eqn.oldBox');
oldBox.onClick = () => {
  get('shape.newShape').hideAngles();
  hideAngles();
  get('shape.oldShape').showAngles();
  highlighter.show();
  highlighter.surround(oldBox, -0.02);
  highlighter.pulse({ scale: 1.2 });
  // surround(oldBox, -0.02)
  console.log('asdf')
};

get('shape.button').onClick = () => {
  highlighter.hide();
  get('eqn').nextForm({ animate: 'move', duration: 2 });
  // if (get('shape.button.label').drawingObject.text[0].text === 'Simplify') {
  //   get('eqn').animations.new()
  //     .goToForm({ target: '1', animate: 'move', duration: 2 })
  //     .goToForm({ delay: 1, target: '2', animate: 'move', duration: 2 })
  //     .goToForm({ delay: 1, target: '3', animate: 'move', duration: 2 })
  //     .goToForm({ delay: 1, target: '4', animate: 'move', duration: 2 })
  //     .goToForm({ delay: 1, target: '5', animate: 'move', duration: 2 })
  //     .start();
  // } else {
  //   get('eqn').nextForm({ animate: 'move', duration: 2 });
  // }
}

hideAngles();
get('shape.newShape').hideAngles();
get('shape.oldShape').hideAngles();
get('eqn').showForm('0');
// console.log(figure.elements._shape)

