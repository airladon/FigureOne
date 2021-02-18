/* eslint-disable camelcase */
/* globals figure, colTan, colCot, colCsc, color2, colSec, colTheta
   colCsc */

function layout() {
  const centerText = (name, text, modifiers = {}, position = [0, 0], size = 0.2) => ({
    name,
    method: 'textLines',
    options: {
      text,
      modifiers,
      position,
      xAlign: 'center',
      justify: 'left',
      yAlign: 'middle',
      font: { size, color: [0.3, 0.3, 0.3, 1] },
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
    centerText('chord', '|chord|: from Latin |chorda| - "bowstring"', {
      chord: { font: { style: 'italic', family: 'Times New Roman', color: colSin } },
      chorda: { font: { style: 'italic', family: 'Times New Roman' } },
    }, [1.5, 0], 0.15),
    centerText('tangent', '|tangent|: from Latin |tangere| - "to touch"', {
      tangent: { font: { style: 'italic', family: 'Times New Roman', color: colTan } },
      tangere: { font: { style: 'italic', family: 'Times New Roman' } },
    }, [1.5, 0], 0.15),
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
    }, [1.5, 0], 0.15),
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
layoutLines();
layoutRight();
layoutCircle();
layoutCircle1();
layoutCirc();
layout();
// rightTris();
// const totalAngle = totalAngleLayout();
similarLayout();
// layoutTable();
// layoutBow();

function makeSlides() {
  figure.add({
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      nextButton: { position: [3.8, 0], width: 0.2, height: 0.2 },
      prevButton: { position: [-3.8, 0], width: 0.2, height: 0.2 },
      equation: ['eqn', 'bow.eqn', 'eqn1', 'circle1.bowStringLabel', 'circle1.tanAltEqn', 'circle1.secAltEqn', 'circle1.cotAltEqn', 'circle1.cscAltEqn', 'eqn2', 'circle1.cosLabelEqn'],
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
  const circ = figure.getElement('circ')

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

  // /*
  // .##.....##.##....##.####.########.....######..####.########...######.
  // .##.....##.###...##..##.....##.......##....##..##..##.....##.##....##
  // .##.....##.####..##..##.....##.......##........##..##.....##.##......
  // .##.....##.##.##.##..##.....##.......##........##..########..##......
  // .##.....##.##..####..##.....##.......##........##..##...##...##......
  // .##.....##.##...###..##.....##.......##....##..##..##....##..##....##
  // ..#######..##....##.####....##........######..####.##.....##..######.
  // */
  // slides.push({
  //   scenarioCommon: ['default', 'eqnTri', 'circleSmall'],
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('triToNames');
  //     rightTri.hasTouchableElements = false;
  //     figure.fnMap.exec('triToRot', initialAngle);
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //   },
  //   show: ['rightTri'],
  //   fromForm: 'sixSideRatiosFunction',
  //   form: 'sixSideRatiosFunction',
  //   dissolve: { out: 'rightTri', in: { circle1: ['circle', 'center', 'line', 'lineLabel'] } },
  // });

  // slides.push({
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //   },
  //   show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle'] },
  //   // fromForm: 'sixSideRatiosFunction',
  //   form: 'sixSideRatiosFunction',
  //   dissolve: { in: { circle1: ['x', 'angle'] } },
  // });

  // slides.push({
  //   show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1'] },
  //   // fromForm: 'sixSideRatiosFunction',
  //   form: 'sixSideRatiosFunction',
  //   dissolve: { in: { circle1: ['sin', 'cos', 'rightAngle1'] } },
  // });

  // /*
  // ..######..####.##....##
  // .##....##..##..###...##
  // .##........##..####..##
  // ..######...##..##.##.##
  // .......##..##..##..####
  // .##....##..##..##...###
  // ..######..####.##....##
  // */
  // slides.push({
  //   show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1'] },
  //   form: 'sixRatiosSinHighlight',
  //   enterState: () => {
  //     eqn.highlight(['opposite', 'v1', 'hypotenuse', '_1_rad', 'f_1', '_1', 'lb1', 'rb1', 'theta1']);
  //   },
  //   leaveStateCommon: () => eqn.undim(),
  // });
  // slides.push({
  //   show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1'] },
  //   form: 'sixSROppHyp1',
  //   enterState: () => {
  //     eqn.highlight(['opposite', 'v1', 'hypotenuse', '_1_rad', 'f_1', '_1', 'lb1', 'rb1', 'theta1']);
  //   },
  // });
  // slides.push({
  //   show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1'] },
  //   form: 'sixSROppF',
  //   enterState: () => {
  //     eqn.highlight(['opposite', 'v1', 'hypotenuse', '_1_rad', 'f_1', '_1', 'lb1', 'rb1', 'theta1']);
  //   },
  // });
  // slides.push({
  //   show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'f1Label'] },
  //   form: 'sixSROppF',
  //   enterState: () => {
  //     eqn.highlight(['opposite', 'v1', 'hypotenuse', '_1_rad', 'f_1', '_1', 'lb1', 'rb1', 'theta1']);
  //   },
  //   dissolve: { in: 'circle1.f1Label', pulse: { xAlign: 'left', scale: 3 } },
  // });

  // slides.push({
  //   show: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'f1Label'] },
  //   fromForm: 'sixSROppF',
  //   form: 'sixSideRatiosFunction',
  // });

  // /*
  // .########...#######..##......##
  // .##.....##.##.....##.##..##..##
  // .##.....##.##.....##.##..##..##
  // .########..##.....##.##..##..##
  // .##.....##.##.....##.##..##..##
  // .##.....##.##.....##.##..##..##
  // .########...#######...###..###.
  // */
  // slides.push({
  //   showCommon: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1'] },
  //   show: { circle1: 'f1Label' },
  //   dissolve: { out: 'circle1.f1Label' },
  // });
  // slides.push({
  //   show: { circle1: ['bowString'] },
  //   dissolve: { in: 'circle1.bowString' },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //     circle1.highlight(['bow', 'bowStringLabel', 'bowString', 'sin']);
  //   },
  //   leaveStateCommon: () => circle1.undim(),
  // });

  // slides.push({
  //   show: { circle1: ['bowString', 'bow'] },
  //   dissolve: { in: 'circle1.bow' },
  // });

  // slides.push({
  //   show: { circle1: ['bowString', 'bowStringLabel'] },
  //   fromForm: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': null },
  //   form: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': 'bowstring' },
  // });

  // slides.push({
  //   show: { circle1: ['bowStringLabel'] },
  //   form: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': 'half' },
  // });

  // slides.push({
  //   show: { circle1: ['bowStringLabel'] },
  //   form: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': 'sinus' },
  // });

  // slides.push({
  //   show: { circle1: ['bowStringLabel'] },
  //   form: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': 'sine' },
  // });

  // slides.push({
  //   show: { circle1: ['bowStringLabel'] },
  //   form: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': 'sinesin' },
  // });

  // slides.push({
  //   show: { circle1: ['bowStringLabel'] },
  //   form: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': 'sin' },
  //   steadyState: () => { figure.shortCuts = { 1: 'eqnPulseF1' }; },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //   },
  //   leaveStateCommon: () => {},
  // });

  // slides.push({
  //   show: { circle1: ['sinLabel'] },
  //   fromForm: { eqn: 'sixSideRatiosFunction', 'circle1.bowStringLabel': null },
  //   form: { eqn: 'sixSRSin', 'circle1.bowStringLabel': null },
  //   steadyState: () => { figure.shortCuts = { 1: 'eqnPulseSin' }; },
  // });

  // /*
  // ..######...#######...######.
  // .##....##.##.....##.##....##
  // .##.......##.....##.##......
  // .##.......##.....##..######.
  // .##.......##.....##.......##
  // .##....##.##.....##.##....##
  // ..######...#######...######.
  // */

  // slides.push({
  //   scenarioCommon: ['default', 'eqnTri', 'circleSmall'],
  //   showCommon: { circle1: ['circle', 'center', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'sinLabel'] },
  //   form: 'sixSRSin',
  //   transition: (done) => {
  //     figure.animations.new()
  //       .inParallel([
  //         circle1.animations.scenario({ target: 'circleQuart', duration: 2 }),
  //         circle1._x.animations.dissolveIn(0.4),
  //         circle1._y.animations.dissolveIn(0.4),
  //         circle1._arc.animations.dissolveIn(0.4),
  //         circle1._circle.animations.dissolveOut(0.4),
  //         circle1._center.animations.dissolveOut(0.4),
  //       ])
  //       .whenFinished(done)
  //       .start();
  //   },
  //   steadyState: () => {
  //     circle1.show(['x', 'y', 'arc']);
  //     circle1.setScenario('circleQuart');
  //     circle1.hide(['circle', 'center']);
  //   },
  // });

  // slides.push({
  //   scenarioCommon: ['default', 'eqnTri', 'circleQuart'],
  //   showCommon: { circle1: ['x', 'y', 'arc', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'sinLabel'] },
  //   form: 'sixSRCosHighlight',
  // });

  // slides.push({
  //   scenarioCommon: ['default', 'eqnTri', 'circleQuart'],
  //   showCommon: { circle1: ['x', 'y', 'arc', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'sinLabel', 'compAngle2'] },
  //   form: 'sixSRCosHighlight',
  //   dissolve: { in: 'circle1.compAngle2', pulse: { scale: 1.4 } },
  // });

  // slides.push({ form: 'sixSRCosComp' });
  // slides.push({ form: 'sixSRCosComplementarySine' });
  // slides.push({ form: 'sixSRCosCosine' });
  // slides.push({ form: 'sixSRCosCos' });
  // slides.push({ form: 'sixSRCosThetaHighlight' });

  // slides.push({ form: 'sixSRCosThetaHighlight', dissolve: { in: 'circle1.cosLabel', pulse: { scale: 2, yAlign: 'top' } } });

  // slides.push({
  //   showCommon: { circle1: ['x', 'y', 'arc', 'line', 'lineLabel', 'x', 'angle', 'sin', 'cos', 'rightAngle1', 'sinLabel', 'cosLabel'] },
  //   form: 'sixSRCos',
  // });


  // /*
  // .########.####.##.......##..........########.....###....########..######.
  // .##........##..##.......##..........##.....##...##.##......##....##....##
  // .##........##..##.......##..........##.....##..##...##.....##....##......
  // .######....##..##.......##..........########..##.....##....##.....######.
  // .##........##..##.......##..........##...##...#########....##..........##
  // .##........##..##.......##..........##....##..##.....##....##....##....##
  // .##.......####.########.########....##.....##.##.....##....##.....######.
  // */
  // slides.push({ form: 'sixSRCosRearrange' });
  // slides.push({ form: 'sixSRSinOnCosHyp' });
  // slides.push({ form: 'sixSRSinOnCosHypStk' });
  // slides.push({ form: 'sixSRSinOnCos' });
  // slides.push({ form: 'sixSRHypOnCos' });
  // slides.push({ form: 'sixSROneOnCosStk' });
  // slides.push({ form: 'sixSROneOnCos' });
  // slides.push({ form: 'sixSRCosOnSin' });
  // slides.push({ form: 'sixSROneOnSin' });
  // slides.push({ form: 'sixSRR' });

  // /*
  // .########....###....##....##
  // ....##......##.##...###...##
  // ....##.....##...##..####..##
  // ....##....##.....##.##.##.##
  // ....##....#########.##..####
  // ....##....##.....##.##...###
  // ....##....##.....##.##....##
  // */
  // slides.push({
  //   showCommon: { circle1: ['x', 'y', 'arc', 'line', 'x', 'angle', 'tanAlt', 'secAlt', 'rightAngle4', 'adjacentOne', 'adjacentOneLabel'] },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //     circle1.highlight(['tanAlt', 'secAlt', 'tanAltEqn', 'tanLabelAlt', 'secAltEqn', 'secLabelAlt', 'adjacentOne', 'adjacentOneLabel', 'angle']);
  //   },
  //   dissolve: {
  //     in: { circle1: ['secAlt', 'tanAlt', 'rightAngle4', 'adjacentOne', 'adjacentOneLabel'] },
  //   },
  //   leaveStateCommon: () => circle1.undim(),
  // });

  // slides.push({
  //   show: 'tangent',
  //   dissolve: { in: 'tangent' },
  // });

  // slides.push({
  //   show: ['tangent', 'circle1.tanAltEqn'],
  //   fromForm: { eqn: 'sixSRR', 'circle1.tanAltEqn': null },
  //   form: { eqn: 'sixSRR', 'circle1.tanAltEqn': 'tangent' },
  // });

  // slides.push({
  //   show: 'circle1.tanAltEqn',
  //   form: { eqn: 'sixSRR', 'circle1.tanAltEqn': 'tangentTan' },
  // });

  // slides.push({
  //   show: 'circle1.tanAltEqn',
  //   form: { eqn: 'sixSRR', 'circle1.tanAltEqn': 'tan' },
  // });

  // slides.push({
  //   showCommon: { circle1: ['x', 'y', 'arc', 'line', 'x', 'angle', 'tanAlt', 'secAlt', 'rightAngle4', 'tanLabelAlt', 'adjacentOne', 'adjacentOneLabel'] },
  //   fromForm: 'sixSRR',
  //   form: 'sixSRRTanOnOne',
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //     circle1.highlight(['tanAlt', 'secAlt', 'tanAltEqn', 'tanLabelAlt', 'secAltEqn', 'secLabelAlt', 'adjacentOne', 'adjacentOneLabel', 'angle']);
  //     eqn.highlight(['opposite_1', 'adjacent_1', 'v3', 'f_3', '_3', 'lb3', 'rb3', 'theta3', 'equals7', 'sin_2', 'theta12', 'cos_2', 'theta8', 'v7', 'tan_1', '_1_rad', 'v11', 'equals11', 'tan', 'equals3', 'stk1', 'theta15']);
  //   },
  //   leaveStateCommon: () => {
  //     circle1.undim();
  //     eqn.undim();
  //   },
  // });

  // slides.push({ form: 'sixSRRTanOnOneStk' });
  // slides.push({ form: 'sixSRRTanEquals' });
  // slides.push({ form: 'sixSRRTan' });

  // /*
  // ..######..########..######.
  // .##....##.##.......##....##
  // .##.......##.......##......
  // ..######..######...##......
  // .......##.##.......##......
  // .##....##.##.......##....##
  // ..######..########..######.
  // */

  // slides.push({
  //   show: 'secant',
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //     circle1.highlight(['tanAlt', 'secAlt', 'tanAltEqn', 'tanLabelAlt', 'secAltEqn', 'adjacentOne', 'adjacentOneLabel', 'angle']);
  //   },
  //   fromForm: 'sixSRRTan',
  //   form: 'sixSRRTan',
  //   dissolve: { in: 'secant' },
  // });

  // slides.push({
  //   show: ['secant', 'circle1.secAltEqn'],
  //   fromForm: { eqn: 'sixSRRTan', 'circle1.secAltEqn': null },
  //   form: { eqn: 'sixSRRTan', 'circle1.secAltEqn': 'secant' },
  // });

  // slides.push({
  //   show: 'circle1.secAltEqn',
  //   form: { eqn: 'sixSRRTan', 'circle1.secAltEqn': 'secantSec' },
  // });

  // slides.push({
  //   show: 'circle1.secAltEqn',
  //   form: { eqn: 'sixSRRTan', 'circle1.secAltEqn': 'sec' },
  // });

  // slides.push({
  //   showCommon: { circle1: ['x', 'y', 'arc', 'line', 'x', 'angle', 'tanAlt', 'secAlt', 'rightAngle4', 'tanLabelAlt', 'adjacentOne', 'adjacentOneLabel', 'secLabelAlt'] },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //     circle1.highlight(['tanAlt', 'secAlt', 'tanAltEqn', 'tanLabelAlt', 'secLabelAlt', 'adjacentOne', 'adjacentOneLabel', 'angle', 'compAngle']);
  //     eqn.highlight(['hypotenuse_4', 'adjacent_2', 'v5', 'equals4', 'f_4', '_4', 'lb4', 'rb4', 'theta4', 'equals8', '_1_1', 'v8', 'cos_3', 'theta9', 'equals11', 'sec_1', 'v11', '_1_rad', 'sec', 'theta3']);
  //   },
  //   fromForm: 'sixSRRSecOnOne',
  //   form: 'sixSRRSecOnOne',
  // });
  // slides.push({ form: 'sixSRRSecEquals' });
  // slides.push({ form: 'sixSRRSec' });

  // /*
  // ..######...#######..########
  // .##....##.##.....##....##...
  // .##.......##.....##....##...
  // .##.......##.....##....##...
  // .##.......##.....##....##...
  // .##....##.##.....##....##...
  // ..######...#######.....##...
  // */
  // slides.push({
  //   show: 'circle1.compAngle',
  //   dissolve: { in: 'circle1.compAngle', pulse: { scale: 1.4 } },
  //   form: 'sixSRRSec',
  // });
  // slides.push({
  //   showCommon: { circle1: ['x', 'y', 'arc', 'line', 'x', 'angle', 'oppositeOne', 'oppositeOneLabel', 'cotAlt', 'cscAlt', 'compAngle', 'rightAngle5'] },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //     circle1.highlight(['cotAlt', 'cscAlt', 'oppositeOne', 'oppositeOneLabel', 'angle', 'compAngle', 'rightAngle2', 'cotAltEqn', 'cotLabelAlt', 'angle3']);
  //   },
  //   form: 'sixSRRSec',
  //   dissolve: {
  //     in: { circle1: ['cotAlt', 'cscAlt', 'oppositeOne', 'rightAngle5'] },
  //   },
  // });

  // slides.push({
  //   show: ['circle1.cotAltEqn'],
  //   fromForm: { eqn: 'sixSRRTan', 'circle1.cotAltEqn': null },
  //   form: { eqn: 'sixSRRSec', 'circle1.cotAltEqn': 'complementaryTangent' },
  // });

  // slides.push({
  //   show: ['circle1.cotAltEqn'],
  //   form: { eqn: 'sixSRRSec', 'circle1.cotAltEqn': 'cotangent' },
  // });

  // slides.push({
  //   show: ['circle1.cotAltEqn'],
  //   form: { eqn: 'sixSRRSec', 'circle1.cotAltEqn': 'cot' },
  // });

  // slides.push({
  //   showCommon: { circle1: ['x', 'y', 'arc', 'line', 'x', 'angle', 'oppositeOne', 'oppositeOneLabel', 'cotAlt', 'cscAlt', 'compAngle', 'rightAngle5', 'cotLabelAlt', 'angle3'] },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //     circle1.highlight(['cotAlt', 'cscAlt', 'oppositeOne', 'oppositeOneLabel', 'angle', 'compAngle', 'rightAngle2', 'cotAltEqn', 'cotLabelAlt', 'angle3']);
  //     eqn.highlight(['equals11', 'cot_1', 'equals9', 'cos_4', 'sin_3', 'theta10', 'theta13', 'v9', 'cot', 'theta4', 'v11', '_1_rad', 'f_5', '_5', 'lb5', 'rb5', 'theta5', 'equals5', 'adjacent_3', 'opposite_3', 'v6']);
  //   },
  //   form: { eqn: 'sixSRRSec' },
  //   dissolve: { in: { circle1: ['angle3'] }, pulse: { scale: 1.5 } },
  // });

  // slides.push({ form: 'sixSRRCotOnOne' });
  // slides.push({ form: 'sixSRRCotEquals' });
  // slides.push({ form: 'sixSRRCot' });

  // /*
  // ..######...######...######.
  // .##....##.##....##.##....##
  // .##.......##.......##......
  // .##........######..##......
  // .##.............##.##......
  // .##....##.##....##.##....##
  // ..######...######...######.
  // */
  // slides.push({
  //   showCommon: { circle1: ['x', 'y', 'arc', 'line', 'x', 'angle', 'oppositeOne', 'oppositeOneLabel', 'cotAlt', 'cscAlt', 'compAngle', 'rightAngle5', 'cotLabelAlt', 'angle3', 'cscAltEqn'] },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //     circle1.highlight(['cotAlt', 'cscAlt', 'oppositeOne', 'oppositeOneLabel', 'angle', 'compAngle', 'rightAngle2', 'cotLabelAlt', 'angle3', 'cscAltEqn']);
  //   },
  //   form: { eqn: 'sixSRRCot', 'circle1.cscAltEqn': null },
  // });

  // slides.push({ form: { eqn: 'sixSRRCot', 'circle1.cscAltEqn': 'complementarySecant' } });
  // slides.push({ form: { eqn: 'sixSRRCot', 'circle1.cscAltEqn': 'cosec' } });
  // slides.push({ form: { eqn: 'sixSRRCot', 'circle1.cscAltEqn': 'csc' } });

  // slides.push({
  //   showCommon: { circle1: ['x', 'y', 'arc', 'line', 'x', 'angle', 'oppositeOne', 'oppositeOneLabel', 'cotAlt', 'cscAlt', 'compAngle', 'rightAngle5', 'cotLabelAlt', 'angle3', 'cscLabelAlt'] },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //     circle1.highlight(['cotAlt', 'cscAlt', 'oppositeOne', 'oppositeOneLabel', 'angle', 'compAngle', 'rightAngle2', 'cotLabelAlt', 'angle3', 'cscLabelAlt']);
  //     eqn.highlight(eqn.getPhraseElements(['hypOnOppCsc', 'hypOnOppCscEquals', 'hypOnOppCscOnOne']));
  //   },
  //   form: 'sixSRRCot',
  // });
  // slides.push({ form: 'sixSRRCscOnOne' });
  // slides.push({ form: 'sixSRRCscEquals' });
  // slides.push({ form: 'sixSRRCsc' });
  // slides.push({
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //     circle1.highlight(['cotAlt', 'cscAlt', 'oppositeOne', 'oppositeOneLabel', 'angle', 'compAngle', 'rightAngle2', 'cotLabelAlt', 'angle3', 'cscLabelAlt']);
  //   },
  //   form: 'sixSRRCsc',
  // });

  // /*
  // ....###....##.......##......
  // ...##.##...##.......##......
  // ..##...##..##.......##......
  // .##.....##.##.......##......
  // .#########.##.......##......
  // .##.....##.##.......##......
  // .##.....##.########.########
  // */

  // slides.push({
  //   // scenarioCommon: ['default', 'eqnTriValues', 'circleQuart'],
  //   showCommon: { circle1: ['x', 'y', 'arc', 'line', 'x', 'angle', 'cotAlt', 'cscAlt', 'cscLabelAlt', 'cotLabelAlt', 'secLabelAlt', 'secAlt', 'sin', 'sinLabel', 'cos', 'cosLabel', 'rightAngle1', 'tanAlt', 'tanLabelAlt'] },
  //   enterStateCommon: () => {
  //     figure.fnMap.exec('circSetAngle', initialAngle);
  //   },
  //   form: 'sixSRRCsc',
  // });

  // slides.push({
  //   form: 'sixSRRWithValues',
  // });

  // slides.push({
  //   showCommon: { circle1: ['x', 'y', 'arc', 'line', 'x', 'angle', 'cot', 'csc', 'cscLabel', 'cotLabel', 'secLabel', 'sec', 'sin', 'sinLabel', 'cos', 'cosLabel', 'rightAngle1', 'tan', 'tanLabel', 'lineLabel', 'xSec'] },
  //   form: 'sixSRRWithValues',
  // });

  // // slides.push({
  // //   showCommon: [],
  // //   form: 'summaryTable',
  // // });

  // slides.push({
  //   showCommon: ['circleLines'],
  //   form: null,
  // });

  // slides.push({
  //   showCommon: [{
  //     circle1: ['x', 'y', 'arc', 'line', 'x', 'angle', 'cotAlt', '']
  //   }],
  //   form: { eqn2: '0' },
  // });

  /*
  .########..########..######..########.########
  .##.....##.##.......##....##.##..........##...
  .##.....##.##.......##.......##..........##...
  .########..######....######..######......##...
  .##...##...##.............##.##..........##...
  .##....##..##.......##....##.##..........##...
  .##.....##.########..######..########....##...
  */
  // Slide 95
  const eqn2 = figure.getElement('eqn2');
  slides.push({
    clear: true,
    scenarioCommon: ['circleLines'],
    showCommon: { circle1: ['circle'] },
  });

  slides.push({
    showCommon: { circle1: ['circle', 'chord'] },
    dissolve: { in: 'circle1.chord' },
  });
  slides.push({ dissolve: { in: 'chord' } });
  slides.push({
    showCommon: ['chord', { circle1: ['circle', 'chord', 'bow'] }],
    dissolve: { in: 'circle1.bow' },
  });
  slides.push({
    showCommon: { circle1: ['circle', 'chord', 'tangent'] },
    dissolve: { out: ['chord', 'circle1.bow'], in: 'circle1.tangent' },
  });
  slides.push({ dissolve: { in: 'tangent' } });
  slides.push({
    showCommon: ['tangent', { circle1: ['circle', 'chord', 'tangent', 'radius', 'rightAngle'] }],
    dissolve: { in: { circle1: ['radius', 'rightAngle', 'center'] } },
  });
  slides.push({
    showCommon: ['tangent', { circle1: ['circle', 'chord', 'tangent', 'radius', 'rightAngle', 'center'] }],
    dissolve: {
      out: ['tangent', 'circle1.radius', 'circle1.rightAngle', 'circle1.center'],
      in: ['circle1.secant'],
    },
  });
  slides.push({
    showCommon: { circle1: ['circle', 'chord', 'tangent', 'secant'] },
    dissolve: { in: ['secant'] },
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
  slides.push({
    showCommon: { circle1: ['circle'] },
    transition: (done) => {
      circle1.animations.new()
        .inParallel([
          circle1.animations.scenario({ target: 'circleSmall', duration: 2 }),
          circle1._chord.animations.dissolveOut(0.4),
          circle1._tangent.animations.dissolveOut(0.4),
          circle1._secant.animations.dissolveOut(0.4),
        ])
        .inParallel([
          circle1._adjacentOneLabel.animations.dissolveIn(0.4),
          circle1._adjacentOne.animations.dissolveIn(0.4),
          circle1._center.animations.dissolveIn(0.4),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circle1.setScenario('circleSmall');
      circle1.show(['adjacentOne', 'adjacentOneLabel', 'center']);
    },
  });
  slides.push({
    clear: true,
    showCommon: { circle1: ['rotator', 'line', 'angle', 'circle', 'center', 'adjacentOne', 'adjacentOneLabel'] },
    scenarioCommon: ['circleSmall'],
    dissolve: { in: { circle1: ['line', 'angle'] } },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', initialAngle);
      figure.fnMap.exec('circAltColorsToSides');
    },
  });

  slides.push({
    showCommon: { circle1: ['rotator', 'angle', 'circle', 'tanAlt', 'secAlt', 'rightAngle4', 'adjacentOne', 'adjacentOneLabel', 'arc'] },
    dissolve: {
      in: { circle1: ['tanAlt', 'secAlt', 'rightAngle4'] },
      out: { circle1: ['center', 'line'] },
      simultaneous: true,
    },
  });

  slides.push({
    transition: (done) => {
      circle1.animations.new()
        .inParallel([
          circle1.animations.scenario({ target: 'circleQuartMid', duration: 2 }),
          circle1._y.animations.dissolveIn(0.4),
          circle1._circle.animations.dissolveOut(0.4),
        ])
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      circle1.hide(['circle']);
      circle1.setScenario('circleQuartMid');
    },
  });

  slides.push({
    scenarioCommon: ['default', 'eqnTri', 'circleQuartMid'],
    showCommon: { circle1: ['rotator', 'angle', 'arc', 'tanAlt', 'secAlt', 'rightAngle4', 'adjacentOne', 'adjacentOneLabel', 'y', 'tanLabelAlt'] },
    dissolve: { in: 'circle1.tanLabelAlt' },
  });

  slides.push({
    showCommon: { circle1: ['rotator', 'angle', 'arc', 'tanAlt', 'secAlt', 'rightAngle4', 'adjacentOne', 'adjacentOneLabel', 'y', 'tanLabelAlt', 'secLabelAlt'] },
    dissolve: { in: 'circle1.secLabelAlt' },
    form: { eqn2: null },
  });

  slides.push({ form: { eqn2: '00' } });
  slides.push({ form: { eqn2: '01' } });
  slides.push({ form: { eqn2: '02' } });
  slides.push({ form: { eqn2: '03' } });
  slides.push({ form: { eqn2: '04' } });
  // slides.push({ form: { eqn2: '05' } });
  // slides.push({ form: { eqn2: '06' } });
  // slides.push({ form: { eqn2: '07' } });
  slides.push({ form: { eqn2: '08' } });

  /*
  ..######..####.##....##.########.....######...#######...######.
  .##....##..##..###...##.##..........##....##.##.....##.##....##
  .##........##..####..##.##..........##.......##.....##.##......
  ..######...##..##.##.##.######......##.......##.....##..######.
  .......##..##..##..####.##..........##.......##.....##.......##
  .##....##..##..##...###.##..........##....##.##.....##.##....##
  ..######..####.##....##.########.....######...#######...######.
  */
  slides.push({
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', initialAngle);
      figure.fnMap.exec('circAltColorsToSides');
    },
    showCommon: { circle1: ['x', 'rotator', 'line', 'arc', 'y', 'lineLabel', 'angle', 'sin', 'cos', 'rightAngle1', 'lineLabel', 'bowStringLabel'] },
    dissolve: {
      in: { circle1: ['sin', 'rightAngle1', 'lineLabel', 'line'] },
      out: { circle1: ['secAlt', 'rightAngle4', 'adjacentOne', 'adjacentOneLabel', 'tanAlt'] },
      simultaneous: true,
    },
    fromForm: { eqn2: '08', 'circle1.bowStringLabel': null },
    form: { eqn2: '08', 'circle1.bowStringLabel': null },
  });

  slides.push({ form: { eqn2: '08', 'circle1.bowStringLabel': 'half' } });
  slides.push({ form: { eqn2: '08', 'circle1.bowStringLabel': 'sinesin' } });
  slides.push({ form: { eqn2: '08', 'circle1.bowStringLabel': 'sin' } });
  slides.push({ dissolve: { in: 'circle1.compAngle2' } });
  slides.push({
    showCommon: { circle1: ['x', 'rotator', 'arc', 'y', 'lineLabel', 'angle', 'sin', 'cos', 'rightAngle1', 'lineLabel', 'sinLabel', 'compAngle2', 'cosLabelEqn', 'line'] },
    fromForm: { eqn2: '08', 'circle1.cosLabelEqn': null },
    form: { eqn2: '08', 'circle1.cosLabelEqn': 'sine' },
  });
  slides.push({ form: { eqn2: '08', 'circle1.cosLabelEqn': 'compSine' } });
  slides.push({ form: { eqn2: '08', 'circle1.cosLabelEqn': 'cosine' } });
  slides.push({ form: { eqn2: '08', 'circle1.cosLabelEqn': 'cos' } });
  slides.push({ dissolve: { out: 'circle1.compAngle2' } });

  slides.push({
    showCommon: { circle1: ['x', 'rotator', 'arc', 'y', 'lineLabel', 'angle', 'sin', 'cos', 'rightAngle1', 'lineLabel', 'sinLabel', 'cosLabel', 'line'] },
    transition: (done) => {
      circle1.animations.new()
        .scenario({ target: 'circleQuart', duration: 1.5 })
        .then(eqn2.animations.goToForm({ target: '10', animate: 'move' }))
        // .then(eqn2.animations.pulse({ elements: eqn.getPhraseElements('sinOne'), duration: 1 }))
        .whenFinished(done)
        .start();
    },
    form: { eqn2: '10' },
  });
  slides.push({ scenarioCommon: ['circleQuart'], form: { eqn2: '11' } });
  // slides.push({ form: { eqn2: '12' } });
  // slides.push({ form: { eqn2: '13' } });
  // slides.push({ form: { eqn2: '14' } });
  // slides.push({ form: { eqn2: '15' } });
  // slides.push({ form: { eqn2: '16' } });
  slides.push({ form: { eqn2: '17' } });

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
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', initialAngle);
      figure.fnMap.exec('circAltColorsToSides');
    },
    showCommon: { circle1: ['x', 'rotator', 'arc', 'y', 'angle', 'cotAlt', 'rightAngle5', 'oppositeOneLabel', 'oppositeOne', 'cscAlt', 'compAngle', 'cotAltEqn'] },
    dissolve: {
      in: { circle1: ['cotAlt', 'rightAngle5', 'oppositeOneLabel', 'oppositeOne', 'cscAlt', 'compAngle'] },
      out: { circle1: ['sin', 'rightAngle1', 'cos', 'lineLabel', 'sineLabel', 'cosLabel', 'line'] },
      simultaneous: true,
    },
    fromForm: { eqn2: '17', 'circle1.cotAltEqn': null },
    form: { eqn2: '17', 'circle1.cotAltEqn': null },
  });

  slides.push({ form: { eqn2: '17', 'circle1.cotAltEqn': 'complementaryTangent' } });
  slides.push({ form: { eqn2: '17', 'circle1.cotAltEqn': 'cotangent' } });
  slides.push({ form: { eqn2: '17', 'circle1.cotAltEqn': 'cot' } });

  slides.push({
    showCommon: { circle1: ['x', 'rotator', 'arc', 'y', 'angle', 'cotAlt', 'rightAngle5', 'oppositeOneLabel', 'oppositeOne', 'cscAlt', 'compAngle', 'cotLabelAlt', 'cscAltEqn'] },
    fromForm: { eqn2: '17', 'circle1.cscAltEqn': null },
    form: { eqn2: '17', 'circle1.cscAltEqn': null },
  });

  slides.push({ form: { eqn2: '17', 'circle1.cscAltEqn': 'complementarySecant' } });
  slides.push({ form: { eqn2: '17', 'circle1.cscAltEqn': 'cosec' } });
  slides.push({ form: { eqn2: '17', 'circle1.cscAltEqn': 'csc' } });

  slides.push({ dissolve: { in: 'circle1.angle3', pulse: { scale: 1.5 } } });
  slides.push({
    showCommon: { circle1: ['x', 'rotator', 'arc', 'y', 'angle', 'cotAlt', 'rightAngle5', 'oppositeOneLabel', 'oppositeOne', 'cscAlt', 'compAngle', 'cotLabelAlt', 'cscLabelAlt', 'angle3'] },
    fromForm: { eqn2: '17', 'circle1.cscAltEqn': null },
    form: { eqn2: '27' },
  });
  // slides.push({ form: { eqn2: '21' } });
  // slides.push({ form: { eqn2: '22' } });
  // slides.push({ form: { eqn2: '23' } });
  // slides.push({ form: { eqn2: '24' } });
  // slides.push({ form: { eqn2: '25' } });
  // slides.push({ form: { eqn2: '26' } });
  // slides.push({ form: { eqn2: '27' } });
  slides.push({ form: { eqn2: 'summaryStrike' } });
  slides.push({ form: { eqn2: 'summary' } });
  // slides.push({ form: { eqn2: 'summaryTheta' } });


  slides.push({
    showCommon: { circle1: ['x', 'y', 'arc', 'rotator', 'x', 'angle', 'cotAlt', 'cscAlt', 'cscLabelAlt', 'cotLabelAlt', 'secLabelAlt', 'secAlt', 'sin', 'sinLabel', 'cos', 'cosLabel', 'rightAngle1', 'tanAlt', 'tanLabelAlt'] },
    enterStateCommon: () => {
      figure.fnMap.exec('circSetAngle', initialAngle);
      figure.fnMap.exec('circAltColorsReset');
      figure.fnMap.exec('eqnColors');
    },
    form: { eqn2: 'values' },
    leaveStateCommon: () => {
      figure.fnMap.exec('eqnColorsReset');
    }
  });


  // slides.push({ form: { eqn2: 'noRatios' } });
  // slides.push({ form: { eqn2: 'values' } });

  slides.push({
    showCommon: { circle1: ['x', 'y', 'arc', 'rotator', 'line', 'x', 'angle', 'cot', 'csc', 'cscLabel', 'cotLabel', 'secLabel', 'sec', 'sin', 'sinLabel', 'cos', 'cosLabel', 'rightAngle1', 'tan', 'tanLabel', 'lineLabel', 'xSec'] },
    form: { eqn2: 'values' },
  });

  slides.push({
    clear: true,
    scenario: 'small',
    show: { circ: ['circle', 'sin', 'cos', 'rotator', 'sec', 'tan', 'theta', 'tanLabel', 'sinLabel', 'cosLabel', 'secLabel', 'cot', 'cotLabel', 'csc', 'cscLabel', 'rightSin', 'rightTan', 'rightCot'] },
    form: null,
    fromForm: null,
  });


  nav.loadSlides(slides);
  nav.goToSlide(-1);
}
makeSlides();
