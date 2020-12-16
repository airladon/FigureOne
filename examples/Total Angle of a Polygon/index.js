const figure = new Fig.Figure({
  limits: [-2.5, -1.8, 5, 5],
  color: [1, 0, 0, 1] },
);

// Define the polyline points
const { getPoints, threePointAngle } = Fig.tools.g2;
const points = [
  [1, 0.5], [0.4, 1.3], [-1.7, 1.5], [-0.5, 0.7], [-1.4, -0.5], [0.5, -0.5]
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

// Helper function to hide all special fill angles
const hideAngles = () => {
  figure.stop();
  get('angleAf').hide();
  get('angleBf').hide();
  get('angleCf').hide();
}

figure.add([
  // Instructions Text
  {
    name: 'instructions',
    method: 'primitives.textLines',
    options: {
      text: [
        'A polygon\'s total angle will increase by 180\u00b0 when one side is split into two new sides.',
        'The two new sides can be constructed either inside or outside the polygon. This example',
        'shows the inside case.',
        '',
        'Touch the equation\'s terms to understand where they come from.',
        '',
        'Then press the |simplify| button several times to rearrange the equation.',
      ],
      color: [0.5, 0.5, 0.5, 1],
      font: { size: 0.12 },
      modifiers: {
        simplify: { font: { style: 'italic' } },
      },
      position: [-2.25, 2.8],
    },
  },
  // Rectangle that highlights equation elements
  {
    name: 'highlightRect',
    method: 'collections.rectangle',
    options: {
      line: { width: 0.01 },
      width: 0,
      height: 0,
    },
  },

  // Angles that will be highlighted in the polygon
  angle(p[1], p[2], p[4], 'angleAf', '', 0.7, true, -1),
  angle(p[5], p[4], p[2], 'angleBf', '', 0.7, true),
  angle(p[4], p[3], p[2], 'angleCf', '', 0.7, true),
  angle(p[4], p[2], p[3], 'angleA', 'a'),
  angle(p[3], p[4], p[2], 'angleB', 'b'),
  angle(p[2], p[3], p[4], 'angleC', 'c'),

  // Old polygon
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
  // New polygon
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
  // Button to step through the equation
  {
    name: 'button',
    method: 'collections.rectangle',
    options: {
      width: 0.6,
      height: 0.3,
      color: [0.3, 0.3, 0.3, 1],
      dimColor: [0.7, 0.7, 0.7, 1],
      line: { width: 0.004 },
      button: true,
      label: {
        text: 'Simplify',
        font: { size: 0.12, color: [0.3, 0.3, 0.3, 1] },
      },
      corner: { radius: 0.05, sides: 10 },
      position: [1, -1.5],
    },
    mods: {
      isTouchable: true,
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
      // Reusable phrases to reduce form definition length
      phrases: {
        totalAngleOld: { bottomComment: ['total angle_1', 'old shape'] },
        totalAngleNew: { bottomComment: ['total angle_2', 'new shape'] },
        new: { box: ['totalAngleNew', 'newBox', false, 0.08] },
        old: { box: ['totalAngleOld', 'oldBox', false, 0.08] },
        newEqOld: ['new', 'equals', 'old', '   '],
      },
      // Equation forms
      forms: {
        0: {
          content: [ 'newEqOld', 'negA', ' ', 'negB', '  ', 'plus360', 'negC'],
          // When animating to this form, just hide the angles at the start of
          // the animation - wait to change the button text and touchability
          // until the form is fully shown
          onTransition: () => {
            get('new').hideAngles();
            get('old').hideAngles();
            hideAngles();
          },
          // When form 0 is shown, hide all angles, make equation touchable,
          // and set button text to "Simplify"
          onShow: () => {
            setTouchable(true);
            get('button').setLabel('Simplify');
          },
        },
        // From this form, the equation should not be touchable
        1: {
          content: [
            'newEqOld', 'negA', ' ', 'negB', ' ', 'negC', '  ', 'plus360',
          ],
          animation: {
            translation: {
              negC: { style: 'curve', direction: 'up', mag: 0.9 }
            },
          },
          onTransition: () => setTouchable(false),
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
        // At this form, make some of the equation touchable, and change
        // the button text to "Restart"
        5: {
          content: ['newEqOld', '  ', 'plus180'],
          onShow: () => {
            get('eqn.newBox').isTouchable = true;
            get('eqn.oldBox').isTouchable = true;
            get('button').setLabel('Restart');
          }
        },
      },
      formSeries: ['0', '1', '2', '3', '4', '5'],
      position: [-1.7, -1],
    },
  },
]);

// The highlighter element will be used frequently
const highlighter = get('highlightRect')

// When angle a, b or c is pressed in the equation, then surround the element
// and highlight the angle on the figure
const setAngleClick = (ang, eqnElement, angleFill, surround, oldAngle, newAngle) => {
  const element = get(`${eqnElement}`);
  element.onClick = () => {
    figure.stop('complete');
    highlighter.show();
    const elements = [element];
    if (surround != null) {
      elements.push(get(surround));
    }
    highlighter.surround(elements, [0, 0.08, 0.03, 0.05]);
    highlighter.pulse({ scale: 1.2 });
    if (oldAngle != null) {
      get(`old.angle${oldAngle}`).hide();
    }
    get(`new.angle${newAngle}`).hide();
    get(angleFill).show();
    get(angleFill).animations.new()
      .angle({ target: ang.old, duration: 0 })
      .angle({ target: ang.new, duration: 1 })
      .pulse({ scale: 1.5, duration: 1 })
      .start();
  }
}

// Setup click callbacks for each angle term in the equation
setAngleClick(angles.a, 'eqn.negA', 'angleAf', null, 1, 1);
setAngleClick(angles.b, 'eqn.negB', 'angleBf', null, 2, 3);
setAngleClick(angles.c, 'eqn.negC', 'angleCf', 'eqn.plus360', null, 2);

// Setup click callbacks for the "Total Angle" terms in the equation
get('eqn.newBox').onClick = () => {
  get('old').hideAngles();
  hideAngles()
  get('new').showAngles();
  highlighter.show();
  highlighter.surround(get('eqn.newBox'), -0.02);
  highlighter.pulse({ scale: 1.2 });
};
get('eqn.oldBox').onClick = () => {
  get('new').hideAngles();
  hideAngles();
  get('old').showAngles();
  highlighter.show();
  highlighter.surround(get('eqn.oldBox'), -0.02);
  highlighter.pulse({ scale: 1.2 });
};

// When butotn is pressed, progress through the equations forms
get('button').onClick = () => {
  highlighter.hide();
  get('eqn').nextForm({ animate: 'move', duration: 2 });
}

// Start by showing form ('0')
get('eqn').showForm('0');

