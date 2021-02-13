/* eslint-disable camelcase */
/* globals figure, colTan, colCot, colCsc, color2, colSec, colTheta
   colCsc */

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

  const leftText = (name, position, text, modifiers = {}, size = 0.2) => ({
    name,
    method: 'textLines',
    options: {
      text,
      modifiers,
      position,
      xAlign: 'left',
      justify: 'left',
      yAlign: 'baseline',
      font: { size, color: [0.3, 0.3, 0.3, 1] },
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

  // const link = (name, text, position, onClick = {}) => ({
  //   name,
  //   method: 'text',
  //   options: {
  //     text,
  //     position,
  //     font: { size: 0.1 },
  //     xAlign: 'center',
  //   },
  //   mods: {
  //     isTouchable: true,
  //     touchBorder: 0.1,
  //     onClick,
  //   },
  // });

  // const hint = (name, position, hints) => {
  //   const elements = [];
  //   elements.push({
  //     name: 'label',
  //     method: 'text',
  //     options: {
  //       text: 'Hint',
  //       xAlign: 'center',
  //       font: { size: 0.1 },
  //     },
  //     mods: {
  //       isTouchable: true,
  //       touchBorder: 0.1,
  //       onClick: () => {
  //         const hintElement = figure.getElement(name);
  //         for (let i = 0; i < hints.length; i += 1) {
  //           const hintText = hintElement.getElement(`hint${i}`);
  //           if (hintText.isShown) {
  //             hintText.hide();
  //             if (i < hints.length - 1) {
  //               hintElement.getElement(`hint${i + 1}`).show();
  //               return;
  //             }
  //             return;
  //           }
  //         }
  //         hintElement.getElement(`hint${0}`).show();
  //       },
  //     },
  //   });
  //   hints.forEach((h, index) => {
  //     elements.push({
  //       name: `hint${index}`,
  //       method: 'primitives.textLines',
  //       options: {
  //         text: h.text,
  //         modifiers: h.modifiers,
  //         position: [0, -0.2],
  //         xAlign: 'center',
  //       },
  //       mods: {
  //         isTouchable: true,
  //         hasTouchableElements: true,
  //       },
  //     });
  //   });
  //   return {
  //     name,
  //     method: 'collection',
  //     elements,
  //     options: {
  //       position,
  //     },
  //   };
  // };

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
          'The Trigonmetric Functions',
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
    // centerText('sumOfAngles', 'Angles in a triangle always add to 180\u00b0'),
    centerText('similarTriangles', 'Similar Triangles'),
    // centerText('similarQuestion', 'Are these triangles similar?'),
    centerText('tangent', '|tangent|: from Latin |tangere| - "to touch"', {
      tangent: { font: { style: 'italic', family: 'Times New Roman', color: colTan } },
      tangere: { font: { style: 'italic', family: 'Times New Roman' } },
    }, [0.8, -1.25]),
    centerText('compTangent', '|co|mplementary |t|angent', {
      co: { font: { color: colCot } },
      t: { font: { color: colCot } },
    }, [1.2, 1]),
    centerText('compSecant', '|c|omplementary |s|e|c|ant', {
      c: { font: { color: colCsc } },
      s: { font: { color: colCsc } },
    }, [1.2, 1]),
    centerText('cot', '|cot|', {
      cot: { font: { style: 'italic', family: 'Times New Roman', color: colCot } },
    }, [0.8, 0.6]),
    centerText('secant', '|secant|: from Latin |secare| - "to cut"', {
      secant: { font: { style: 'italic', family: 'Times New Roman', color: colSec } },
      secare: { font: { style: 'italic', family: 'Times New Roman' } },
    }, [0.8, -1.25]),
    leftText('allTriangles', [-2, 0.95], 'All right triangles with |theta|:', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }),
    leftText('haveSameAngles', [0.1, 0.95], ' have the |same angles|', {
      'same angles': {
        font: { color: colTheta },
        onClick: 'triPulseAngles',
        touchBorder: 0.1,
      },
    }),
    leftText('areSimilar', [0.1, 0.95], ' are similar'),
    leftText('haveTheSame', [0.1, 0.95], ' have the same'),
    leftText('haveEqualCorr', [0.1, 0.95], ' have equal corresponding'),
    leftText('sideRatios', [0.1, 0.7], ' side ratios'),
    leftText('hasTheSameValue', [-1.6, 1.2], 'is the same value for all right triangles with angle |theta|', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, 0.15),
    leftText('hasTheSameValue1', [-1.6, 0.7], 'is the same value for all right triangles with angle |theta|', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, 0.15),
    leftText('hasTheSameValue2', [-1.6, 0.2], 'is the same value for all right triangles with angle |theta|', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, 0.15),
    leftText('hasTheSameValue3', [-1.6, -0.3], 'is the same value for all right triangles with angle |theta|', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, 0.15),
    leftText('hasTheSameValue4', [-1.6, -0.8], 'is the same value for all right triangles with angle |theta|', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, 0.15),
    leftText('hasTheSameValue5', [-1.6, -1.3], 'is the same value for all right triangles with angle |theta|', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, 0.15),
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
      equation: ['eqn', 'bow.eqn', 'eqn1', 'circle1.bowStringLabel'],
      // equationDefaults: { duration: 4 },
    },
  });
  const slides = [];

  const nav = figure.getElement('nav');
  const rightTri = figure.getElement('rightTri');
  const circle = figure.getElement('circle');
  // const rightTris = figure.getElement('rightTris');
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

  // slides.push({ scenario: 'default', show: ['background'] });

  // /*
  // ..######..##.....##.##.....##
  // .##....##.##.....##.###...###
  // .##.......##.....##.####.####
  // ..######..##.....##.##.###.##
  // .......##.##.....##.##.....##
  // .##....##.##.....##.##.....##
  // ..######...#######..##.....##
  // */
  // slides.push({
  //   show: [],
  //   scenario: ['default'],
  //   transition: (done) => {
  //     figure.getElement('totalAngle.eqn').showForm('abc');
  //     figure.getElement('totalAngle.eqn').hide();
  //     figure.animations.new()
  //       .then(figure.getElement('totalAngle.summary1').animations.dissolveIn(0.5))
  //       .then(figure.getElement('totalAngle.tri').animations.dissolveIn(0.5))
  //       .then(figure.getElement('totalAngle.eqn').animations.dissolveIn(0.5))
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     figure.getElement('totalAngle.eqn').showForm('abc');
  //     figure.getElement('totalAngle.tri').showAll();
  //     figure.getElement('totalAngle.summary1').showAll();
  //   },
  // });

  // slides.push({
  //   show: { totalAngle: ['summary1', 'tri', 'eqn'] },
  //   scenario: ['default'],
  //   fromForm: { 'totalAngle.eqn': 'abc' },
  //   form: { 'totalAngle.eqn': 'abc' },
  //   dissolve: { in: 'totalAngle.summary2' },
  // });


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
    steadyStateCommon: () => {
      figure.shortCuts = {
        1: 'triPulseRight',
        2: 'triPulseTheta',
        3: 'triPulseOpp',
        4: 'triPulseHyp',
        5: 'triPulseAdj',
      };
    },
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

  // Dissolve Have equal corresponding side ratios
  slides.push({
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle1', 'allTriangles'],
    dissolve: {
      out: ['areSimilar'],
      in: ['haveEqualCorr', 'sideRatios'],
    },
  });

  // Dissolve in sides
  slides.push({
    scenarioCommon: ['default', 'eqnTri'],
    show: ['rightTri.tri.line', 'rightTri.tri.angle2', 'rightTri.tri.angle1', 'allTriangles', 'haveEqualCorr', 'sideRatios'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    transition: (done) => {
      eqn.showForm('oppOnHyp');
      eqn.hide();
      figure.animations.new()
        .inParallel([
          eqn.animations.scenario({ target: 'eqnTri', duration: 2 }),
          rightTri.animations.scenario({ start: 'default', target: 'eqnTri', duration: 2 }),
          figure.getElement('haveEqualCorr').animations.dissolveOut(0.4),
          figure.getElement('sideRatios').animations.dissolveOut(0.4),
          figure.getElement('allTriangles').animations.dissolveOut(0.4),
          figure.getElement('rightTri.tri.side01').animations.dissolveIn(0.4),
          figure.getElement('rightTri.tri.side12').animations.dissolveIn(0.4),
          figure.getElement('rightTri.tri.side20').animations.dissolveIn(0.4),
        ])
        .inParallel([
          eqn.animations.dissolveIn(0.4),
          figure.getElement('hasTheSameValue').animations.dissolveIn(0.4),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.hide(['haveEqualCorr', 'sideRatios', 'allTriangles']);
      figure.getElement('rightTri.tri').show(['side01', 'side12', 'side20']);
      figure.getElement('hasTheSameValue').show();
      eqn.showForm('oppOnHyp');
    },
  });

  // Dissolve in all ratios the same with opp on hyp
  slides.push({
    show: ['rightTri', 'hasTheSameValue'],
    hideCommon: ['rightTri.tri.angle0'],
    fromForm: 'oppOnHyp',
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          eqn.animations.goToForm({ target: 'twoSideRatios', duration: 2, animate: 'move' }),
          figure.getElement('hasTheSameValue1').animations.dissolveIn(0.4),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('hasTheSameValue1').show();
      eqn.showForm('twoSideRatios');
    },
  });

  // Dissolve in two ratios
  slides.push({
    show: ['rightTri', 'hasTheSameValue', 'hasTheSameValue1'],
    hideCommon: ['rightTri.tri.angle0'],
    fromForm: 'twoSideRatios',
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          eqn.animations.goToForm({ target: 'sixSideRatios', duration: 2, animate: 'move' }),
          figure.getElement('hasTheSameValue2').animations.dissolveIn(0.4),
          figure.getElement('hasTheSameValue3').animations.dissolveIn(0.4),
          figure.getElement('hasTheSameValue4').animations.dissolveIn(0.4),
          figure.getElement('hasTheSameValue5').animations.dissolveIn(0.4),
          rightTri.animations.dissolveOut(0.4),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('hasTheSameValue2').show();
      figure.getElement('hasTheSameValue3').show();
      figure.getElement('hasTheSameValue4').show();
      figure.getElement('hasTheSameValue5').show();
      eqn.showForm('sixSideRatios');
      rightTri.hide();
    },
  });

  // Dissolve second ratio
  slides.push({
    fromForm: 'sixSideRatios',
    form: 'sixSideRatios',
    show: ['rightTri', 'hasTheSameValue', 'hasTheSameValue1', 'hasTheSameValue2', 'hasTheSameValue3', 'hasTheSameValue4', 'hasTheSameValue5'],
    hideCommon: ['rightTri.tri.angle0'],
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          figure.getElement('hasTheSameValue').animations.dissolveOut(0.4),
          figure.getElement('hasTheSameValue1').animations.dissolveOut(0.4),
          figure.getElement('hasTheSameValue2').animations.dissolveOut(0.4),
          figure.getElement('hasTheSameValue3').animations.dissolveOut(0.4),
          figure.getElement('hasTheSameValue4').animations.dissolveOut(0.4),
          figure.getElement('hasTheSameValue5').animations.dissolveOut(0.4),
          rightTri.animations.dissolveIn(0.4),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('hasTheSameValue').hide();
      figure.getElement('hasTheSameValue1').hide();
      figure.getElement('hasTheSameValue2').hide();
      figure.getElement('hasTheSameValue3').hide();
      figure.getElement('hasTheSameValue4').hide();
      figure.getElement('hasTheSameValue5').hide();
      rightTri.show();
    },
  });

  // // Dissolve in all ratios
  // slides.push({
  //   fromForm: 'sixSideRatios',
  //   form: 'sixSideRatios',
  //   show: ['rightTri', 'hasTheSameValue', 'hasTheSameValue1'],
  //   dissolve: { out: ['hasTheSameValue', 'hasTheSameValue1'] },
  // });

  const circle1 = figure.getElement('circle1');
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
    scenarioCommon: ['default', 'eqnTri'],
    show: ['rightTri'],
    hideCommon: ['rightTri.tri.angle0'],
    fromForm: 'sixSideRatios',
    form: 'sixSideRatios',
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      // rightTri._tri._side20.hide();
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          figure.animations.trigger({ callback: 'triAnimateToValues', duration: 0.8 }),
          eqn.animations.goToForm({ delay: 0.4, target: 'sixSideRatiosWithValue', animate: 'move' }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.fnMap.exec('triToValues');
      figure.getElement('haveTheSame').hide();
      figure.getElement('allTriangles').hide();
      eqn.showForm('sixSideRatiosWithValue');
      figure.fnMap.exec('triToRot', initialAngle);
      rightTri.hasTouchableElements = true;
      figure.shortCuts = {
        1: 'triAnimateToRot',
      };
    },
  });

  slides.push({
    enterStateCommon: () => {
      figure.fnMap.exec('triToValues');
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
    },
    show: ['rightTri'],
    fromForm: 'sixSideRatiosWithValue',
    form: 'sixSideRatiosFunction',
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          figure.animations.trigger({ callback: 'triAnimateToNames', duration: 0.8 }),
          eqn.animations.goToForm({ delay: 0.4, target: 'sixSideRatiosFunction', animate: 'move' }),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.fnMap.exec('triToNames');
      eqn.showForm('sixSideRatiosFunction');
      rightTri.hasTouchableElements = true;
    },
  });

  /*
  .##.....##.##....##.####.########.....######..####.########...######.
  .##.....##.###...##..##.....##.......##....##..##..##.....##.##....##
  .##.....##.####..##..##.....##.......##........##..##.....##.##......
  .##.....##.##.##.##..##.....##.......##........##..########..##......
  .##.....##.##..####..##.....##.......##........##..##...##...##......
  .##.....##.##...###..##.....##.......##....##..##..##....##..##....##
  ..#######..##....##.####....##........######..####.##.....##..######.
  */
  slides.push({
    scenarioCommon: ['default', 'eqnTri', 'circleSmall'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToNames');
      rightTri.hasTouchableElements = false;
      figure.fnMap.exec('triToRot', initialAngle);
      figure.fnMap.exec('circSetAngle', initialAngle);
    },
    show: ['rightTri'],
    fromForm: 'sixSideRatiosFunction',
    form: 'sixSideRatiosFunction',
    dissolve: { out: 'rightTri', in: { circle1: ['circle', 'center', 'line', 'lineLabel'] } },
  });

  slides.push({
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', initialAngle);
    },
    show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle'] },
    // fromForm: 'sixSideRatiosFunction',
    form: 'sixSideRatiosFunction',
    dissolve: { in: { circle1: ['x', 'angle'] } },
  });

  slides.push({
    show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1'] },
    // fromForm: 'sixSideRatiosFunction',
    form: 'sixSideRatiosFunction',
    dissolve: { in: { circle1: ['sin', 'cos', 'rightAngle1'] } },
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
    show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1'] },
    form: 'sixRatiosSinHighlight',
    enterState: () => {
      eqn.highlight(['opposite', 'v1', 'hypotenuse', '_1_rad', 'f_1', '_1', 'lb1', 'rb1', 'theta1']);
    },
    leaveStateCommon: () => eqn.undim(),
  });
  slides.push({
    show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1'] },
    form: 'sixSROppHyp1',
    enterState: () => {
      eqn.highlight(['opposite', 'v1', 'hypotenuse', '_1_rad', 'f_1', '_1', 'lb1', 'rb1', 'theta1']);
    },
  });
  slides.push({
    show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1'] },
    form: 'sixSROppF',
    enterState: () => {
      eqn.highlight(['opposite', 'v1', 'hypotenuse', '_1_rad', 'f_1', '_1', 'lb1', 'rb1', 'theta1']);
    },
  });
  slides.push({
    show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'f1Label'] },
    form: 'sixSROppF',
    enterState: () => {
      eqn.highlight(['opposite', 'v1', 'hypotenuse', '_1_rad', 'f_1', '_1', 'lb1', 'rb1', 'theta1']);
    },
    dissolve: { in: 'circle1.f1Label', pulse: { xAlign: 'left', scale: 3 } },
  });

  slides.push({
    show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'f1Label'] },
    fromForm: 'sixSROppF',
    form: 'sixSideRatiosFunction',
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
    showCommon: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1'] },
    show: { circle1: 'f1Label' },
    dissolve: { out: 'circle1.f1Label' },
  });
  slides.push({
    show: { circle1: ['bowString'] },
    dissolve: { in: 'circle1.bowString' },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', initialAngle);
      circle1.highlight(['bow', 'bowStringLabel', 'bowString', 'sin']);
    },
    leaveStateCommon: () => circle1.undim(),
  });

  slides.push({
    show: { circle1: ['bowString', 'bow'] },
    dissolve: { in: 'circle1.bow' },
  });

  slides.push({
    show: { circle1: ['bowString', 'bowStringLabel'] },
    fromForm: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': null },
    form: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': 'bowstring' },
  });

  slides.push({
    show: { circle1: ['bowStringLabel'] },
    form: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': 'half' },
  });

  slides.push({
    show: { circle1: ['bowStringLabel'] },
    form: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': 'sinus' },
  });

  slides.push({
    show: { circle1: ['bowStringLabel'] },
    form: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': 'sine' },
  });

  slides.push({
    show: { circle1: ['bowStringLabel'] },
    form: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': 'sinesin' },
  });

  slides.push({
    show: { circle1: ['bowStringLabel'] },
    form: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': 'sin' },
    steadyState: () => { figure.shortCuts = { 1: 'eqnPulseF1' }; },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', initialAngle);
    },
    leaveStateCommon: () => {},
  });

  slides.push({
    show: { circle1: ['sinLabel'] },
    fromForm: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': null },
    form: { eqn: 'sixSRSin', 'circle1.bowStringLabel': null },
    steadyState: () => { figure.shortCuts = { 1: 'eqnPulseSin' }; },
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
    scenarioCommon: ['default', 'eqnTri', 'circleSmall'],
    showCommon: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'sinLabel'] },
    form: 'sixSRSin',
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          circle1.animations.scenario({ target: 'circleQuart', duration: 2 }),
          circle1._x.animations.dissolveIn(0.4),
          circle1._y.animations.dissolveIn(0.4),
          circle1._arc.animations.dissolveIn(0.4),
          circle1._circle.animations.dissolveOut(0.4),
          circle1._center.animations.dissolveOut(0.4),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circle1.show(['x', 'y', 'arc']);
      circle1.setScenario('circleQuart');
      circle1.hide(['circle', 'center']);
    },
  });

  slides.push({
    scenarioCommon: ['default', 'eqnTri', 'circleQuart'],
    showCommon: { circle1: ['x', 'y', 'arc', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'sinLabel'] },
    form: 'sixSRCosHighlight',
  });
  slides.push({
    scenarioCommon: ['default', 'eqnTri', 'circleQuart'],
    showCommon: { circle1: ['x', 'y', 'arc', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'sinLabel', 'compAngle2'] },
    form: 'sixSRCosHighlight',
    dissolve: { in: 'circle1.compAngle2', pulse: { scale: 1.4 } },
  });
  slides.push({ form: 'sixSRCosComp' });
  slides.push({ form: 'sixSRCosComplementarySine' });
  slides.push({ form: 'sixSRCosCosine' });
  slides.push({ form: 'sixSRCosCos' });
  slides.push({ form: 'sixSRCosThetaHighlight' });
  slides.push({ form: 'sixSRCosThetaHighlight', dissolve: { in: 'circle1.cosLabel', pulse: { scale: 2, yAlign: 'top' } } });
  slides.push({
    showCommon: { circle1: ['x', 'y', 'arc', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'sinLabel', 'cosLabel'] },
    form: 'sixSRCos',
  });


  /*
  .########....###....##....##
  ....##......##.##...###...##
  ....##.....##...##..####..##
  ....##....##.....##.##.##.##
  ....##....#########.##..####
  ....##....##.....##.##...###
  ....##....##.....##.##....##
  */
  slides.push({
    showCommon: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'sinLabel'] },
    show: { circle1: 'f1Label' },
    dissolve: { out: 'circle1.f1Label' },
  });

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

  // slides.push({
  //   show: ['fifteenth'],
  //   fromForm: 'sinInf',
  //   form: 'sinInf',
  //   transition: (done) => {
  //     table.showAll();
  //     table.animations.new()
  //       .opacity({ target: 0.6, start: 0.01, duration: 0.8 })
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     table.showAll();
  //     table.setOpacity(0.6);
  //   },
  //   leaveState: () => table.setOpacity(1),
  // });

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
    // hide: { rightTri: ['rightTri.tri.angle0', 'rightTri.tri.side20'] },
    fromForm: 'sinTheta',
    form: 'sinTheta',
    scenarioCommon: ['default', 'eqnTri1'],
    enterStateCommon: () => {
      figure.fnMap.exec('triToRot', initialAngle);
      figure.fnMap.exec('triToNames');
      figure.getElement('rightTri.tri.angle0').hide();
      figure.getElement('rightTri.tri.side20').hide();
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
    enterStateCommon: () => {
      figure.fnMap.exec('triToRot', initialAngle);
      figure.fnMap.exec('triToNames');
      figure.getElement('rightTri.tri.angle0').hide();
      rightTri.hasTouchableElements = true;
    },
    fromForm: 'sinTheta',
    form: 'twoRatios',
  });

  slides.push({
    fromForm: 'twoRatios',
    form: 'twoRatios',
    dissolve: { in: 'rightTri._tri._angle0' },
  });

  slides.push({
    enterStateCommon: () => {
      figure.fnMap.exec('triToRot', initialAngle);
      figure.fnMap.exec('triToNames');
      rightTri.hasTouchableElements = true;
    },
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
  // const [tan, cot] = figure.getElements(['circle1.tan', 'circle1.cot']);

  slides.push({
    clear: true,
    // show: { circle1: ['arc', 'x', 'y', 'circle', 'center'] },
    scenario: ['left', 'right1'],
    fromForm: 'sixRatios',
    form: 'sixRatiosLeft',
    transition: (done) => {
      figure.animations.new()
        .inParallel([
          eqn.animations.goToForm({
            start: 'sixRatios', target: 'sixRatiosLeft', duration: 2, animate: 'move',
          }),
          eqn.animations.scenario({ start: 'left', target: 'eqnCircLeft', duration: 2 }),
        ])
        .inParallel(
          figure.getElements({ circle1: ['arc', 'x', 'y', 'circle', 'center'] }).map(e => e.animations.dissolveIn(0.5)),
        )
        .whenFinished(done)
        .start();
    },
    // dissolve: { in: { circle1: ['arc', 'x', 'y', 'circle', 'center'] } },
    steadyState: () => {
      eqn.setScenario('eqnCircLeft');
      figure.getElement('circle1').show(['arc', 'x', 'y', 'circle', 'center']);
      eqn.dim();
    },
    steadyStateCommon: () => {
      figure.shortCuts = {
        1: 'circPulseTan',
        2: 'circPulseCot',
        3: 'circPulseRad',
        4: 'circPulseSec1',
        5: 'circPulseSec',
        6: 'circPulseCsc',
        7: 'circPulseSin',
        8: 'circPulseSin1',
        9: 'circPulseCos',
        0: 'circPulseTheta',
        '-': 'circPulseComp',
        '=': 'circPulseTheta2',
      };
    },
    leaveStateCommon: () => {
      circle1.undim();
      eqn.undim();
    },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'circle', 'center', 'line', 'angle', 'lineLabel'] },
    scenario: ['eqnCircLeft', 'right1'],
    fromForm: 'sixRatiosLeft',
    form: 'sixRatiosLeft',
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', 0.8);
      figure.getElement('circle1.rightAngle2').hide();
      eqn.dim();
    },
    dissolve: { in: { circle1: ['line', 'angle', 'lineLabel'] } },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'circle', 'center', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel'] },
    scenario: ['eqnCircLeft', 'right1'],
    fromForm: 'sixRatiosLeft',
    form: 'sixRatiosLeft',
    dissolve: { in: { circle1: ['tan', 'tanLabel'] } },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'circle', 'center', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel'] },
    scenario: ['default', 'eqnCircLeft', 'right1'],
    fromForm: 'sixRatiosLeft',
    form: 'sixRatiosLeft',
    dissolve: { in: 'tangent' },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'circle', 'center', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2'] },
    scenario: ['eqnCircLeft', 'right1'],
    fromForm: 'sixRatiosLeft',
    form: 'sixRatiosLeft',
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', 0.8);
      eqn.dim();
    },
    transition: (done) => {
      circle1.getElement('rightAngle2').animations.new()
        .dissolveIn(0.4)
        .pulseAngle({ curve: { scale: 3 }, duration: 1 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circle1.getElement('rightAngle2').show();
    },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'circle', 'center', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1'] },
    scenario: ['eqnCircLeft', 'right1'],
    fromForm: 'sixRatiosLeft',
    form: 'sixRatiosLeft',
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', 0.8);
      eqn.dim();
    },
    dissolve: { in: { circle1: ['sec1', 'secLabel1'] } },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'circle', 'center', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1'] },
    scenario: ['default', 'eqnCircLeft', 'right1'],
    fromForm: 'sixRatiosLeft',
    form: 'sixRatiosLeft',
    dissolve: { in: 'secant' },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'circle', 'center', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1'] },
    scenario: ['eqnCircLeft', 'right1'],
    fromForm: 'sixRatiosLeft',
    form: 'sixRatiosLeft',
    transition: (done) => {
      figure.animations.new()
        .inParallel([
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
      figure.getElement('circle1').hide(['circle', 'center']);
      figure.getElement('circle1').setScenario('default');
      figure.shortCuts = {
        1: 'circPulseTheta',
        2: 'circPulseTan',
        3: 'circPulseRad',
        4: 'circPulseSec1',
      };
    },
  });

  /*
  .########....###....##....##
  ....##......##.##...###...##
  ....##.....##...##..####..##
  ....##....##.....##.##.##.##
  ....##....#########.##..####
  ....##....##.....##.##...###
  ....##....##.....##.##....##
  */
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1'] },
    scenarioCommon: ['default', 'eqnCircLeft', 'eqn1Right'],
    fromForm: { eqn: 'sixRatiosLeft', eqn1: null },
    form: { eqn: 'sixRatiosLeft', eqn1: 'oppOnAdj' },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1'] },
    fromForm: { eqn: 'sixRatiosLeft', eqn1: 'oppOnAdj' },
    form: { eqn: 'sixRatiosLeft', eqn1: 'tanOn1' },
  });
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1'] },
    fromForm: { eqn: 'sixRatiosLeft', eqn1: 'tanOn1' },
    form: { eqn: 'sixRatiosLeft', eqn1: 'tan' },
  });
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1'] },
    fromForm: { eqn: 'sixRatiosLeft', eqn1: 'tan' },
    form: { eqn: 'sixRatiosTan', eqn1: 'tan' },
    transition: (done) => {
      eqn.animations.new()
        .goToForm({ target: 'sixRatiosTan', animate: 'move', duration: 1 })
        .trigger({ callback: 'eqnPulseTan', duration: 1 })
        .whenFinished(done)
        .start();
    },
  });

  /*
  ..######..########..######.
  .##....##.##.......##....##
  .##.......##.......##......
  ..######..######...##......
  .......##.##.......##......
  .##....##.##.......##....##
  ..######..########..######.
  */
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1'] },
    scenarioCommon: ['default', 'eqnCircLeft', 'eqn1Right'],
    fromForm: { eqn: 'sixRatiosTan', eqn1: null },
    form: { eqn: 'sixRatiosTan', eqn1: 'hypOnAdj' },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1'] },
    fromForm: { eqn: 'sixRatiosTan', eqn1: 'hypOnAdj' },
    form: { eqn: 'sixRatiosTan', eqn1: 'secOn1' },
  });
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1'] },
    fromForm: { eqn: 'sixRatiosTan', eqn1: 'secOn1' },
    form: { eqn: 'sixRatiosTan', eqn1: 'sec' },
  });
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1'] },
    fromForm: { eqn: 'sixRatiosTan', eqn1: 'sec' },
    form: { eqn: 'sixRatiosSec', eqn1: 'sec' },
    transition: (done) => {
      eqn.animations.new()
        .goToForm({ target: 'sixRatiosSec', animate: 'move', duration: 1 })
        .trigger({ callback: 'eqnPulseSec', duration: 1 })
        .whenFinished(done)
        .start();
    },
  });

  /*
  ..######...#######..########.....######...######...######.
  .##....##.##.....##....##.......##....##.##....##.##....##
  .##.......##.....##....##.......##.......##.......##......
  .##.......##.....##....##.......##........######..##......
  .##.......##.....##....##.......##.............##.##......
  .##....##.##.....##....##.......##....##.##....##.##....##
  ..######...#######.....##........######...######...######.
  */
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle'] },
    fromForm: 'sixRatiosSec',
    form: 'sixRatiosSec',
    // dissolve: { in: 'circle1.compAngle' },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', 0.8);
      circle1.dim(['tan', 'tanLabel', 'sec1', 'secLabel1', 'angle']);
      eqn.dim();
    },
    transition: (done) => {
      circle1.getElement('compAngle').animations.new()
        .dissolveIn(0.4)
        .pulseAngle({ curve: 2, label: 2, duration: 1 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circle1.getElement('compAngle').show();
    },
  });
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3'] },
    fromForm: 'sixRatiosSec',
    form: 'sixRatiosSec',
    dissolve: { in: { circle1: ['cot', 'cotLabel', 'rightAngle3'] } },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'compTangent'] },
    fromForm: 'sixRatiosSec',
    form: 'sixRatiosSec',
    dissolve: { in: 'compTangent' },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel'] },
    fromForm: 'sixRatiosSec',
    form: 'sixRatiosSec',
    dissolve: { in: { circle1: ['csc', 'cscLabel'] } },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel', 'compSecant'] },
    fromForm: 'sixRatiosSec',
    form: 'sixRatiosSec',
    dissolve: { in: 'compSecant' },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel', 'compSecant', 'angle2'] },
    fromForm: 'sixRatiosSec',
    form: 'sixRatiosSec',
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', 0.8);
      circle1.dim(['tan', 'tanLabel', 'sec1', 'secLabel1', 'angle', 'compAngle']);
      eqn.dim();
    },
    // dissolve: { in: 'angle2' },
    transition: (done) => {
      circle1.getElement('angle2').animations.new()
        .dissolveIn(0.4)
        .pulseAngle({ curve: 2, label: 2, duration: 1 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circle1.getElement('angle2').show();
    },
  });

  /*
  ..######...#######..########
  .##....##.##.....##....##...
  .##.......##.....##....##...
  .##.......##.....##....##...
  .##.......##.....##....##...
  .##....##.##.....##....##...
  ..######...#######.....##...
  */
  slides.push({
    scenarioCommon: ['default', 'eqnCircLeft', 'eqn1MoreRight'],
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel', 'compSecant', 'angle2'] },
    // scenarioCommon: ['default', 'eqnCircLeft', 'eqn1Right'],
    fromForm: { eqn: 'sixRatiosSec', eqn1: null },
    form: { eqn: 'sixRatiosSec', eqn1: 'adjOnOpp' },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel', 'compSecant', 'angle2'] },
    fromForm: { eqn: 'sixRatiosSec', eqn1: 'adjOnOpp' },
    form: { eqn: 'sixRatiosSec', eqn1: 'cotOn1' },
  });
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel', 'compSecant', 'angle2'] },
    fromForm: { eqn: 'sixRatiosSec', eqn1: 'cotOn1' },
    form: { eqn: 'sixRatiosSec', eqn1: 'cot' },
  });
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel', 'compSecant', 'angle2'] },
    fromForm: { eqn: 'sixRatiosSec', eqn1: 'cot' },
    form: { eqn: 'sixRatiosCot', eqn1: 'cot' },
    transition: (done) => {
      eqn.animations.new()
        .goToForm({ target: 'sixRatiosCot', animate: 'move', duration: 1 })
        .trigger({ callback: 'eqnPulseCot', duration: 1 })
        .whenFinished(done)
        .start();
    },
  });

  /*
  ..######...######...######.
  .##....##.##....##.##....##
  .##.......##.......##......
  .##........######..##......
  .##.............##.##......
  .##....##.##....##.##....##
  ..######...######...######.
  */
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel', 'compSecant', 'angle2'] },
    scenarioCommon: ['default', 'eqnCircLeft', 'eqn1MoreRight'],
    fromForm: { eqn: 'sixRatiosCot', eqn1: null },
    form: { eqn: 'sixRatiosCot', eqn1: 'hypOnOpp' },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel', 'compSecant', 'angle2'] },
    fromForm: { eqn: 'sixRatiosCot', eqn1: 'hypOnOpp' },
    form: { eqn: 'sixRatiosCot', eqn1: 'cscOn1' },
  });
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel', 'compSecant', 'angle2'] },
    fromForm: { eqn: 'sixRatiosCot', eqn1: 'cscOn1' },
    form: { eqn: 'sixRatiosCot', eqn1: 'csc' },
  });
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel', 'compSecant', 'angle2'] },
    fromForm: { eqn: 'sixRatiosCot', eqn1: 'csc' },
    form: { eqn: 'sixRatiosCsc', eqn1: 'csc' },
    transition: (done) => {
      eqn.animations.new()
        .goToForm({ target: 'sixRatiosCsc', animate: 'move', duration: 1 })
        .trigger({ callback: 'eqnPulseCsc', duration: 1 })
        .whenFinished(done)
        .start();
    },
  });

  /*
  ..######..####.##....##.....######...#######...######.
  .##....##..##..###...##....##....##.##.....##.##....##
  .##........##..####..##....##.......##.....##.##......
  ..######...##..##.##.##....##.......##.....##..######.
  .......##..##..##..####....##.......##.....##.......##
  .##....##..##..##...###....##....##.##.....##.##....##
  ..######..####.##....##.....######...#######...######.
  */
  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'sec1', 'secLabel1', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel', 'compSecant', 'angle2', 'sin', 'sinLabel'] },
    fromForm: 'sixRatiosCsc',
    form: 'sixRatiosCsc',
    dissolve: { in: { circle1: ['sin', 'sinLabel'] } },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle2', 'xSec', 'compAngle', 'cot', 'cotLabel', 'rightAngle3', 'csc', 'cscLabel', 'compSecant', 'angle2', 'sin', 'sinLabel', 'sec', 'secLabel', 'rightAngle1'] },
    fromForm: 'sixRatiosCsc',
    form: 'sixRatiosCsc',
    dissolve: {
      in: { circle1: ['cos', 'cosLabel', 'sec', 'secLabel', 'rightAngle1'] },
      // out: { circle1: ['sec1', 'secLabel1'] },
    },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'lineLabel', 'tan', 'tanLabel', 'rightAngle3', 'cot', 'cotLabel', 'csc', 'cscLabel', 'compSecant', 'sin', 'sinLabel', 'cos', 'cosLabel', 'sec', 'secLabel', 'xSec', 'rightAngle1'] },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', 1);
      eqn.dim();
    },
  });

  slides.push({
    show: { circle1: ['arc', 'x', 'y', 'line', 'angle', 'compSecant', 'sin', 'sinLabel', 'cos', 'cosLabel', 'rightAngle1', 'tanAlt', 'tanLabelAlt', 'secAlt', 'secLabelAlt', 'cotAlt', 'cotLabelAlt', 'cscAlt', 'cscLabelAlt'] },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', 1);
      eqn.dim();
    },
  });

  nav.loadSlides(slides);
  nav.goToSlide(37);
}
makeSlides();
