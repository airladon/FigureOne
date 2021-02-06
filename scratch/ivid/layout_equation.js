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
        equals4: '  =  ',
        oppValue: { text: '1.000' },
        hypValue: { text: '1' },
        ratioValue: { text: '0.4540' },
        oppValueDef: { text: '0.4540' },
        hypValueDef: { text: '1' },
        ratioValueDef: { text: '0.4540' },
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        lb1: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
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
        tan: { font: { style: 'normal' } },
        gent: { font: { style: 'normal' } },
        sin: { font: { style: 'normal' } },
        sin_1: { font: { style: 'normal' } },
        // cos: { font: { style: 'normal' } },
        cos_1: { font: { style: 'normal' } },
        ine: { font: { style: 'normal' } },
        mplementary: { font: { style: 'normal' } },
        s: { font: { style: 'normal' } },
        co: { font: { style: 'normal' } },
        comma: ',',
        times1: ' \u00d7 ',
        times2: ' \u00d7 ',
        times3: ' \u00d7 ',
        times4: ' \u00d7 ',
        opposite: { color: color2 },
        opposite_1: { color: color2 },
        hypotenuse: { color: color2 },
        hypotenuse_1: { color: color2 },
        hypotenuse_2: { color: color2 },
        hypotenuse_3: { color: color2 },
        hypotenuse_4: { color: color2 },
        adjacent: { color: color2 },
        adjacent_1: { color: color2 },
        _90min: { text: '90\u00b0 \u2212 ', color: color1 },
        brace: { symbol: 'brace', side: 'top', color: color1 },
        stk1: { symbol: 'strike', style: 'forward', lineWidth: 0.006 },
        stk2: { symbol: 'strike', style: 'forward', lineWidth: 0.006 },
      },
      phrases: {
        oppOnHyp: { frac: ['opposite', 'v1', 'hypotenuse'] },
        adjOnHyp: { frac: ['adjacent', 'v2', 'hypotenuse_1'] },
        adjOnHyp1: { frac: ['adjacent_1', 'v3', 'hypotenuse_2'] },
        oppOnAdj: { frac: ['opposite_1', 'v3', 'adjacent_1'] },
        fTheta: ['function', { container: ['', 0.02] }, { brac: ['lb', 'theta', 'rb'] }],
        fTheta1: ['function', { container: ['', 0.02] }, { brac: ['lb', 'theta1', 'rb'] }],
        sinBracTheta: ['sin', { brac: ['lb', 'theta', 'rb'] }],
        sinTheta: ['sin', ' ', 'theta'],
        sinTheta1: ['sin_1', ' ', 'theta2'],
        sinComp: ['sin_1', { brac: ['lb1', ['_90min', 'theta2'], 'rb1'] }],
        compComment: {
          topComment: {
            content: ['_90min', 'theta2'],
            comment: { 'complementary angle': { color: color1 } },
            inSize: false,
            commentSpace: 0.1,
            contentSpace: 0.1,
            symbol: 'brace',
          },
        },
        sinCompComment: ['sin_1', { brac: ['lb1', 'compComment', 'rb1'] }],
        complementarySineTheta: ['co', 'mplementary', ' ', 's', 'ine', ' ', 'theta3'],
        cosineTheta: ['co', 's', 'ine', ' ', 'theta3'],
        cosTheta: ['cos', ' ', 'theta3'],
        cosTheta1: ['cos_1', ' ', 'theta4'],
        tangentTheta: ['tan', 'gent', ' ', 'theta1'],
        tanTheta: ['tan', ' ', 'theta1'],
        cos: ['co', 's'],
      },
      forms: {
        oppOnHyp: 'oppOnHyp',
        oneRatio: ['oppOnHyp', 'equals1', 'constant_1'],
        twoRatios: {
          content: [
            {
              lines: {
                content: [
                  { content: ['oppOnHyp', 'equals1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjOnHyp', 'equals2'], justify: 'equals2' },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
        },
        twoRatiosSinComp: {
          content: [
            {
              lines: {
                content: [
                  { content: ['oppOnHyp', 'equals1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjOnHyp', 'equals2', 'sinComp'], justify: 'equals2' },
                ],
                // content: [
                //   ['oppOnHyp', 'equals1', 'sinTheta'],
                //   ['adjOnHyp', 'equals2', 'sinComp'],
                //   // ['sinComp', 'equals3', 'adjOnHyp1'],
                // ],
                baselineSpace: 0.6,
                justify: 'element',
                // yAlign: 'baseline',
              },
            },
          ],
        },
        twoRatiosSinCompComment: {
          content: [
            {
              lines: {
                content: [
                  { content: ['oppOnHyp', 'equals1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjOnHyp', 'equals2', 'sinCompComment'], justify: 'equals2' },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
        },
        twoRatiosComplementarySine: {
          content: [
            {
              lines: {
                content: [
                  { content: ['oppOnHyp', 'equals1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjOnHyp', 'equals2', 'sinCompComment'], justify: 'equals2' },
                  { content: ['equals3', 'complementarySineTheta'], justify: 'equals3', baselineSpace: 0.4 },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
        },
        twoRatiosCosine: {
          content: [
            {
              lines: {
                content: [
                  { content: ['oppOnHyp', 'equals1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjOnHyp', 'equals2', 'sinCompComment'], justify: 'equals2' },
                  { content: ['equals3', 'cosineTheta'], justify: 'equals3', baselineSpace: 0.4 },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
        },
        twoRatiosCos: {
          content: [
            {
              lines: {
                content: [
                  { content: ['oppOnHyp', 'equals1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjOnHyp', 'equals2', 'sinCompComment'], justify: 'equals2' },
                  { content: ['equals3', 'cosTheta'], justify: 'equals3', baselineSpace: 0.4 },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
        },
        twoRatiosCosOnly: {
          content: [
            {
              lines: {
                content: [
                  { content: ['oppOnHyp', 'equals1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjOnHyp', 'equals2', 'cosTheta'], justify: 'equals2' },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
        },
        threeRatiosEqual: {
          content: [
            {
              lines: {
                content: [
                  { content: ['oppOnHyp', 'equals1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjOnHyp', 'equals2', 'cosTheta'], justify: 'equals2' },
                  { content: ['oppOnAdj', 'equals3'], justify: 'equals3' },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
          alignment: { xAlign: 'left' },
        },
        threeRatiosSineTimes: {
          content: [
            {
              lines: {
                content: [
                  { content: ['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], justify: 'equals2' },
                  { content: ['oppOnAdj', 'equals3'], justify: 'equals3' },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
          translation: {
            hypotenuse: { style: 'curve', mag: 0.5, direction: 'down' },
            hypotenuse_1: { style: 'curve', mag: 0.5, direction: 'down' },
            duration: 2,
          },
          alignment: { xAlign: 'left' },
        },
        threeRatiosSineTimes2: {
          content: [
            {
              lines: {
                content: [
                  { content: ['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], justify: 'equals2' },
                  {
                    content: ['oppOnAdj', 'equals3', {
                      frac: [
                        ['hypotenuse_2', 'times3', 'sinTheta1'],
                        'v1',
                        ['hypotenuse_3', 'times4', 'cosTheta1'],
                      ],
                    }],
                    justify: 'equals3',
                  },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
        },
        threeRatiosSineTimesStrike: {
          content: [
            {
              lines: {
                content: [
                  { content: ['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], justify: 'equals2' },
                  {
                    content: ['oppOnAdj', 'equals3', {
                      frac: [
                        [{ strike: ['hypotenuse_2', 'stk1'] }, 'times3', 'sinTheta1'],
                        'v1',
                        [{ strike: ['hypotenuse_3', 'stk2'] }, 'times4', 'cosTheta1'],
                      ],
                    }],
                    justify: 'equals3',
                  },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
          alignment: { xAlign: 'left' },
        },
        threeRatiosSineOnCos: {
          content: [
            {
              lines: {
                content: [
                  { content: ['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], justify: 'equals2' },
                  {
                    content: ['oppOnAdj', 'equals3', { frac: [ 'sinTheta1', 'v1', 'cosTheta1'] }],
                    justify: 'equals3',
                  },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
          alignment: { xAlign: 'left' },
        },
        threeRatiosSineOnCosTangent: {
          content: [
            {
              lines: {
                content: [
                  { content: ['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], justify: 'equals2' },
                  {
                    content: ['oppOnAdj', 'equals3', { frac: ['sinTheta1', 'v1', 'cosTheta1'] }],
                    justify: 'equals3',
                  },
                  {
                    content: ['equals4', 'tangentTheta'],
                    justify: 'equals4',
                    baselineSpace: 0.4,
                  },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
          alignment: { xAlign: 'left' },
        },
        threeRatiosSineOnCosTan: {
          content: [
            {
              lines: {
                content: [
                  { content: ['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], justify: 'equals2' },
                  {
                    content: ['oppOnAdj', 'equals3', { frac: ['sinTheta1', 'v1', 'cosTheta1'] }],
                    justify: 'equals3',
                  },
                  {
                    content: ['equals4', 'tanTheta'],
                    justify: 'equals4',
                    baselineSpace: 0.4,
                  },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
          alignment: { xAlign: 'left' },
        },
        threeRatiosTimesTan: {
          content: [
            {
              lines: {
                content: [
                  { content: ['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], justify: 'equals2' },
                  {
                    content: ['oppOnAdj', 'equals3', 'tanTheta'],
                    justify: 'equals3',
                  },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
          alignment: { xAlign: 'left' },
        },
        threeRatiosSinCosTan: {
          content: [
            {
              lines: {
                content: [
                  { content: ['oppOnHyp', 'equals1', 'sinTheta'], justify: 'equals1' },
                  { content: ['adjOnHyp', 'equals2', 'cosTheta'], justify: 'equals2' },
                  {
                    content: ['oppOnAdj', 'equals3', 'tanTheta'],
                    justify: 'equals3',
                  },
                ],
                baselineSpace: 0.6,
                justify: 'element',
              },
            },
          ],
          translation: {
            hypotenuse: { style: 'curve', mag: 0.5, direction: 'down' },
            hypotenuse_1: { style: 'curve', mag: 0.5, direction: 'down' },
            duration: 2,
          },
          alignment: { xAlign: 'left' },
        },
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
        sinBracTheta: ['oppOnHyp', 'equals1', 'sinBracTheta'],
        sinTheta: ['oppOnHyp', 'equals1', 'sinTheta'],
        sinOnly: [{ container: ['', 0.9] }, 'sinTheta'],
        fOnly: [{ container: ['', 0.9] }, 'fTheta'],
        fLeft: ['fTheta'],
        sinInf: {
          content: [
            'sinTheta', 'equals1', 'theta1', '_  –  _1',
            { frac: [{ sup: ['theta2', '3', 0.6] }, 'v2', '3!'] },
            '_  +  _1',
            { frac: [{ sup: ['theta3', '5', 0.6] }, 'v3', '5!'] },
            '_  –  _2',
            { frac: [{ sup: ['theta4', '7', 0.6] }, 'v4_vinculum', '7!'] },
            '_  +  _2', 'dotDotDot',
          ],
          alignment: { xAlign: 'center' },
        },
        bowstring: 'bowstring',
        halfBowstring: ['half way there ', 'bowstring'],
        sinus: 'sinus',
        sine: 'sine',
        sineSin: ['sine', 'comma', 'sinText'],
        // statement: ['oppOnHyp', '_  is the same for all right triangles with angle ', 'theta',
        // ],
      },
    },
    mods: {
      scenarios: {
        upperLeft: { position: [-2, 0.4], scale: 1 },
        // left: { position: [-2.2, 0], scale: 1.2 },
        default: { position: [0, 0], scale: 1.4 },
        table: { position: [-2.1, 1.1], scale: 1 },
        // top: { position: [-1.5, 0.7], scale: 1 },
        topRight: { position: [1.6, 0.95], scale: 1 },
        bottom: { position: [0, -1.3], scale: 1 },
        eqnTri: { position: [0.8, 0], scale: 1.2 },
        eqnTri1: { position: [0.5, 0.7], scale: 1.1 },
        right: { position: [1, 0], scale: 1.1 },
      },
    },
  });
  figure.add({
    name: 'eqn1',
    method: 'equation',
    options: {
      elements: {
        v1: { symbol: 'vinculum' },
        v2: { symbol: 'vinculum' },
        v3: { symbol: 'vinculum' },
        equals1: '  =  ',
        equals2: '  =  ',
        equals3: '  =  ',
        theta: { text: '\u03b8', color: color1 },
        theta1: { text: '\u03b8', color: color1 },
        theta2: { text: '\u03b8', color: color1 },
        theta3: { text: '\u03b8', color: color1 },
        theta4: { text: '\u03b8', color: color1 },
        dotDotDot: '...',
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
      },
      phrases: {
        oppOnHyp: { frac: ['opposite', 'v1', 'hypotenuse'] },
        adjOnHyp: { frac: ['adjacent', 'v2', 'hypotenuse_1'] },
        oppOnAdj: { frac: ['opposite_1', 'v3', 'adjacent_1'] },
        fTheta: ['f', { container: ['', 0.02] }, { brac: ['lb', 'theta', 'rb'] }],
      },
      forms: {
        fInf: {
          content: [
            'fTheta', 'equals1', 'theta1', '_  –  _1',
            { frac: [{ sup: ['theta2', '3'] }, 'v2', '3!'] },
            '_  +  _1',
            { frac: [{ sup: ['theta3', '5'] }, 'v3', '5!'] },
            '_  –  _2',
            { frac: [{ sup: ['theta4', '7'] }, 'v4_vinculum', '7!'] },
            '_  +  _2', 'dotDotDot',
          ],
          alignment: { xAlign: 'center' },
        },
      },
    },
    mods: {
      scenarios: {
        default: { position: [1, -0.2] },
      },
    },
  });
}
