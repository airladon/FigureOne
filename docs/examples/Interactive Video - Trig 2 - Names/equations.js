/* eslint-disable camelcase */
/* global colSin, colCos, colCot, colTan, colSec, colCsc, colTheta,
   figure, colRad, colThetaComp, thin, colText */

// eslint-disable-next-line
function makeEquation() {
  // Helper function that makes a container of default width with center
  // alignment
  const cont = (content, width = 0.6, xAlign = 'center') => ({
    container: { content, width, xAlign },
  });

  // Helper function that makes a fraction with specificied numerator
  // and denominator space to vinculum, within a container of some width
  function frac(
    numerator, symbol, denominator, nSpace = 0.03, dSpace = 0.03, width = 0.6, overhang = 0.03,
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

  // Helper function to create an equation line
  const ln = (...content) => ({
    lines: {
      content: [...content],
      justify: 'left',
      xAlign: 'left',
      yAlign: 'baseline',
      baselineSpace: 0.3,
    },
  });

  // Helper function to create an equation strike
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
    make: 'equation',
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
        sin_2: { style: 'normal', color: colSin },
        cos: { style: 'normal', color: colCos },
        tan: { style: 'normal', color: colTan },
        tan_2: { style: 'normal', color: colTan },
        cot: { style: 'normal', color: colCot },
        sec: { style: 'normal', color: colSec },
        sec_2: { style: 'normal', color: colSec },
        csc: { style: 'normal', color: colCsc },
        opp_1: { text: 'opposite', color: colText, size: 0.2 },
        opp_2: { text: 'opposite', color: colText, size: 0.2 },
        opp_3: { text: 'opposite', color: colText, size: 0.2 },
        opp_4: { text: 'opposite', color: colText, size: 0.2 },
        adj_1: { text: 'adjacent', color: colText, size: 0.2 },
        adj_2: { text: 'adjacent', color: colText, size: 0.2 },
        adj_3: { text: 'adjacent', color: colText, size: 0.2 },
        adj_4: { text: 'adjacent', color: colText, size: 0.2 },
        hyp_1: { text: 'hypotenuse', color: colText, size: 0.2 },
        hyp_2: { text: 'hypotenuse', color: colText, size: 0.2 },
        hyp_3: { text: 'hypotenuse', color: colText, size: 0.2 },
        hyp_4: { text: 'hypotenuse', color: colText, size: 0.2 },
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
        comp_1: { text: '\u00b0\u2212\u03b8', color: colThetaComp, style: 'italic' },
        _90_1: { color: colThetaComp },
        comp_2: { text: '\u00b0\u2212\u03b8', color: colThetaComp, style: 'italic' },
        _90_2: { color: colThetaComp },
        comp_3: { text: '\u00b0\u2212\u03b8', color: colThetaComp, style: 'italic' },
        _90_3: { color: colThetaComp },
        lb1: { symbol: 'bracket', side: 'left' },
        lb2: { symbol: 'bracket', side: 'left' },
        lb3: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        rb2: { symbol: 'bracket', side: 'right' },
        rb3: { symbol: 'bracket', side: 'right' },
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
        sinComp: ['sin_2', { brac: ['lb1', ['_90_1', 'comp_1'], 'rb1'] }],
        tanComp: ['tan_2', { brac: ['lb2', ['_90_2', 'comp_2'], 'rb2'] }],
        secComp: ['sec_2', { brac: ['lb3', ['_90_3', 'comp_3'], 'rb3'] }],
        c1: cont(lin(['oppHyp', 'adjHyp', 'oppAdj', 'adjOpp', 'hypAdj', 'hypOpp']), 0.6),
        c2: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        // c2_2: cont(lin(['eq1', 'eq2', '', '', '', '']), 0.3),
        c1_sinCos: cont(lin(['oppHyp', 'adjHyp'])),
        c2_2: cont(lin(['eq1', 'eq2']), 0.3),
        c2_sin: cont(lin(['eq1']), 0.3),
        xyOnOne: lin([frac('y', 'v7', '_1_1', 0.03, 0.03, 0.1), frac('x', 'v8', '_1_2', 0.03, 0.03, 0.1)]),
        xyOnOneStk: lin([frac('y', 'v7', s('_1_1', 1), 0.03, 0.03, 0.1), frac('x', 'v8', s('_1_2', 2), 0.03, 0.03, 0.1)]),
        sinOnOne: frac('sinTheta', 'v7', '_1_1', 0.03, 0.03, 0.3),
        sinOnOneStk: frac('sinTheta', 'v7', s('_1_1', 1), 0.03, 0.03, 0.3),
        xy: lin(['y', 'x']),
        final1: lin([
          ['oppHyp', '  ', 'eq1', '  ', 'sin'],
          ['oppAdj', '  ', 'eq3', '  ', 'tan'],
          ['hypAdj', '  ', 'eq5', '  ', 'sec'],
        ], 0.6),
        final2: lin([
          ['adjHyp', '  ', 'eq2', '  ', 'cos'],
          ['adjOpp', '  ', 'eq6', '  ', 'cot'],
          ['hypOpp', '  ', 'eq4', '  ', 'csc'],
        ], 0.6),
        adjDen: cont(lin(['oppAdj', 'hypAdj']), 0.6),
        tanSec: lin(['tanTheta', 'secTheta']),
        oppDen: cont(lin(['adjOpp', 'hypOpp']), 0.6),
        cotCsc: lin(['cotTheta', 'cscTheta']),
        namesSin: cont(lin([['sinTheta']], 0.5), 1),
        namesSinTan: cont(lin([['sinTheta'], ['tanTheta']], 0.5), 1),
        namesSinTanSec: cont(lin([['sinTheta'], ['tanTheta'], ['secTheta']], 0.5), 1),
        namesCosCotCsc: cont(lin([['cosTheta'], ['cotTheta'], ['cscTheta']], 0.5), 0.3),
        namesComp: cont(lin([
          ['eq1', '  ', 'sinComp'],
          ['eq2', '  ', 'tanComp'],
          ['eq3', '  ', 'secComp'],
        ], 0.5), 0.85),
      },
      forms: {
        final: { scale: [['final1', cont('', 0.8), 'final2'], 1.1] },
        sinCos: ['c1_sinCos'],
        xyOnOne: ['c1_sinCos', 'c2_2', 'xyOnOne'],
        xyOnOneStk: ['c1_sinCos', 'c2_2', 'xyOnOneStk'],
        xy: ['c1_sinCos', 'c2_2', 'xy'],
        oppHyp: 'oppHyp',
        adjHyp: 'adjHyp',
        sinOnOne: ['oppHyp', cont('eq1', 0.3), 'sinOnOne'],
        sinOnOneStk: ['oppHyp', cont('eq1', 0.3), 'sinOnOneStk'],
        sin: ['oppHyp', cont('eq1', 0.3), 'sinTheta'],
        cos: ['adjHyp', cont('eq2', 0.3), 'cosTheta'],
        adjDen: 'adjDen',
        tan: ['adjDen', cont('eq1', 0.3), 'tanTheta'],
        tanSec: ['adjDen', 'c2_2', 'tanSec'],
        oppDen: 'oppDen',
        cot: ['oppDen', cont('eq1', 0.3), 'cotTheta'],
        cotCsc: ['oppDen', 'c2_2', 'cotCsc'],
        namesSin: ['namesSin'],
        namesSinTan: ['namesSinTan'],
        namesSinTanSec: ['namesSinTanSec'],
        namesAll: ['namesSinTanSec', 'namesCosCotCsc'],
        namesComp: ['namesSinTanSec', 'namesCosCotCsc', 'namesComp'],
      },
    },
    mods: {
      scenarios: {
        eqnLeft: { position: [-2.8, 1.2], scale: 1 },
        eqnCenterLeft: { position: [-2, 0.2], scale: 1.4 },
        eqnCenterLeftSingle: { position: [-2, 0], scale: 1.4 },
        center: { position: [-1.5, 0.3], scale: 1 },
        summary: { position: [-1.3, 0.3], scale: 1.4 },
      },
    },
  });

  // Helper function to add functions to the global funciton map
  const add = (name, fn) => figure.fnMap.global.add(name, fn);

  // Add functions that pulse parts of the equation to the function map
  const sPulse = (element, xAlign = 'center', yAlign = 'middle', scale = 1.5) => figure.elements._eqn.pulse({
    elements: [element], xAlign, yAlign, scale, duration: 1.5,
  });
  add('eqnPulseSin', () => sPulse('sin', 'left', 'middle'));
  add('eqnPulseCos', () => sPulse('cos', 'left', 'middle'));
  add('eqnPulseTan', () => sPulse('tan', 'left', 'middle'));
  add('eqnPulseCsc', () => sPulse('csc', 'left', 'middle'));
  add('eqnPulseSec', () => sPulse('sec', 'left', 'middle'));
  add('eqnPulseCot', () => sPulse('cot', 'left', 'middle'));
  add('eqnPulseX', () => sPulse('x', 'center', 'middle', 2));
  add('eqnPulseY', () => sPulse('y', 'center', 'middle', 2));

  add('eqnPulseOpp1', () => sPulse('opp_1', 'center', 'bottom'));
  add('eqnPulseOpp2', () => sPulse('opp_2', 'center', 'bottom'));
  add('eqnPulseOpp3', () => sPulse('opp_3', 'center', 'top'));
  add('eqnPulseOpp4', () => sPulse('opp_4', 'center', 'top'));
  add('eqnPulseAdj1', () => sPulse('adj_1', 'center', 'bottom'));
  add('eqnPulseAdj2', () => sPulse('adj_2', 'center', 'top'));
  add('eqnPulseAdj3', () => sPulse('adj_3', 'center', 'top'));
  add('eqnPulseAdj4', () => sPulse('adj_4', 'center', 'bottom'));
  add('eqnPulseHyp1', () => sPulse('hyp_1', 'center', 'top'));
  add('eqnPulseHyp2', () => sPulse('hyp_2', 'center', 'top'));
  add('eqnPulseHyp3', () => sPulse('hyp_3', 'center', 'bottom'));
  add('eqnPulseHyp4', () => sPulse('hyp_4', 'center', 'bottom'));

  // Functions that set equation element colors
  const eqnSetColor = (opp, adj, hyp) => {
    figure.elements._eqn._opp_1.setColor(opp);
    figure.elements._eqn._opp_2.setColor(opp);
    figure.elements._eqn._opp_3.setColor(opp);
    figure.elements._eqn._opp_4.setColor(opp);
    figure.elements._eqn._adj_1.setColor(adj);
    figure.elements._eqn._adj_2.setColor(adj);
    figure.elements._eqn._adj_3.setColor(adj);
    figure.elements._eqn._adj_4.setColor(adj);
    figure.elements._eqn._hyp_1.setColor(hyp);
    figure.elements._eqn._hyp_2.setColor(hyp);
    figure.elements._eqn._hyp_3.setColor(hyp);
    figure.elements._eqn._hyp_4.setColor(hyp);
  };
  add('eqnColGrey', () => eqnSetColor(colText, colText, colText));
  add('eqnColHyp', () => eqnSetColor(colText, colText, colRad));
  add('eqnColSinCos', () => eqnSetColor(colSin, colCos, colRad));
  add('eqnColTanSec', () => eqnSetColor(colTan, colRad, colSec));
  add('eqnColCotCsc', () => eqnSetColor(colRad, colCot, colCsc));

  // This equation contains forms that describe the complementary function
  // names that can be animated to show where they come from
  figure.add({
    name: 'eqn2',
    make: 'equation',
    options: {
      textFont: { style: 'normal' },
      elements: {
        eq: { text: ' = ', color: colText },
        theta: { text: '\u03b8', color: colTheta, style: 'italic' },
        theta1: { text: '\u03b8', color: colTheta, style: 'italic' },
        comp: { text: '\u00b0\u2212\u03b8', color: colThetaComp, style: 'italic' },
        _90: { color: colThetaComp },
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        lb1: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        tan: { color: colCot },
        c_1: { color: colCot },
        o_1: { color: colCot },
        t_1: { color: colCot },
        gent_1: { color: colCot },
        an_1: { color: colCot },
        mplementary_1: { color: colCot },
        '_ of _1': { color: colCot },
        '_ of _2': { color: colCsc },
        '_ of _3': { color: colCos },
        sec: { color: colCsc },
        c_2: { color: colCsc },
        c_21: { color: colCsc },
        o_2: { color: colCsc },
        s_2: { color: colCsc },
        e_2: { color: colCsc },
        angent_2: { color: colCsc },
        mplementary_2: { color: colCsc },
        ant_2: { color: colCsc },
        //
        sin: { color: colCos },
        mplementary_3: { color: colCos },
        c_3: { color: colCos },
        o_3: { color: colCos },
        s_3: { color: colCos },
        ine_3: { color: colCos },
      },
      formDefaults: {
        alignment: { yAlign: 'baseline', xAlign: 'left' },
      },
      phrases: {
        compAngle: { brac: ['lb', ['_90', 'comp'], 'rb'] },
        tanComp: ['tan', ' ', 'compAngle'],
        secComp: ['sec', ' ', 'compAngle'],
        sinComp: ['sin', ' ', 'compAngle'],
      },
      forms: {
        tanComp: {
          content: 'tanComp',
          alignment: { xAlign: '-0.7o' },
        },
        complementaryTangent: ['tanComp', 'eq', ln(
          ['c_1', 'o_1', 'mplementary_1'],
          ['t_1', 'an_1', 'gent_1', '_ of _1', 'theta1'],
        )],
        cotangent: ['tanComp',
          'eq', 'c_1', 'o_1', 't_1', 'an_1', 'gent_1', ' ', 'theta1'],
        cotan: ['tanComp',
          'eq', 'c_1', 'o_1', 't_1', 'an_1', ' ', 'theta1'],
        cot: ['tanComp', 'eq', 'c_1', 'o_1', 't_1', ' ', 'theta1'],
        //
        secComp: {
          content: 'secComp',
          alignment: { xAlign: '-0.7o' },
        },
        complementarySecant: ['secComp', 'eq', ln(
          ['c_2', 'o_2', 'mplementary_2'],
          ['s_2', 'e_2', 'c_21', 'ant_2', '_ of _2', 'theta1'],
        )],
        cosecant: ['secComp', 'eq', 'c_2', 'o_2', 's_2', 'e_2', 'c_21', 'ant_2', ' ', 'theta1'],
        cosec: ['secComp', 'eq', 'c_2', 'o_2', 's_2', 'e_2', 'c_21', ' ', 'theta1'],
        csc: ['secComp', 'eq', 'c_2', 's_2', 'c_21', ' ', 'theta1'],
        //
        sin: {
          content: 'sin',
          alignment: { xAlign: '-0.7o' },
        },
        sinComp: {
          content: 'sinComp',
          alignment: { xAlign: '-0.7o' },
        },
        complementarySine: ['sinComp', 'eq', ln(
          ['c_3', 'o_3', 'mplementary_3'],
          ['s_3', 'ine_3', '_ of _3', 'theta1'],
        )],
        cosine: ['sinComp', 'eq', 'c_3', 'o_3', 's_3', 'ine_3', ' ', 'theta1'],
        cos: ['sinComp', 'eq', 'c_3', 'o_3', 's_3', ' ', 'theta1'],
      },
      position: [-2.5, 0],
      scale: 1,
    },
  });
}

