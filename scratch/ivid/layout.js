/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */

function layout() {
  const centerText = (name, text, modifiers = {}) => ({
    name,
    method: 'textLines',
    options: {
      text,
      modifiers,
      position: [0, 0],
      xAlign: 'center',
      justify: 'left',
      yAlign: 'middle',
      font: { size: 0.2, color: [0.3, 0.3, 0.3, 1] },
      fixColor: true,
    },
    mods: {
      scenarios: {
        default: { position: [0, 0], scale: 1 },
        top: { position: [0, 1], scale: 1 },
      },
    },
  });

  const leftText = (name, text, modifiers = {}) => ({
    name,
    method: 'textLines',
    options: {
      text,
      modifiers,
      position: [0, 0],
      xAlign: 'left',
      justify: 'left',
      yAlign: 'middle',
      font: { size: 0.15, color: [0.3, 0.3, 0.3, 1] },
      fixColor: true,
    },
    mods: {
      scenarios: {
        default: { position: [-2, 1], scale: 1 },
      },
    },
  });

  const link = (name, text, position, onClick = {}) => ({
    name,
    method: 'text',
    options: {
      text,
      position,
      font: { size: 0.1 },
      xAlign: 'center',
    },
    mods: {
      isTouchable: true,
      touchBorder: 0.1,
      onClick,
    },
  });

  const hint = (name, position, hints) => {
    const elements = [];
    elements.push({
      name: 'label',
      method: 'text',
      options: {
        text: 'Hint',
        xAlign: 'center',
        font: { size: 0.1 },
      },
      mods: {
        isTouchable: true,
        touchBorder: 0.1,
        onClick: () => {
          const hintElement = figure.getElement(name);
          for (let i = 0; i < hints.length; i += 1) {
            const hintText = hintElement.getElement(`hint${i}`);
            if (hintText.isShown) {
              hintText.hide();
              if (i < hints.length - 1) {
                hintElement.getElement(`hint${i + 1}`).show();
                return;
              }
              return;
            }
          }
          hintElement.getElement(`hint${0}`).show();
        },
      },
    });
    hints.forEach((h, index) => {
      elements.push({
        name: `hint${index}`,
        method: 'primitives.textLines',
        options: {
          text: h.text,
          modifiers: h.modifiers,
          position: [0, -0.2],
          xAlign: 'center',
        },
        mods: {
          isTouchable: true,
          hasTouchableElements: true,
        },
      });
    });
    return {
      name,
      method: 'collection',
      elements,
      options: {
        position,
      },
    };
  };

  // const hint = (name, position, text, modifiers = {}) => ({
  //   name,
  //   method: 'collection',
  //   elements: [
  //     {
  //       name: 'label',
  //       method: 'text',
  //       options: {
  //         text: 'Hint',
  //         xAlign: 'center',
  //         font: { size: 0.1 },
  //       },
  //       mods: {
  //         isTouchable: true,
  //         touchBorder: 0.1,
  //         onClick: () => {
  //           const hintElement = figure.getElement(name);
  //           const hintText = hintElement.getElement('hint');
  //           if (hintText.isShown) {
  //             hintText.hide();
  //           } else {
  //             hintText.show();
  //           }
  //         },
  //       },
  //     },
  //     {
  //       name: 'hint',
  //       method: 'primitives.textLines',
  //       options: {
  //         text,
  //         modifiers,
  //         position: [0, -0.2],
  //         xAlign: 'center',
  //       },
  //     },
  //   ],
  //   options: {
  //     position,
  //   },
  // });

  figure.add([
    {
      name: 'title',
      method: 'textLines',
      options: {
        text: [
          'Sin, Cos & Tan',
          {
            text: 'Where do they come from?',
            font: { size: 0.1 },
          },
        ],
        position: [0, 1],
        xAlign: 'center',
        justify: 'center',
        font: { size: 0.2, color: [0.3, 0.3, 0.3, 1] },
        fixColor: true,
      },
    },
    centerText('background', 'Background'),
    centerText('sumOfAngles', 'Angles in a triangle always add to 180\u00b0'),
    centerText('similarTriangles', 'Similar Triangles'),
    centerText('similarQuestion', 'Are these triangles similar?'),
    centerText('thetaSimilar', '|All| right angle triangles with angle |theta| are similar.', {
      All: { font: { style: 'italic' } },
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic' } },
    }),
    centerText('forAllTris', 'For all right angle triangles with the same angle |theta|:', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic' } },
    }),
    hint('similarHint', [0, 0.7], [
      {
        text: '1 / 2: Use the |background| knowledge',
        modifiers: {
          background: {
            font: { color: color2 },
            onClick: () => {
              figure.elements.pulse({ elements: ['similarLink', 'totalAngleLink'] });
            },
            isTouchable: true,
          },
        },
      },
      {
        text: '2 / 2: We know two angles: |theta| and 90\u00b0',
        modifiers: {
          theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: color1 } },
        },
      },
    ]),
    link('similarLink', 'Similar Triangles', [1, -1.4], () => {
      figure.getElement('similar').showAll();
      figure.getElement('similar').setScenario('default');
      figure.getElement('totalAngle').hide();
    }),
    link('totalAngleLink', 'Triangle Total Angle', [-1, -1.4], () => {
      figure.getElement('totalAngle').showAll();
      figure.getElement('totalAngle').setScenario('default');
      figure.getElement('similar').hide();
    }),
  ]);
  figure.add({
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      nextButton: { position: [3.8, 0], width: 0.2, height: 0.2 },
      prevButton: { position: [-3.8, 0], width: 0.2, height: 0.2 },
      equation: 'eqn',
    },
  });
  figure.add({
    name: 'cursor',
    method: 'collections.cursor',
    options: {
      color: [0.5, 0.5, 0, 0.7],
    },
    mods: {
      isShown: false,
    },
  });
}
makeEquation();
layoutRight();
layoutCircle();
layout();
rightTris();
const totalAngle = totalAngleLayout();
similarLayout();

