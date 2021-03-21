/* eslint-disable camelcase */
/* global colSin, colCos, colCot, colTan, colSec, colCsc, colTheta,
   figure, colOpp, colHyp, colAdj, colRad */
// eslint-disable-next-line
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

  const s = (content, strikeIndex) => ({
    strike: {
      content, symbol: `s${strikeIndex}`, inSize: false,
    },
  });

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
        v7: { symbol: 'vinculum' },
        v8: { symbol: 'vinculum' },
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
        _1_1: { color: colRad },
        _1_2: { color: colRad },
        s1: { symbol: 'strike', style: 'forward', lineWidth: thin },
        s2: { symbol: 'strike', style: 'forward', lineWidth: thin },
        // lb1: { symbol: 'bracket', side: 'left' },
        // lb2: { symbol: 'bracket', side: 'left' },
        // rb1: { symbol: 'bracket', side: 'right' },
        // rb2: { symbol: 'bracket', side: 'right' },
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
        cscTheta: ['csc', ' ', 'theta5'],
        cotTheta: ['cot', ' ', 'theta6'],
        c1: cont(lin(['oppHyp', 'adjHyp', 'oppAdj', 'adjOpp', 'hypAdj', 'hypOpp']), 0.6),
        c2: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        c2_2: cont(lin(['eq1', 'eq2', '', '', '', '']), 0.3),
        c1_sinCos: cont(lin(['oppHyp', 'adjHyp'])),
        c2_sinCos: cont(lin(['eq1', 'eq2']), 0.3),
        c2_sin: cont(lin(['eq1']), 0.3),
        xyOnOne: lin([frac('y', 'v7', '_1_1', 0.03, 0.03, 0.1), frac('x', 'v8', '_1_2', 0.03, 0.03, 0.1)]),
        xyOnOneStk: lin([frac('y', 'v7', s('_1_1', 1), 0.03, 0.03, 0.1), frac('x', 'v8', s('_1_2', 2), 0.03, 0.03, 0.1)]),
        sinOnOne: frac('sinTheta', 'v7', '_1_1', 0.03, 0.03, 0.3),
        sinOnOneStk: frac('sinTheta', 'v7', s('_1_1', 1), 0.03, 0.03, 0.3),
        // sin: lin(['sinTheta']),
        xy: lin(['y', 'x']),
        trig: lin(['sinTheta', 'cosTheta', 'tanTheta', 'cotTheta', 'secTheta', 'cscTheta']),
        final1: lin([
          ['oppHyp', '  ', 'eq1', '  ', 'sinTheta'],
          ['oppAdj', '  ', 'eq3', '  ', 'tanTheta'],
          ['hypAdj', '  ', 'eq5', '  ', 'secTheta'],
        ], 0.6),
        final2: lin([
          ['adjHyp', '  ', 'eq2', '  ', 'cosTheta'],
          ['adjOpp', '  ', 'eq6', '  ', 'cotTheta'],
          ['hypOpp', '  ', 'eq4', '  ', 'cscTheta'],
        ], 0.6),
      },
      forms: {
        ratios: ['c1'],
        trig: ['c1', 'c2', 'trig'],
        final: { scale: [['final1', cont('', 0.8), 'final2'], 1.1] },
        sinCos: ['c1_sinCos'],
        xyOnOne: ['c1_sinCos', 'c2_sinCos', 'xyOnOne'],
        xyOnOneStk: ['c1_sinCos', 'c2_sinCos', 'xyOnOneStk'],
        xy: ['c1_sinCos', 'c2_sinCos', 'xy'],
        oppHyp: 'oppHyp',
        sinOnOne: ['oppHyp', cont('eq1', 0.3), 'sinOnOne'],
        sinOnOneStk: ['oppHyp', cont('eq1', 0.3), 'sinOnOneStk'],
        sin: ['oppHyp', cont('eq1', 0.3), 'sinTheta'],
      },
    },
    mods: {
      scenarios: {
        eqnLeft: { position: [-2.8, 1.2], scale: 1 },
        eqnCenterLeft: { position: [-2, 0.2], scale: 1.2 },
        eqnCenterLeftSingle: { position: [-2, 0], scale: 1.2 },
        center: { position: [-1.5, 0.3], scale: 1 },
      },
    },
  });

  const add = (name, fn) => figure.fnMap.global.add(name, fn);

  const sPulse = (element, xAlign = 'center', yAlign = 'middle') => figure.elements._eqn.pulse({
    elements: [element], xAlign, yAlign, scale: 1.5, duration: 1.5,
  });
  add('eqnPulseSin', () => sPulse('sin', 'right', 'middle'));
  add('eqnPulseCos', () => sPulse('cos', 'right', 'middle'));
  add('eqnPulseTan', () => sPulse('tan', 'right', 'middle'));
  add('eqnPulseCsc', () => sPulse('csc', 'right', 'middle'));
  add('eqnPulseSec', () => sPulse('sec', 'right', 'middle'));
  add('eqnPulseCot', () => sPulse('cot', 'right', 'middle'));
}

