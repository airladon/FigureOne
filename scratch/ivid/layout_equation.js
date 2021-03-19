/* eslint-disable camelcase */
/* global colSin, colCos, colCot, colTan, colSec, colCsc, colTheta,
   figure, colOpp, colHyp, colAdj, colText */

function makeEquation() {
  const cont = (content, width = 0.6, xAlign = 'center') => ({
    container: { content, width, xAlign },
  });
  function frac(
    numerator, symbol, denominator, nSpace = 0.03, dSpace = 0.03, width, overhang = 0.03,
  ) {
    return cont({
      frac: {
        numerator, // : cont(numerator, width),
        symbol,
        denominator, // : cont(denominator, width),
        numeratorSpace: nSpace,
        denominatorSpace: dSpace,
        scale: 0.95,
        overhang,
      },
    }, width, 'right');
  }

  function wFrac(
    numerator, symbol, denominator, width = 0.2,
  ) {
    return {
      frac: {
        numerator: cont(numerator, width),
        symbol,
        denominator: cont(denominator, width),
        scale: 0.95,
      },
    };
  }

  const lin = (content, baselineSpace = 0.5) => ({
    lines: { content, baselineSpace, justify: 'left' },
  });
  // const w1 = 0.28;

  // const addFn = (name, elements, centerOn, xAlign, yAlign = 'middle') => {
  //   figure.fnMap.global.add(name, () => {
  //     figure.getElement('eqn').pulse({
  //       elements, centerOn, xAlign, yAlign, scale: 2.5,
  //     });
  //   });
  // };
  // addFn('eqnPulseTan', ['tan', 'theta9'], 'tan', 'left', 'middle');
  // addFn('eqnPulseCot', ['cot', 'theta12'], 'cot', 'left', 'middle');
  // addFn('eqnPulseSec', ['sec', 'theta11'], 'sec', 'left', 'middle');
  // addFn('eqnPulseCsc', ['csc', 'theta10'], 'csc', 'left', 'middle');
  // addFn('eqnPulseF1', ['f_1', '_1', 'lb1', 'theta1', 'rb1'], 'f_1', 'left');
  // addFn('eqnPulseF2', ['f_2', '_2', 'lb2', 'theta2', 'rb2'], 'f_2', 'left');
  // addFn('eqnPulseF3', ['f_3', '_3', 'lb3', 'theta3', 'rb3'], 'f_3', 'left');
  // addFn('eqnPulseF4', ['f_4', '_4', 'lb4', 'theta4', 'rb4'], 'f_4', 'left');
  // addFn('eqnPulseF5', ['f_5', '_5', 'lb5', 'theta5', 'rb5'], 'f_5', 'left');
  // addFn('eqnPulseF6', ['f_6', '_6', 'lb6', 'theta6', 'rb6'], 'f_6', 'left');
  // addFn('eqnPulseSin', ['sin_1', 'theta1'], 'sin_1', 'left', 'middle');


  figure.add({
    name: 'eqn',
    method: 'equation',
    options: {
      elements: {
        eq1: '=',
        eq2: '=',
        eq3: '=',
        eq4: '=',
        eq5: '=',
        eq6: '=',
        v1: { symbol: 'vinculum' },
        v2: { symbol: 'vinculum' },
        v3: { symbol: 'vinculum' },
        v4: { symbol: 'vinculum' },
        v5: { symbol: 'vinculum' },
        v6: { symbol: 'vinculum' },
        sin: { style: 'normal', color: colSin },
        cos: { style: 'normal', color: colCos },
        tan: { style: 'normal', color: colTan },
        cot: { style: 'normal', color: colCot },
        sec: { style: 'normal', color: colSec },
        csc: { style: 'normal', color: colCsc },
        opp_1: { text: 'opposite', color: colOpp, size: 0.2 },
        opp_2: { text: 'opposite', color: colOpp, size: 0.2 },
        opp_3: { text: 'opposite', color: colOpp, size: 0.2 },
        opp_4: { text: 'opposite', color: colOpp, size: 0.2 },
        adj_1: { text: 'adjacent', color: colAdj, size: 0.2 },
        adj_2: { text: 'adjacent', color: colAdj, size: 0.2 },
        adj_3: { text: 'adjacent', color: colAdj, size: 0.2 },
        adj_4: { text: 'adjacent', color: colAdj, size: 0.2 },
        hyp_1: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_2: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_3: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_4: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        theta1: { text: '\u03b8', color: colTheta },
        theta2: { text: '\u03b8', color: colTheta },
        theta3: { text: '\u03b8', color: colTheta },
        theta4: { text: '\u03b8', color: colTheta },
        theta5: { text: '\u03b8', color: colTheta },
        theta6: { text: '\u03b8', color: colTheta },
        val1: { text: '0.0000', color: colText },
        val2: { text: '0.0000', color: colText },
        val3: { text: '0.0000', color: colText },
        val4: { text: '0.0000', color: colText },
        val5: { text: '0.0000', color: colText },
        val6: { text: '0.0000', color: colText },
        lb1: { symbol: 'bracket', side: 'left' },
        lb2: { symbol: 'bracket', side: 'left' },
        lb3: { symbol: 'bracket', side: 'left' },
        lb4: { symbol: 'bracket', side: 'left' },
        lb5: { symbol: 'bracket', side: 'left' },
        lb6: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        rb2: { symbol: 'bracket', side: 'right' },
        rb3: { symbol: 'bracket', side: 'right' },
        rb4: { symbol: 'bracket', side: 'right' },
        rb5: { symbol: 'bracket', side: 'right' },
        rb6: { symbol: 'bracket', side: 'right' },
        A: { color: colHyp },
        B: { color: colOpp },
        C: { color: colAdj },
        Adash: { text: 'A\'', color: colHyp },
        Bdash: { text: 'B\'', color: colOpp },
        Cdash: { text: 'C\'', color: colAdj },
      },
      phrases: {
        oppHyp: frac('opp_1', 'v1', 'hyp_1', 0.01, 0.03, 0.65),
        adjHyp: frac('adj_1', 'v2', 'hyp_2', 0.01, 0.03, 0.65),
        oppAdj: frac('opp_2', 'v3', 'adj_2', 0.01, 0.03, 0.65),
        hypOpp: frac('hyp_3', 'v4', 'opp_3', 0.01, 0.03, 0.65),
        hypAdj: frac('hyp_4', 'v5', 'adj_3', 0.01, 0.03, 0.65),
        adjOpp: frac('adj_4', 'v6', 'opp_4', 0.01, 0.03, 0.65),
        sinTheta: ['sin', ' ', 'theta1'],
        cosTheta: ['cos', ' ', 'theta2'],
        tanTheta: ['tan', ' ', 'theta3'],
        secTheta: ['sec', ' ', 'theta4'],
        cotTheta: ['cot', ' ', 'theta5'],
        cscTheta: ['csc', ' ', 'theta6'],
        f1: [{ sub: ['f_1', '_1'] }, { brac: ['lb1', 'theta1', 'rb1'] }],
        f2: [{ sub: ['f_2', '_2'] }, { brac: ['lb2', 'theta2', 'rb2'] }],
        f3: [{ sub: ['f_3', '_3'] }, { brac: ['lb3', 'theta3', 'rb3'] }],
        f4: [{ sub: ['f_4', '_4'] }, { brac: ['lb4', 'theta6', 'rb4'] }],
        f5: [{ sub: ['f_5', '_5'] }, { brac: ['lb5', 'theta4', 'rb5'] }],
        f6: [{ sub: ['f_6', '_6'] }, { brac: ['lb6', 'theta5', 'rb6'] }],
        c1: cont(lin(['oppHyp', 'adjHyp', 'oppAdj', 'hypOpp', 'hypAdj', 'adjOpp']), 0.6),
        c2: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        trig: lin(['sinTheta', 'cosTheta', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        values: lin(['val1', 'val2', 'val3', 'val4', 'val5', 'val6']),
        functions: lin(['f1', 'f2', 'f3', 'f4', 'f5', 'f6']),
        final1: lin([
          ['oppHyp', '  ', 'eq1', '  ', 'sinTheta'],
          ['oppAdj', '  ', 'eq3', '  ', 'tanTheta'],
          ['hypAdj', '  ', 'eq5', '  ', 'secTheta'],
        ], 0.6),
        final2: lin([
          ['adjHyp', '  ', 'eq2', '  ', 'cosTheta'],
          ['hypOpp', '  ', 'eq4', '  ', 'cscTheta'],
          ['adjOpp', '  ', 'eq6', '  ', 'cotTheta'],
        ], 0.6),
      },
      forms: {
        ratios: ['c1'],
        values: ['c1', 'c2', 'values'],
        functions: ['c1', 'c2', 'functions'],
        trig: ['c1', 'c2', 'trig'],
        final: { scale: [['final1', cont('', 0.8), 'final2'], 1.1] },
        AonB: { scale: [wFrac('Adash', 'v2', 'Bdash'), 1.8] },
        AonBEq: {
          scale: [[
            wFrac('Adash', 'v2', 'Bdash'),
            '  ', 'eq1', '  ',
            wFrac('A', 'v1', 'B'),
          ], 1.8],
        },
        AonCEq: {
          scale: [[
            wFrac('Adash', 'v2', 'Cdash'),
            '  ', 'eq1', '  ',
            wFrac('A', 'v1', 'C'),
          ], 1.8],
        },
        // BonC: {
        //   scale: [[
        //     wFrac('Bdash', 'v2', 'Cdash'),
        //     '  ', 'eq1', '  ',
        //     wFrac('B', 'v1', 'C'),
        //   ], 1.8],
        // },
      },
      position: [-2.8, 1.2],
    },
    mods: {
      scenarios: {
        oneTri: { position: [-2.8, 1.2] },
        twoTri: { position: [-0.3, 0.7] },
        center: { position: [-1.5, 0.3] },
      },
    },
  });

  const add = (name, fn) => figure.fnMap.global.add(name, fn);
  add('eqnInToValues', () => {
    figure.elements._eqn.showForm('values');
    figure.elements._eqn.animations.new().dissolveIn().start();
    figure.fnMap.exec('triSetup', [2, 1.453], 'values', true);
  });

  const sPulse = (element, xAlign = 'center', yAlign = 'middle') => eqn.pulse({
    elements: [element], xAlign, yAlign, scale: 1.5, duration: 1.5,
  });
  add('eqnPulseSin', () => sPulse('sin_1', 'right', 'middle'));
  add('eqnPulseCos', () => sPulse('cos_1', 'right', 'middle'));
  add('eqnPulseTan', () => sPulse('tan_1', 'right', 'middle'));
  add('eqnPulseCsc', () => sPulse('csc_1', 'right', 'middle'));
  add('eqnPulseSec', () => sPulse('sec_1', 'right', 'middle'));
  add('eqnPulseCot', () => sPulse('cot_1', 'right', 'middle'));
}

