/* eslint-disable camelcase */
/* global colSin, colCos, colCot, colTan, colSec, colCsc, colTheta,
   figure, colOpp, colHyp, colAdj, colText */
// eslint-disable-next-line
function makeEquation() {
  // Helper function to make a 'container' equation element
  const cont = (content, width = 0.6, xAlign = 'center') => ({
    container: { content, width, xAlign },
  });

  // Helper function to make a 'fraction' within a 'container' of fixed width
  function frac(
    numerator, symbol, denominator, nSpace = 0.03, dSpace = 0.03, width, overhang = 0.03,
  ) {
    return cont({
      frac: {
        numerator,
        symbol,
        denominator,
        numeratorSpace: nSpace,
        denominatorSpace: dSpace,
        scale: 0.95,
        overhang,
      },
    }, width, 'right');
  }

  // Helper function to make a 'fraction' equation element with numerator
  // and denominator of fixed width
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

  // Helper function to make a 'lines' equation element
  const lin = (content, baselineSpace = 0.5) => ({
    lines: { content, baselineSpace, justify: 'left' },
  });

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
        cotTheta: ['cot', ' ', 'theta4'],
        secTheta: ['sec', ' ', 'theta5'],
        cscTheta: ['csc', ' ', 'theta6'],
        f1: [{ sub: ['f_1', '_1'] }, { brac: ['lb1', 'theta1', 'rb1'] }],
        f2: [{ sub: ['f_2', '_2'] }, { brac: ['lb2', 'theta2', 'rb2'] }],
        f3: [{ sub: ['f_3', '_3'] }, { brac: ['lb3', 'theta3', 'rb3'] }],
        f4: [{ sub: ['f_4', '_4'] }, { brac: ['lb4', 'theta4', 'rb4'] }],
        f5: [{ sub: ['f_5', '_5'] }, { brac: ['lb5', 'theta5', 'rb5'] }],
        f6: [{ sub: ['f_6', '_6'] }, { brac: ['lb6', 'theta6', 'rb6'] }],
        c1: cont(lin(['oppHyp', 'adjHyp', 'oppAdj', 'adjOpp', 'hypAdj', 'hypOpp']), 0.6),
        c2: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        trig: lin(['sinTheta', 'cosTheta', 'tanTheta', 'cotTheta', 'secTheta', 'cscTheta']),
        values: lin(['val1', 'val2', 'val3', 'val4', 'val5', 'val6']),
        functions: lin(['f1', 'f2', 'f3', 'f4', 'f5', 'f6']),
        final1: lin([
          ['oppHyp', '  ', 'eq1', '  ', 'sinTheta'],
          ['oppAdj', '  ', 'eq3', '  ', 'tanTheta'],
          ['hypAdj', '  ', 'eq5', '  ', 'secTheta'],
        ], 0.6),
        final2: lin([
          ['adjHyp', '  ', 'eq2', '  ', 'cosTheta'],
          ['adjOpp', '  ', 'eq4', '  ', 'cotTheta'],
          ['hypOpp', '  ', 'eq6', '  ', 'cscTheta'],
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

  // Add function to function map that dissolves equation in to its values form
  figure.fnMap.global.add('eqnInToValues', () => {
    figure.elements._eqn.showForm('values');
    figure.elements._eqn.animations.new().dissolveIn().start();
    figure.fnMap.exec('triSetup', [2, 1.453], 'values', true);
  });
}