function makeSlides() {
  const slides = [];

  const nav = figure.getElement('nav');
  const rightTri = figure.getElement('rightTri');
  const circle = figure.getElement('circle');
  const rightTris = figure.getElement('rightTris');
  const eqn = figure.getElement('eqn');

  /*
  .########.####.########.##.......########
  ....##.....##.....##....##.......##......
  ....##.....##.....##....##.......##......
  ....##.....##.....##....##.......######..
  ....##.....##.....##....##.......##......
  ....##.....##.....##....##.......##......
  ....##....####....##....########.########
  */
  slides.push({
    show: ['circle', 'title'],
    scenario: 'title',
    steadyState: () => {
      circle.getElement('line').setRotation(0.87);
    },
  });

  slides.push({ scenario: 'default', show: ['background'] });

  /*
  ..######..##.....##.##.....##
  .##....##.##.....##.###...###
  .##.......##.....##.####.####
  ..######..##.....##.##.###.##
  .......##.##.....##.##.....##
  .##....##.##.....##.##.....##
  ..######...#######..##.....##
  */
  slides.push({
    scenario: 'default',
    show: ['sumOfAngles'],
  });

  slides.push({
    show: ['sumOfAngles'],
    scenario: ['default', 'top'],
    transition: (done) => {
      figure.getElement('sumOfAngles').animations.new()
        .scenario({ start: 'default', target: 'top', duration: 1 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('sumOfAngles').setScenario('top');
      figure.show(['totalAngle.tri', 'totalAngle.eqn']);
      figure.shortCuts['1'] = 'totalAnglePulse';
      figure.shortCuts['2'] = 'totalAngleGoToAB';
    },
  });

  /*
  ..######..####.##.....##.####.##..........###....########.
  .##....##..##..###...###..##..##.........##.##...##.....##
  .##........##..####.####..##..##........##...##..##.....##
  ..######...##..##.###.##..##..##.......##.....##.########.
  .......##..##..##.....##..##..##.......#########.##...##..
  .##....##..##..##.....##..##..##.......##.....##.##....##.
  ..######..####.##.....##.####.########.##.....##.##.....##
  */
  slides.push({ scenario: 'default', show: ['similarTriangles'] });

  slides.push({
    show: ['similarTriangles'],
    scenario: ['default', 'top'],
    transition: (done) => {
      figure.getElement('similarTriangles').animations.new()
        .scenario({ start: 'default', target: 'top', duration: 1 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('similarTriangles').setScenario('top');
      figure.show(['similar.tri1', 'similar.tri2']);
      figure.shortCuts['1'] = 'similarPulseAngles';
      figure.shortCuts['2'] = 'similarPulseScale';
    },
  });

  slides.push({
    show: ['similarTriangles', 'similar.tri1', 'similar.tri2'],
    scenario: ['default', 'top'],
    transition: (done) => {
      figure.animations.new()
        .trigger({ callback: 'similarAnimateEqn', duration: 3 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('similar.eqn').showForm('AOnB');
    },
  });

  slides.push({
    show: ['background', 'similarLink', 'totalAngleLink'],
    scenario: ['default'],
  });

  slides.push({
    show: ['similarLink', 'totalAngleLink', 'rightTris'],
    scenario: ['default'],
    steadyState: () => {
      rightTris.hideSides();
    },
  });

  slides.push({
    show: ['similarLink', 'totalAngleLink', 'rightTris', 'similarQuestion', 'similarHint.label'],
    scenario: ['default', 'top'],
    steadyState: () => {
      rightTris.hideSides();
    },
  });

  slides.push({
    show: ['similarLink', 'totalAngleLink', 'rightTris', 'thetaSimilar'],
    scenario: ['default', 'top'],
    steadyState: () => {
      rightTris.hideSides();
    },
  });

  slides.push({
    show: ['similarLink', 'totalAngleLink', 'rightTris.tri1'],
    scenario: ['default'],
    steadyState: () => {
      rightTris.hideSides();
    },
  });

  slides.push({
    show: ['similarLink', 'totalAngleLink', 'rightTris.tri1'],
    hide: ['rightTris.tri1.side20', 'rightTris.tri1.side12'],
    scenario: ['default'],
    transition: (done) => {
      rightTris.getElement('tri1.side01').animations.new()
        .dissolveIn({ duration: 0.5 })
        .whenFinished(done)
        .start();
    },
  });

  slides.push({
    show: ['similarLink', 'totalAngleLink', 'rightTris.tri1'],
    hide: ['rightTris.tri1.side20'],
    scenario: ['default'],
    transition: (done) => {
      rightTris.getElement('tri1.side12').animations.new()
        .dissolveIn({ duration: 0.5 })
        .whenFinished(done)
        .start();
    },
  });
  slides.push({
    show: ['similarLink', 'totalAngleLink', 'rightTris.tri1'],
    scenario: ['default'],
    transition: (done) => {
      rightTris.getElement('tri1.side20').animations.new()
        .dissolveIn({ duration: 0.5 })
        .whenFinished(done)
        .start();
    },
  });

  slides.push({
    showCommon: ['similarLink', 'totalAngleLink', 'rightTris.tri1', 'forAllTris'],
    scenarioCommon: ['default', 'upperLeft', 'top'],
  });

  slides.push({
    fromForm: null,
    form: 'oneRatio',
  });
  slides.push({
    fromForm: 'oneRatio',
    form: 'twoRatios',
  });
  slides.push({
    fromForm: 'twoRatios',
    form: 'threeRatios',
  });
  slides.push({
    showCommon: ['similarLink', 'totalAngleLink', 'rightTris.tri1', 'forAllTris'],
    hide: ['rightTris.tri1.side20'],
    fromForm: 'oneRatio',
    form: 'oneRatio',
    transition: (done) => {
      eqn.animations.new()
        .scenario({ start: 'upperLeft', target: 'left', duration: 1 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      eqn.setScenario('left');
    },
  });

  slides.push({
    showCommon: ['similarLink', 'totalAngleLink'],
    scenarioCommon: ['default', 'left'],
    fromForm: 'oneRatio',
    form: 'oneRatio',
    enterState: () => {
      rightTri.hasTouchableElements = false;
    },
    transition: (done) => {
      rightTri.showAll();
      figure.getElement('rightTri.rotLine').setRotation(0.4636);
      rightTri.animations.new()
        .inParallel([
          rightTri._tri._side01.animations.dissolveIn({ duration: 0.8 }),
          rightTri._tri._side12.animations.dissolveIn({ duration: 0.8 }),
          rightTri._tri._angle2._label.animations.dissolveIn({ duration: 0.8 }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      rightTri.showAll();
      figure.getElement('rightTri.rotLine').setRotation(0.4636);
    },
  });

  slides.push({
    showCommon: ['similarLink', 'totalAngleLink', 'rightTri'],
    fromForm: 'oneRatio',
    form: 'ratioValueDef',
    enterState: () => {
      rightTri.hasTouchableElements = false;
      figure.getElement('rightTri.rotLine').setRotation(0.4636);
    },
  });

  slides.push({
    showCommon: ['similarLink', 'totalAngleLink', 'rightTri'],
    fromForm: 'ratioValue',
    form: 'ratioValue',
    enterState: () => {
      rightTri.hasTouchableElements = false;
      figure.getElement('rightTri.rotLine').setRotation(0.4636);
    },
    transition: (done) => {
      rightTri.animations.new()
        .scenario({ start: 'default', target: 'bottom', duration: 0.8 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      rightTri.setScenario('bottom');
      rightTri.hasTouchableElements = true;
    },
  });

  nav.loadSlides(slides);
  nav.goToSlide(20);
}
makeSlides();