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
        ratioValue: { text: '1.000' },
        oppValueDef: { text: '0.447' },
        hypValueDef: { text: '1' },
        ratioValueDef: { text: '0.447' },
      },
      phrases: {
        oppOnHyp: { frac: ['opposite', 'v1', 'hypotenuse'] },
        adjOnHyp: { frac: ['adjacent', 'v2', 'hypotenuse_1'] },
        oppOnAdj: { frac: ['opposite_1', 'v3', 'adjacent_1'] },
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
        ratioValue: [
          { frac: ['oppValue', 'v1', 'hypValue'] },
          'equals1', 'ratioValue',
        ],
        ratioValueDef: [
          { frac: ['oppValueDef', 'v1', 'hypValueDef'] },
          'equals1', 'ratioValueDef',
        ],
      },
    },
    mods: {
      scenarios: {
        upperLeft: { position: [-2, 0.4] },
        left: { position: [-2, -0.3] },
        default: { position: [0, 0] },
      },
    },
  });
}
