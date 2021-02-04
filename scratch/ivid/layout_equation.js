function makeEquation() {
  figure.add({
    name: 'eqn',
    method: 'equation',
    options: {
      elements: {
        v1: { symbol: 'vinculum' },
        v2: { symbol: 'vinculum' },
        v3: { symbol: 'vinculum' },
        equals1: '  =  ',
        equals2: '  =  ',
        equals3: '  =  ',
        oppValue: { text: '1.000' },
        hypValue: { text: '1' },
        ratioValue: { text: '0.4540' },
        oppValueDef: { text: '0.4540' },
        hypValueDef: { text: '1' },
        ratioValueDef: { text: '0.4540' },
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        theta: { text: '\u03b8', color: color1 },
        theta1: { text: '\u03b8', color: color1 },
        theta2: { text: '\u03b8', color: color1 },
        theta3: { text: '\u03b8', color: color1 },
        theta4: { text: '\u03b8', color: color1 },
        dotDotDot: '...',
        bowstring: { color: color1 },
        halfBowstring: { text: 'half-bowstring', color: color1 },
        sinus: { color: color1 },
        sine: { color: color1 },
        sinText: { color: color1 },
        sin: { font: { style: 'normal' } },
        comma: ',',
      },
      phrases: {
        oppOnHyp: { frac: ['opposite', 'v1', 'hypotenuse'] },
        adjOnHyp: { frac: ['adjacent', 'v2', 'hypotenuse_1'] },
        oppOnAdj: { frac: ['opposite_1', 'v3', 'adjacent_1'] },
        fTheta: ['f', { container: ['', 0.02] }, { brac: ['lb', 'theta', 'rb'] }],
      },
      forms: {
        oneRatio: ['oppOnHyp', 'equals1', 'constant_1'],
        twoRatios: [
          {
            lines: {
              content: [
                ['oppOnHyp', 'equals1', 'constant_1'],
                ['adjOnHyp', 'equals2', 'constant_2'],
              ],
              baselineSpace: 0.6,
            },
          },
        ],
        threeRatios: [
          {
            lines: {
              content: [
                ['oppOnHyp', 'equals1', 'constant_1'],
                ['adjOnHyp', 'equals2', 'constant_2'],
                ['oppOnAdj', 'equals3', 'constant_3'],
              ],
              baselineSpace: 0.6,
            },
          },
        ],
        ratioValue: ['oppOnHyp', 'equals1', 'ratioValue'],
        ratioValueDef: ['oppOnHyp', 'equals1', 'ratioValueDef'],
        f: ['oppOnHyp', 'equals1', 'fTheta'],
        fOnly: [{ container: ['', 0.9] }, 'fTheta'],
        fLeft: ['fTheta'],
        fInf: [
          'fTheta', 'equals1', 'theta1', '_  –  _1',
          { frac: [{ sup: ['theta2', '3'] }, 'v2', '3!'] },
          '_  +  _1',
          { frac: [{ sup: ['theta3', '5'] }, 'v3', '5!'] },
          '_  –  _2',
          { frac: [{ sup: ['theta4', '7'] }, 'v4_vinculum', '7!'] },
          '_  +  _2', 'dotDotDot',
        ],
        bowstring: 'bowstring',
        halfBowstring: 'halfBowstring',
        sinus: 'sinus',
        sine: 'sine',
        sineSin: ['sine', 'comma', 'sinText'],
      },
    },
    mods: {
      scenarios: {
        upperLeft: { position: [-2, 0.4], scale: 1 },
        left: { position: [-2, 0], scale: 1 },
        default: { position: [-1.2, 0], scale: 1.5 },
        table: { position: [-2.1, 1.1], scale: 1 },
      },
    },
  });
}
