/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */

function layout() {
  const centerText = (name, text, modifiers = {}, position = [0, 0]) => ({
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
        default: { position, scale: 1 },
        topHigh: { position: [0, 1.2], scale: 1 },
        top: { position: [0, 1], scale: 1 },
        // right: { position: [1, 0] },
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
    centerText('firstCentury', '1|st| century CE', {
      // Geometry: {
      //   font: { style: 'italic', color: color2 },
      // },
      st: { font: { size: 0.1 }, offset: [0, 0.1] },
    }, [0, 0.8]),
    centerText('geometry', '|Geometry|', {
      Geometry: {
        font: { style: 'italic', color: color2 },
      },
    }, [0, 0]),
    centerText('fifteenth', '15|th| century CE', {
      th: { font: { size: 0.1 }, offset: [0, 0.1] },
    }, [0, 0.8]),
    centerText('lateTwentieth', 'Late 20|th| century CE', {
      th: { font: { size: 0.1 }, offset: [0, 0.1] },
    }, [0, 0.8]),
    centerText('calculators', 'Personal |Calculators| & |Computers|', {
      Calculators: { font: { style: 'italic', color: color2 } },
      Computers: { font: { style: 'italic', color: color2 } },
    }, [0, 0]),
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
layoutCircle1();
layout();
rightTris();
const totalAngle = totalAngleLayout();
similarLayout();
layoutTable();
layoutBow();

function makeSlides() {
  figure.add({
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      nextButton: { position: [3.8, 0], width: 0.2, height: 0.2 },
      prevButton: { position: [-3.8, 0], width: 0.2, height: 0.2 },
      equation: ['eqn', 'bow.eqn'],
      // equationDefaults: { duration: 4 },
    },
  });
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
  slides.push({
    show: [],
    scenario: ['default'],
    transition: (done) => {
      figure.getElement('totalAngle.eqn').showForm('abc')
      figure.getElement('totalAngle.eqn').hide();
      figure.animations.new()
        .then(figure.getElement('totalAngle.summary1').animations.dissolveIn(0.5))
        .then(figure.getElement('totalAngle.tri').animations.dissolveIn(0.5))
        .then(figure.getElement('totalAngle.eqn').animations.dissolveIn(0.5))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('totalAngle.eqn').showForm('abc');
      figure.getElement('totalAngle.tri').showAll();
      figure.getElement('totalAngle.summary1').showAll();
    },
  });

  slides.push({
    show: { totalAngle: ['summary1', 'tri', 'eqn'] },
    scenario: ['default'],
    fromForm: { 'totalAngle.eqn': 'abc' },
    form: { 'totalAngle.eqn': 'abc' },
    dissolve: { in: 'totalAngle.summary2' },
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

  slides.push({
    form: null,
    scenarioCommon: ['default', 'topHigh'],
    dissolve: { in: 'similarTriangles' },
  });

  slides.push({
    show: ['similarTriangles'],
    transition: (done) => {
      figure.getElement('similarTriangles').animations.new()
        .inParallel([
          sTri1.getElement('line').animations.dissolveIn(0.8),
          sTri2.getElement('line').animations.dissolveIn(0.8),
        ])
        .then(figure.getElement('similar.summary1').animations.dissolveIn(0.8))
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
    dissolve: { in: 'similar.summary3' },
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
    clear: true,
    scenarioCommon: ['default', 'left', 'top'],
    show: ['rightTri.tri.line'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      rightTri._tri.hideSides();
      rightTri._tri._angle2.hide();
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    dissolve: { in: ['rightTri.tri.line', 'rightTri.tri.angle1'] },
  });

  // dissolve in theta
  slides.push({
    show: ['rightTri.tri.line', 'rightTri.tri.angle1'],
    dissolve: { in: 'rightTri.tri.angle2' },
  });

  // Dissolve in third angle
  slides.push({
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      rightTri._tri.hideSides();
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle1'],
    dissolve: { in: 'rightTri.tri.angle0' },
  });

  // Dissolve in All Triangles
  slides.push({
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle0', 'rightTri.tri.angle1'],
    dissolve: { in: 'allTriangles' },
  });

  // Dissolve in Have the Same Angles
  slides.push({
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle0', 'allTriangles', 'rightTri.tri.angle1'],
    dissolve: { in: 'haveSameAngles' },
  });

  // Dissolve Are Similar
  slides.push({
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle0', 'rightTri.tri.angle1', 'allTriangles', 'haveSameAngles'],
    dissolve: {
      out: ['haveSameAngles', 'rightTri.tri.angle0'],
      in: 'areSimilar',
    },
  });

  // Dissolve in sides
  slides.push({
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle1', 'allTriangles', 'areSimilar'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    dissolve: { in: { 'rightTri.tri': ['side01', 'side12'] } },
    steadyState: () => {
      figure.shortCuts = {
        1: 'triPulseTheta',
        2: 'triPulseRight',
      };
    },
  });

  // Dissolve in have the same ratio
  slides.push({
    scenarioCommon: ['default', 'left', 'top', 'topRight'],
    fromForm: 'oppOnHyp',
    form: 'opp',
    show: ['rightTri', 'allTriangles', 'areSimilar'],
    hideCommon: ['rightTri.tri.angle0', 'rightTri.tri.side20'],
    dissolve: {
      out: ['areSimilar'],
      in: ['haveTheSame', 'eqn'],
    },
  });


  /*
  .########.##.....##.##....##..######..########.####..#######..##....##
  .##.......##.....##.###...##.##....##....##.....##..##.....##.###...##
  .##.......##.....##.####..##.##..........##.....##..##.....##.####..##
  .######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##
  .##.......##.....##.##..####.##..........##.....##..##.....##.##..####
  .##.......##.....##.##...###.##....##....##.....##..##.....##.##...###
  .##........#######..##....##..######.....##....####..#######..##....##
  */
  slides.push({
    clear: true,
    scenarioCommon: ['default', 'left', 'top', 'topRight'],
    show: ['rightTri', 'allTriangles', 'haveTheSame'],
    hideCommon: ['rightTri.tri.angle0', 'rightTri.tri.side20'],
    fromForm: 'oppOnHyp',
    form: 'ratioValue',
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      // rightTri._tri._side20.hide();
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          eqn.animations.scenario({ target: 'eqnTri', duration: 2 }),
          rightTri.animations.scenario({ target: 'eqnTri', duration: 2 }),
          figure.getElement('haveTheSame').animations.dissolveOut(0.4),
          figure.getElement('allTriangles').animations.dissolveOut(0.4),
        ])
        .trigger({ callback: 'triAnimateToValues', duration: 0.8 })
        .then(eqn.animations.goToForm({ target: 'ratioValue', animate: 'move' }))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.fnMap.exec('triToValues');
      figure.getElement('haveTheSame').hide();
      figure.getElement('allTriangles').hide();
      eqn.setScenario('eqnTri');
      rightTri.setScenario('eqnTri');
      rightTri.hasTouchableElements = true;
    },
  });

  slides.push({
    scenarioCommon: ['default', 'eqnTri'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToValues');
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    show: ['rightTri'],
    fromForm: 'ratioValue',
    form: 'f',
    steadyState: () => {
      rightTri.hasTouchableElements = true;
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
    fromForm: 'f',
    show: ['rightTri'],
    // enterState: () => figure.fnMap.exec('triToSin'),
    dissolve: {
      out: ['eqn', 'rightTri'],
      in: 'bow.circle',
    },
    form: null,
  });

  slides.push({
    clear: true,
    show: ['bow.circle'],
    transition: (done) => {
      figure.animations.new()
        .trigger({ callback: 'bowString', duration: 2.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('bow.bowString').showAll();
      figure.getElement('bow.eqn').showForm('0');
    },
  });

  slides.push({
    show: ['bow.circle', 'bow.eqn', 'bow.bowString'],
    enterStateCommon: () => figure.getElement('bow.eqn').showForm('0'),
    transition: (done) => {
      figure.animations.new()
        .trigger({ callback: 'bow', duration: 1 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('bow.arc').showAll();
    },
  });

  slides.push({
    show: ['bow.circle', 'bow.eqn', 'bow.bowString', 'bow.arc'],
    dissolve: {
      in: ['bow.x', 'bow.y'],
    },
  });

  slides.push({
    show: ['bow.circle', 'bow.eqn', 'bow.bowString', 'bow.arc', 'bow.x', 'bow.y'],
    dissolve: {
      in: ['bow.hyp', 'bow.cos', 'bow.sin', 'bow.rightAngle', 'bow.theta'],
    },
  });

  slides.push({
    show: ['bow'],
    steadyState: () => {
      bow.highlight(['sin', 'eqn']);
    },
    leaveStateCommon: () => bow.undim(),
  });
  slides.push({
    show: ['bow'],
    enterStateCommon: () => bow.highlight(['sin', 'eqn']),
    fromForm: { 'bow.eqn': '0' },
    form: { 'bow.eqn': '1' },
  });

  slides.push({
    show: ['bow'],
    fromForm: { 'bow.eqn': '1' },
    form: { 'bow.eqn': '2' },
  });

  slides.push({
    show: ['bow'],
    fromForm: { 'bow.eqn': '2' },
    form: { 'bow.eqn': '3' },
  });

  slides.push({
    show: ['bow'],
    fromForm: { 'bow.eqn': '3' },
    form: { 'bow.eqn': '4' },
  });

  /*
  ..######..####.##....##
  .##....##..##..###...##
  .##........##..####..##
  ..######...##..##.##.##
  .......##..##..##..####
  .##....##..##..##...###
  ..######..####.##....##
  */
  slides.push({
    clear: true,
    scenarioCommon: ['default', 'eqnTri'],
    show: ['rightTri'],
    hideCommon: { rightTri: ['rightTri.tri.angle0', 'rightTri.tri.side20'] },
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    fromForm: 'f',
    form: 'f',
    steadyState: () => {
      rightTri.hasTouchableElements = true;
    },
  });

  slides.push({
    show: ['rightTri'],
    fromForm: 'f',
    form: 'sinBracTheta',
    steadyState: () => {
      rightTri.hasTouchableElements = true;
    },
  });

  slides.push({
    show: ['rightTri'],
    fromForm: 'sinBracTheta',
    form: 'sinTheta',
    steadyState: () => {
      rightTri.hasTouchableElements = true;
    },
  });


  // slides.push({
  //   show: ['rightTri'],
  //   fromForm: 'sinTheta',
  //   form: 'sinTheta',
  //   transition: (done) => {
  //     rightTri._tri._side12._label.showForm('value');
  //     rightTri._tri._side12._label.animations.new()
  //       .dissolveOut(0.4)
  //       .trigger({ callback: 'triToSin' })
  //       .dissolveIn(0.4)
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     rightTri._tri._side12._label.showForm('name2');
  //     rightTri.hasTouchableElements = true;
  //     figure.fnMap.exec('triToSin');
  //   },
  // });

  /*
  .########....###....########..##.......########
  ....##......##.##...##.....##.##.......##......
  ....##.....##...##..##.....##.##.......##......
  ....##....##.....##.########..##.......######..
  ....##....#########.##.....##.##.......##......
  ....##....##.....##.##.....##.##.......##......
  ....##....##.....##.########..########.########
  */
  slides.push({
    clear: true,
    scenarioCommon: 'default',
    dissolve: { in: 'firstCentury' },
  });

  slides.push({
    show: ['firstCentury'],
    dissolve: { in: 'geometry' },
  });

  slides.push({
    show: ['firstCentury'],
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          figure.getElement('firstCentury').animations.dissolveOut(0.4),
          figure.getElement('geometry').animations.dissolveOut(0.4),
        ])
        .then(figure.getElement('table.tab1').animations.dissolveIn(0.4))
        .then(figure.getElement('table.tab2').animations.dissolveIn({ delay: 0.5, duration: 0.4 }))
        .then(figure.getElement('table.tab3').animations.dissolveIn({ delay: 0.5, duration: 0.4 }))
        .then(figure.getElement('table.tab4').animations.dissolveIn({ delay: 0.5, duration: 0.4 }))
        .then(figure.getElement('table.tab5').animations.dissolveIn({ delay: 0.5, duration: 0.4 }))
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      table.showAll();
      figure.getElement('firstCentury').hide();
    },
  });


  slides.push({
    show: 'table',
    dissolve: { out: 'table', in: 'fifteenth' },
  });

  slides.push({
    show: ['fifteenth'],
    fromForm: null,
    form: 'sinInf',
  });

  slides.push({
    show: ['fifteenth'],
    fromForm: 'sinInf',
    form: 'sinInf',
    transition: (done) => {
      table.showAll();
      table.animations.new()
        .opacity({ target: 0.6, start: 0.01, duration: 0.8 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      table.showAll();
      table.setOpacity(0.6);
    },
    leaveState: () => table.setOpacity(1),
  });

  slides.push({
    form: null,
    show: ['sinInf', 'fifteenth'],
    dissolve: { out: ['sinInf', 'fifteenth'], in: 'lateTwentieth' },
  });

  slides.push({
    form: null,
    show: ['lateTwentieth'],
    dissolve: { in: 'calculators' },
  });

  slides.push({
    show: ['lateTwentieth', 'calculators'],
    transition: (done) => {
      table.showAll();
      table.animations.new()
        .opacity({ target: 0.6, start: 0.01, duration: 0.8 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      table.showAll();
      table.setOpacity(0.6);
    },
    leaveState: () => table.setOpacity(1),
  });

  /*
  ..######...#######...######.
  .##....##.##.....##.##....##
  .##.......##.....##.##......
  .##.......##.....##..######.
  .##.......##.....##.......##
  .##....##.##.....##.##....##
  ..######...#######...######.
  */
  slides.push({
    clear: true,
    show: ['rightTri'],
    fromForm: 'sinTheta',
    form: 'sinTheta',
    scenarioCommon: ['default', 'eqnTri1'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToRot', initialAngle);
      figure.fnMap.exec('triToNames');
      rightTri.hasTouchableElements = true;
    },
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          rightTri._tri._angle1.animations.dissolveIn(0.4),
          rightTri._tri._angle2.animations.dissolveIn(0.4),
          rightTri._tri._side01.animations.dissolveIn(0.4),
          rightTri._tri._side12.animations.dissolveIn(0.4),
          rightTri._tri._line.animations.dissolveIn(0.4),
          eqn.animations.dissolveIn(0.4),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      rightTri.show();
      rightTri._tri._angle0.hide();
      rightTri._tri._side20.hide();
    },
  });

  slides.push({
    showCommon: ['rightTri', 'eqn'],
    hide: ['rightTri.tri.angle0'],
    fromForm: 'sinTheta',
    form: 'sinTheta',
    dissolve: { in: 'rightTri._tri._side20' },
  });

  slides.push({
    hide: ['rightTri.tri.angle0'],
    fromForm: 'sinTheta',
    form: 'twoRatios',
  });

  slides.push({
    // hide: ['rightTri.tri.angle0'],
    fromForm: 'twoRatios',
    form: 'twoRatios',
    dissolve: { in: 'rightTri._tri._angle0' },
  });

  slides.push({
    fromForm: 'twoRatios',
    form: 'twoRatiosSinComp',
  });

  slides.push({
    fromForm: 'twoRatiosSinComp',
    form: 'twoRatiosSinCompComment',
  });

  slides.push({
    fromForm: 'twoRatiosSinCompComment',
    form: 'twoRatiosComplementarySine',
  });

  slides.push({
    fromForm: 'twoRatiosComplementarySine',
    form: 'twoRatiosCosine',
  });

  slides.push({
    fromForm: 'twoRatiosCosine',
    form: 'twoRatiosCos',
  });

  slides.push({
    fromForm: 'twoRatiosCos',
    form: 'twoRatiosCosOnly',
  });

  slides.push({
    fromForm: 'twoRatiosCosOnly',
    form: 'threeRatiosEqual',
  });

  slides.push({
    fromForm: 'threeRatiosEqual',
    form: 'threeRatiosSineTimes',
  });

  slides.push({
    fromForm: 'threeRatiosSineTimes',
    form: 'threeRatiosSineTimes2',
  });

  slides.push({
    fromForm: 'threeRatiosSineTimes2',
    form: 'threeRatiosSineTimesStrike',
  });

  slides.push({
    fromForm: 'threeRatiosSineTimesStrike',
    form: 'threeRatiosSineOnCosTimes',
  });
  slides.push({
    fromForm: 'threeRatiosSineOnCosTimes',
    form: 'threeRatiosSineOnCos',
  });

  slides.push({
    showCommon: [],
    enterStateCommon: () => {},
    form: 'threeRatiosSineOnCos',
    fromForm: 'threeRatiosSineOnCos',
    transition: (done) => {
      eqn.animations.new()
        .scenario({ target: 'left', duration: 1.5 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => eqn.setScenario('left'),
  });

  slides.push({
    scenarioCommon: ['left'],
    fromForm: 'threeRatiosSineOnCos',
    form: 'fourRatios',
  });

  slides.push({
    fromForm: 'fourRatios',
    form: 'fiveRatios',
  });

  slides.push({
    fromForm: 'fiveRatios',
    form: 'sixRatios',
  });

  /*
  .########....###....##....##.....######..########..######.
  ....##......##.##...###...##....##....##.##.......##....##
  ....##.....##...##..####..##....##.......##.......##......
  ....##....##.....##.##.##.##.....######..######...##......
  ....##....#########.##..####..........##.##.......##......
  ....##....##.....##.##...###....##....##.##.......##....##
  ....##....##.....##.##....##.....######..########..######.
  */
  const [tan, cot] = figure.getElements(['circle1.tan', 'circle1.cot']);
  slides.push({
    clear: true,
    show: { circle1: ['circle', 'center'] },
    scenarioCommon: ['small'],
  });

  slides.push({
    show: { circle1: ['circle', 'center'] },
    scenarioCommon: ['small'],
    enterState: () => {
      tan.dim();
      cot.dim();
      figure.fnMap.exec('circSetAngle', 0.8);
      figure.getElement('circle1.rightAngle2').hide();
    },
    transition: (done) => {
      tan.setPosition(0.5, 0.5);
      cot.setPosition(0.5, 0.5);
      tan.show();
      cot.show();
      figure.animations.new()
        .inParallel([
          tan.animations.dissolveIn(0.5),
          cot.animations.dissolveIn(0.5),
        ])
        .trigger({ callback: 'circTangentMove', duration: 2 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      tan.show();
      cot.show();
      tan.setPosition(0, 0);
      cot.setPosition(0, 0);
    },
    leaveStateCommon: () => {
      tan.undim();
      cot.undim();
    },
  });

  slides.push({
    show: { circle1: ['circle', 'center', 'tan', 'cot'] },
    scenarioCommon: ['small'],
    enterStateCommon: () => {
      tan.dim();
      cot.dim();
      figure.fnMap.exec('circSetAngle', 0.8);
      tan.setPosition(0, 0);
      cot.setPosition(0, 0);
    },
    dissolve: {
      in: ['circle1.line', 'circle1.rightAngle2'],
    },
  });

  slides.push({
    show: { circle1: ['circle', 'center', 'tan', 'cot', 'rightAngle2', 'arc', 'line'] },
    scenarioCommon: ['small'],
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          figure.getElement('circle1.x').animations.dissolveIn(0.5),
          figure.getElement('circle1.y').animations.dissolveIn(0.5),
          figure.getElement('circle1.circle').animations.dissolveOut(0.5),
          figure.getElement('circle1.center').animations.dissolveOut(0.5),
          figure.getElement('circle1').animations.scenario({
            target: 'default', duration: 2,
          }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('circle1').show(['x', 'y']);
      figure.getElement('circle1').hide(['circle', 'center']);
      figure.getElement('circle1').setScenario('default');
    },
  });

  slides.push({
    scenarioCommon: 'default',
    show: {
      circle1: ['x', 'y', 'arc', 'tan', 'cot', 'rightAngle2', 'line'],
    },
    dissolve: {
      in: { circle1: ['sin', 'cos', 'angle', 'rightAngle1'] },
    },
  });

  slides.push({
    scenarioCommon: 'default',
    show: {
      circle1: ['x', 'y', 'arc', 'tan', 'cot', 'rightAngle2', 'line', 'sin', 'cos', 'angle', 'rightAngle1'],
    },
    dissolve: { in: { circle1: ['lineLabel'] } },
  });

  slides.push({
    scenarioCommon: 'default',
    show: {
      circle1: ['x', 'y', 'arc', 'tan', 'cot', 'rightAngle2', 'line', 'sin', 'cos', 'angle', 'rightAngle1', 'lineLabel'],
    },
    dissolve: { in: { circle1: ['sinLabel'] } },
  });

  slides.push({
    scenarioCommon: 'default',
    show: {
      circle1: ['x', 'y', 'arc', 'tan', 'cot', 'rightAngle2', 'line', 'sin', 'cos', 'angle', 'rightAngle1', 'lineLabel', 'sinLabel'],
    },
    dissolve: { in: { circle1: ['cosLabel'] } },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'sin', 'cos', 'sinLabel', 'cosLabel', 'rightAngle1', 'lineLabel', 'angle'] },
    scenario: ['default'],
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', 0.8);
      figure.shortCuts = { 1: 'circGoToAngle', 2: 'circTangentMove' };
    },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'sin', 'cos', 'sinLabel', 'cosLabel', 'rightAngle1', 'lineLabel', 'angle', 'tan', 'cot'] },
    scenario: ['default'],
    steadyState: () => {
      // figure.fnMap.exec('circSetTangentLine');
      figure.shortCuts = { 1: 'circGoToAngle', 2: 'circTangentMove' };
    },
  });

  // slides.push({
  //   show: { circle1: ['arc', 'x', 'y', 'line'] },
  //   scenario: ['default'],
  //   dissolve: {
  //     in: { circle1: ['sin', 'cos', 'sinLabel', 'cosLabel', 'rightAngle', 'radLineLabel'] },
  //   },
  // });


  // slides.push({
  //   fromForm: 'threeRatiosSineOnCos',
  //   form: 'threeRatiosSineOnCosTangent',
  // });

  // slides.push({
  //   fromForm: 'threeRatiosSineOnCosTangent',
  //   form: 'threeRatiosSineOnCosTan',
  // });

  // slides.push({
  //   fromForm: 'threeRatiosSineOnCosTan',
  //   form: 'threeRatiosTimesTan',
  // });

  // slides.push({
  //   fromForm: 'threeRatiosTimesTan',
  //   form: 'threeRatiosSinCosTan',
  // });

  // slides.push({
  //   clear: true,
  //   scenarioCommon: ['left'],
  //   fromForm: 'threeRatiosSinCosTan',
  //   form: 'sixRatios',
  // });

  slides.push({
    clear: true,
    scenario: ['start', 'right'],
    show: ['circle1'],
    // hide: [{ circle1: ['csc', 'cscLabel', 'cot', 'cotLabel'] }],
    form: null,
    steadyState: () => {
      figure.getElement('circle1.line').setRotation(0.45);
      figure.shortCuts = {
        1: () => figure.getElement('circle1.tanSec1.eqn1').nextForm(),
        2: () => figure.getElement('circle1.tanSec1.eqn2').nextForm(),
        3: () => figure.getElement('circle1.tanSec1.eqn3').nextForm(),
        4: () => {
          figure.getElement('circle1.tanSec1').setScenario('end');
          figure.getElement('circle1.sinCos1').setScenario('end');
          figure.getElement('circle1.tanSec1.eqn1').hide();
          figure.getElement('circle1.tanSec1.eqn2').hide();
          figure.getElement('circle1.tanSec1.eqn3').hide();
          figure.getElement('circle1.tanSec1.theta.label').hide();
          figure.getElement('circle1.sinCos1.eqn1').hide();
          figure.getElement('circle1.sinCos1.eqn2').hide();
          figure.getElement('circle1.sinCos1.eqn3').hide();
          figure.getElement('circle1.sinCos1.theta.label').hide();
          figure.getElement('circle1.sinCos1').animations.new()
            .scenario({ start: 'end', target: 'start', duration: 3 })
            .then(figure.getElement('circle1.tanSec1').animations.scenario({ target: 'mid', duration: 3 }))
            .then(figure.getElement('circle1.tanSec1').animations.scenario({ target: 'start', duration: 3 }))
            .start();
        },
      };
    //   figure.getElement('circle1.sinCos1').animations.new()
    //     .delay(1)
    //     .scenario({ start: 'end', target: 'start', duration: 3 })
    //     .then(figure.getElement('circle1.tanSec1').animations.scenario({ target: 'mid', duration: 3 }))
    //     .then(figure.getElement('circle1.tanSec1').animations.scenario({ target: 'start', duration: 3 }))
    //     .start();
    },
  });


  nav.loadSlides(slides);
  nav.goToSlide(28);
}
makeSlides();
