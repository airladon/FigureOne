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
        topHigh: { position: [0, 1.2], scale: 1 },
        top: { position: [0, 1], scale: 1 },
      },
      isTouchable: true,
    },
  });

  const leftText = (name, position, text, modifiers = {}) => ({
    name,
    method: 'textLines',
    options: {
      text,
      modifiers,
      position,
      xAlign: 'left',
      justify: 'left',
      yAlign: 'baseline',
      font: { size: 0.2, color: [0.3, 0.3, 0.3, 1] },
      fixColor: true,
    },
    mods: {
      isTouchable: true,
    //   scenarios: {
    //     top: { position: [-2, 1], scale: 1 },
    //     default: { position: [-2, 0], scale: 1 },
    //   },
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
    leftText('allTriangles', [-2, 0.95], 'All right triangles with |theta|:', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: color1 } },
    }),
    leftText('haveSameAngles', [0.1, 0.95], ' have the |same angles|', {
      'same angles': {
        font: { color: color1 },
        onClick: 'triPulseAngles',
        touchBorder: 0.1,
      },
    }),
    leftText('areSimilar', [0.1, 0.95], ' are similar'),
    leftText('haveTheSame', [0.1, 0.95], ' have the same'),

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
layoutTable();
layoutBow();

function makeSlides() {
  const slides = [];

  const nav = figure.getElement('nav');
  const rightTri = figure.getElement('rightTri');
  const circle = figure.getElement('circle');
  const rightTris = figure.getElement('rightTris');
  const eqn = figure.getElement('eqn');
  const table = figure.getElement('table');
  const bow = figure.getElement('bow');

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
  // slides.push({
  //   scenario: 'default',
  //   show: ['sumOfAngles'],
  // });

  slides.push({
    show: ['totalAngle.summary1', 'totalAngle.tri', 'totalAngle.eqn'],
    scenario: ['default'],
    steadyState: () => {
      figure.getElement('totalAngle.eqn').showForm('abc');
    },
  });

  slides.push({
    show: ['totalAngle.summary1', 'totalAngle.tri', 'totalAngle.eqn', 'totalAngle.summary2'],
    scenario: ['default'],
    steadyState: () => {
      figure.getElement('totalAngle.eqn').showForm('abc');
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
  const sTri1 = figure.getElement('similar.tri1');
  const sTri2 = figure.getElement('similar.tri2');

  slides.push({ scenario: 'default', show: ['similarTriangles'] });

  slides.push({
    show: ['similarTriangles'],
    scenario: ['default', 'top'],
    transition: (done) => {
      figure.getElement('similarTriangles').animations.new()
        .scenario({ start: 'default', target: 'topHigh', duration: 1 })
        .then(figure.getElement('similar.summary1').animations.dissolveIn(0.8))
        .inParallel([
          sTri1.getElement('line').animations.dissolveIn(0.8),
          sTri2.getElement('line').animations.dissolveIn(0.8),
        ])
        .inParallel([
          sTri1.getElement('angle0').animations.dissolveIn(0.8),
          sTri1.getElement('angle1').animations.dissolveIn(0.8),
          sTri1.getElement('angle2').animations.dissolveIn(0.8),
        ])
        .inParallel([
          sTri2.getElement('angle0').animations.dissolveIn(0.8),
          sTri2.getElement('angle1').animations.dissolveIn(0.8),
          sTri2.getElement('angle2').animations.dissolveIn(0.8),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('similarTriangles').setScenario('topHigh');
      figure.show(['similar.tri1', 'similar.tri2', 'similar.summary1']);
      sTri1.hideSides();
      sTri2.hideSides();
    },
  });

  slides.push({
    show: ['similarTriangles', 'similar.tri1', 'similar.tri2', 'similar.summary1', 'similar.summary2'],
    scenario: ['default', 'topHigh'],
    transition: (done) => {
      sTri1.hideSides();
      sTri2.hideSides();
      figure.getElement('similar.summary2').animations.new()
        .dissolveIn(0.8)
        .inParallel([
          sTri1.getElement('side01').animations.dissolveIn(0.8),
          sTri1.getElement('side12').animations.dissolveIn(0.8),
          sTri1.getElement('side20').animations.dissolveIn(0.8),
        ])
        .inParallel([
          sTri2.getElement('side01').animations.dissolveIn(0.8),
          sTri2.getElement('side12').animations.dissolveIn(0.8),
          sTri2.getElement('side20').animations.dissolveIn(0.8),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      sTri1.showAll();
      sTri2.showAll();
    },
  });

  slides.push({
    show: ['similarTriangles', 'similar.tri1', 'similar.tri2', 'similar.summary1', 'similar.summary2', 'similar.summary3'],
    scenario: ['default', 'topHigh'],
    transition: (done) => {
      figure.getElement('similar.summary3').animations.new()
        .dissolveIn(0.8)
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('similar.summary3').showAll();
    },
  });

  /*
  .########..####..######...##.....##.########....########.########..####
  .##.....##..##..##....##..##.....##....##..........##....##.....##..##.
  .##.....##..##..##........##.....##....##..........##....##.....##..##.
  .########...##..##...####.#########....##..........##....########...##.
  .##...##....##..##....##..##.....##....##..........##....##...##....##.
  .##....##...##..##....##..##.....##....##..........##....##....##...##.
  .##.....##.####..######...##.....##....##..........##....##.....##.####
  */
  const initialAngle = 0.7;
  slides.push({
    scenario: ['default', 'left'],
    show: ['rightTri.tri.line'],
    enterState: () => {
      rightTri._tri.hideSides();
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          rightTri.getElement('tri.line').animations.dissolveIn(0.5),
          rightTri.getElement('tri.angle1').animations.dissolveIn(0.5),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('rightTri.tri.line').showAll();
      figure.getElement('rightTri.tri.angle1').showAll();
    },
  });

  // dissolve in theta
  slides.push({
    scenario: ['default', 'left'],
    show: ['rightTri.tri.line'],
    enterState: () => {
      figure.fnMap.exec('triToNames');
      rightTri._tri.hideSides();
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    transition: (done) => {
      rightTri.animations.new()
        .then(figure.getElement('rightTri.tri.angle2').animations.dissolveIn({
          duration: 0.8,
        }))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('rightTri.tri.angle2').showAll();
    },
  });

  // Dissolve in sides
  slides.push({
    scenario: ['default', 'left'],
    show: ['rightTri.tri.line', 'rightTri.tri.angle2'],
    enterState: () => {
      figure.fnMap.exec('triToNames');
      rightTri._tri.hideSides();
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    transition: (done) => {
      rightTri.animations.new()
        .trigger({ callback: 'triSidesDissolveIn', duration: 0.8 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      rightTri._tri.showSides();
      figure.shortCuts = {
        1: 'triPulseTheta',
        2: 'triPulseRight',
      };
    },
  });

  // Dissolve in third angle
  slides.push({
    show: ['rightTri'],
    scenario: ['default', 'left', 'top'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      figure.fnMap.exec('triToRot', initialAngle);
      rightTri.hasTouchableElements = false;
    },
    transition: (done) => {
      rightTri.getElement('tri.angle0').animations.new()
        .dissolveIn({ duration: 0.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      rightTri.getElement('tri.angle0').showAll();
    },
  });

  // Dissolve in All Triangles
  slides.push({
    show: ['rightTri'],
    scenario: ['default', 'left', 'top'],
    transition: (done) => {
      figure.animations.new()
        .then(figure.getElement('allTriangles').animations.dissolveIn(0.5))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('allTriangles').show();
    },
  });

  // Dissolve in Have the Same Angles
  slides.push({
    show: ['rightTri', 'allTriangles'],
    scenario: ['default', 'left', 'top'],
    transition: (done) => {
      figure.animations.new()
        .then(figure.getElement('haveSameAngles').animations.dissolveIn(0.5))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('haveSameAngles').show();
    },
  });

  // Dissolve Are Similar
  slides.push({
    show: ['rightTri', 'allTriangles', 'haveSameAngles'],
    scenario: ['default', 'left', 'top'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      figure.fnMap.exec('triToRot', initialAngle);
      rightTri.hasTouchableElements = false;
      rightTri.getElement('tri.angle0').hide();
    },
    transition: (done) => {
      figure.animations.new()
        .then(figure.getElement('haveSameAngles').animations.dissolveOut(0.5))
        .then(figure.getElement('areSimilar').animations.dissolveIn(0.5))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('areSimilar').show();
    },
  });

  // Dissolve in have the same ratio
  slides.push({
    show: ['rightTri', 'allTriangles', 'areSimilar'],
    scenario: ['default', 'left', 'top', 'topRight'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      figure.fnMap.exec('triToRot', initialAngle);
      rightTri.hasTouchableElements = false;
      rightTri.getElement('tri.angle0').hide();
    },
    transition: (done) => {
      figure.animations.new()
        .then(figure.getElement('areSimilar').animations.dissolveOut(0.8))
        .inParallel([
          figure.getElement('haveTheSame').animations.dissolveIn(0.8),
          eqn.animations.goToForm({ start: null, target: 'oppOnHyp' }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('haveTheSame').show();
      eqn.showForm('oppOnHyp');
    },
  });

  slides.push({
    show: ['rightTri'],
    scenario: ['default', 'left', 'top'],
    fromForm: null,
    form: 'statement',
  });





  slides.push({
    scenario: ['default'],
    show: ['rightTri'],
    transition: (done) => {
      figure.animations.new()
        .trigger({
          callback: 'triAnimateToNames', duration: 1,
        })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.fnMap.exec('triToNames');
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
      figure.getElement('rightTri.rotLine').setRotation(0.61072);
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
      figure.getElement('rightTri.rotLine').setRotation(0.61072);
    },
  });

  slides.push({
    showCommon: ['similarLink', 'totalAngleLink', 'rightTri'],
    fromForm: 'oneRatio',
    form: 'ratioValueDef',
    enterState: () => {
      rightTri.hasTouchableElements = false;
      figure.getElement('rightTri.rotLine').setRotation(0.61072);
    },
  });

  slides.push({
    showCommon: ['similarLink', 'totalAngleLink', 'rightTri'],
    fromForm: 'ratioValue',
    form: 'ratioValue',
    enterState: () => {
      rightTri.hasTouchableElements = false;
      figure.getElement('rightTri.rotLine').setRotation(0.61072);
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

  slides.push({
    fromForm: 'ratioValue',
    form: 'f',
    scenarioCommon: ['default', 'left', 'bottom'],
    transition: (done) => {
      figure.animations.new()
        .trigger({
          callback: () => {
            eqn.goToForm({
              start: 'ratioValue', form: 'f', duration: 1, animate: 'move'
            });
          },
          duration: 1,
        })
        .trigger({ callback: 'rotateTri', duration: 1 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      rightTri.hasTouchableElements = true;
      figure.getElement('rightTri.rotLine').setRotation(Math.PI / 4);
    },
  });

  slides.push({
    form: 'fOnly',
    fromForm: 'f',
    showCommon: ['similarLink', 'totalAngleLink', 'rightTri'],
    scenarioCommon: ['default', 'left'],
    transition: (done) => {
      eqn.animations.new()
        .inParallel([
          eqn.animations.goToForm({ start: 'f', target: 'fOnly', animate: 'move', duration: 0.1 }),
          eqn.animations.scenario({ start: 'left', target: 'table', duration: 0.8 })
        ])
        // .then(table.animations.dissolveIn({ duration: 0.5 }))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      console.log('adsf')
      table.showAll();
      eqn.setScenario('table');
      rightTri.hasTouchableElements = true;
      figure.getElement('rightTri.rotLine').setRotation(Math.PI / 4);
    },
  });

  slides.push({
    form: 'fInf',
    fromForm: 'fOnly',
    showCommon: ['similarLink', 'totalAngleLink'],
    transition: (done) => {
      eqn.animations.new()
        .inParallel([
          eqn.animations.goToForm({ start: 'fOnly', target: 'fLeft', animate: 'move', duration: 1 }),
          eqn.animations.scenario({ start: 'table', target: 'default', duration: 1 }),
        ])
        // .then(table.animations.dissolveIn({ duration: 0.5 }))
        .whenFinished(done)
        .start();
    },
  });

  /*
  .########...#######..##......##
  .##.....##.##.....##.##..##..##
  .##.....##.##.....##.##..##..##
  .########..##.....##.##..##..##
  .##.....##.##.....##.##..##..##
  .##.....##.##.....##.##..##..##
  .########...#######...###..###.
  */
  slides.push({
    form: null,
    showCommon: ['bow.circle'],
    steadyState: () => {
      // figure.shortCuts['1'] = 'bowString';
      // figure.shortCuts['2'] = 'bow';
      // figure.shortCuts['3'] = 'bowCircle';
      // figure.shortCuts['4'] = 'bowRad';
      // figure.shortCuts['5'] = 'bowTri';
      // figure.shortCuts['6'] = 'bowSin';
    },
  });

  nav.loadSlides(slides);
  nav.goToSlide(8);
}
makeSlides();