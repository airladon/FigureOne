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

// Define the polyline points
const { getPoints, threePointAngle } = Fig.tools.g2;
const points = [
  [2, 0.5], [1.4, 1.3], [-0.4, 1.5], [0.5, 0.7], [-0.4, 0], [1.5, 0]
];
const p = getPoints(points);

// Calculate the sizes of the angles of interest
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

// Helper function to get figure elements succinctly
const get = (name) => figure.getElement(name);

// Helper function to create angle definition objects
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

// Helper function that sets equation elements as touchable or not
const setTouchable = (touchable, justBoxes = false) => {
  if (!justBoxes) {
    get('eqn.negA').isTouchable = touchable;
    get('eqn.negB').isTouchable = touchable;
    get('eqn.negC').isTouchable = touchable;
  }
  get('eqn.newBox').isTouchable = touchable;
  get('eqn.oldBox').isTouchable = touchable;
};

figure.add([
  {
    name: 'shape',
    method: 'collections.collection',
    elements: [
      // Rectangle that will be used to highlight different equation elements
      {
        name: 'highlightRect',
        method: 'collections.rectangle',
        options: {
          line: { width: 0.01 },
          width: 0,
          height: 0,
        },
      },
      // Angle annotations on the polygon
      angle(p[1], p[2], p[4], 'angleAf', '', 0.7, true, -1),
      angle(p[5], p[4], p[2], 'angleBf', '', 0.7, true),
      angle(p[4], p[3], p[2], 'angleCf', '', 0.7, true),
      angle(p[4], p[2], p[3], 'angleA', 'a'),
      angle(p[3], p[4], p[2], 'angleB', 'b'),
      angle(p[2], p[3], p[4], 'angleC', 'c'),
      // The old polygon
      {
        name: 'old',
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
      // The new polygon
      {
        name: 'new',
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
      // A button to step through the equation
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
  // Equation Definition
  {
    name: 'eqn',
    method: 'collections.equation',
    options: {
      elements: {
        // Define equation elements 'a', 'b', and 'c' to be touchable with
        // some touchBorder buffer around them
        negA: { text: ' \u2212  a', touchBorder: [0.01, 0.3, 0.02, 0.3] },
        negB: { text: ' \u2212  b', touchBorder: [0.01, 0.3, 0.06, 0.3] },
        negC: { text: ' \u2212  c', touchBorder: [0.65, 0.3, 0.3, 0.3] },
        // Other equation elements and symbols
        equals: '   =   ',
        plus360: ' +  360\u00b0',
        plus180: ' +  180\u00b0',
        minus180: ' \u2212 180\u00b0 ',
        newBox: { symbol: 'tBox' },
        oldBox: { symbol: 'tBox' },
        brace: { symbol: 'brace', side: 'bottom', lineWidth: 0.01 },
      },
      phrases: {
        totalAngleOld: { bottomComment: ['total angle_1', 'old shape'] },
        totalAngleNew: { bottomComment: ['total angle_2', 'new shape'] },
        new: { box: ['totalAngleNew', 'newBox', false, 0.08] },
        old: { box: ['totalAngleOld', 'oldBox', false, 0.08] },
        newEqOld: ['new', 'equals', 'old', '   '],
      },
      forms: {
        0: {
          content: [ 'newEqOld', 'negA', ' ', 'negB', '  ', 'plus360', 'negC'],
          onShow: () => setTouchable(true),
        },
        1: {
          content: [
            'newEqOld', 'negA', ' ', 'negB', ' ', 'negC', '  ', 'plus360',
          ],
          animation: {
            translation: {
              negC: { style: 'curve', direction: 'up', mag: 0.9 }
            },
            onStart: () => setTouchable(false),
          },
        },
        2: {
          content: [
            'newEqOld',
            {
              bottomComment: {
                content: ['negA', ' ', 'negB', ' ', 'negC'],
                symbol: 'brace',
                comment: 'minus180',
                contentSpace: 0.07,
              },
            },
            '  ', 'plus360',
          ],
        },
        3: ['newEqOld', '  ', 'minus180', 'plus360'],
        4: [
          'newEqOld', '  ', {
            bottomComment: [['minus180', 'plus360'], 'plus180', 'brace'],
          },
        ],
        5: {
          content: ['newEqOld', '  ', 'plus180'],
          onShow: () => {
            get('eqn.newBox').isTouchable = true;
            get('eqn.oldBox').isTouchable = true;
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
    const elements = [element];
    if (surround != null) {
      elements.push(get(surround));
    }
    highlighter.surround(elements, [0, 0.08, 0.03, 0.05]);
    highlighter.pulse({ scale: 1.2 });
    if (oldAngle != null) {
      get(`shape.old.angle${oldAngle}`).hide();
    }
    get(`shape.new.angle${newAngle}`).hide();
    get(angleFill).show();
    get(angleFill).animations.new()
      .angle({ target: ang.old, duration: 0 })
      .angle({ target: ang.new, duration: 1 })
      .pulse({ scale: 1.5, duration: 1 })
      .start();
  }
}

setAngleClick(angles.a, 'eqn.negA', 'shape.angleAf', null, 1, 1);
setAngleClick(angles.b, 'eqn.negB', 'shape.angleBf', null, 2, 3);
setAngleClick(angles.c, 'eqn.negC', 'shape.angleCf', 'eqn.plus360', null, 2);

const newBox = get('eqn.newBox');
newBox.onClick = () => {
  get('shape.old').hideAngles();
  hideAngles()
  get('shape.new').showAngles();
  highlighter.show();
  highlighter.surround(newBox, -0.02);
  highlighter.pulse({ scale: 1.2 });
  // surround(newBox, -0.02)
};
const oldBox = get('eqn.oldBox');
oldBox.onClick = () => {
  get('shape.new').hideAngles();
  hideAngles();
  get('shape.old').showAngles();
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
get('shape.new').hideAngles();
get('shape.old').hideAngles();
get('eqn').showForm('0');
// console.log(figure.elements._shape)

