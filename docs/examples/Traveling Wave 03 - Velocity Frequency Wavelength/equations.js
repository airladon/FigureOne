/* globals colorText, color0, figure, color1 */
/* eslint-disable camelcase */

function addEquation() {
  // Helper functions to make forms and phrases more readable
  const brac = (content, id, overhang = 0.05) => ({
    brac: {
      left: `lb${id}`, content, right: `rb${id}`, overhang,
    },
  });

  const frac = (numerator, symbol, denominator) => ({
    frac: {
      numerator, denominator, symbol, overhang: 0.02,
    },
  });

  const stk = (content, num) => ({
    strike: {
      content,
      symbol: `strike${num}`,
    },
  });

  const hide = content => ({
    container: { content, inSize: false },
  });

  const bCom = (content, comment, symbol, commentSpace, inSize) => ({
    bottomComment: {
      content, comment, symbol, commentSpace, inSize,
    },
  });
  const tCom = (content, comment, symbol, commentSpace, inSize, scale = 0.6) => ({
    topComment: {
      content, comment, symbol, commentSpace, inSize, scale,
    },
  });

  figure.add([
    {
      name: 'eqn',
      make: 'collections.equation',
      options: {
        color: colorText,
        dimColor: [0.65, 0.65, 0.65, 1],
        // Customized elements
        elements: {
          sin: { style: 'normal' },
          lb1: { symbol: 'bracket', side: 'left' },
          rb1: { symbol: 'bracket', side: 'right' },
          lb2: { symbol: 'bracket', side: 'left' },
          rb2: { symbol: 'bracket', side: 'right' },
          lb3: { symbol: 'bracket', side: 'left' },
          rb3: { symbol: 'bracket', side: 'right' },
          lb4: { symbol: 'bracket', side: 'left' },
          rb4: { symbol: 'bracket', side: 'right' },
          lb5: { symbol: 'bracket', side: 'left' },
          rb5: { symbol: 'bracket', side: 'right' },
          lb6: { symbol: 'bracket', side: 'left' },
          rb6: { symbol: 'bracket', side: 'right' },
          lb7: { symbol: 'squareBracket', side: 'left', lineWidth: 0.008 },
          rb7: { symbol: 'squareBracket', side: 'right', lineWidth: 0.008 },
          equals: '  =  ',
          equals2: '  =  ',
          equals3: '  =  ',
          w1: '\u03c9',
          w2: '\u03c9',
          w3: '\u03c9',
          min1: ' \u2212 ',
          min2: ' \u2212 ',
          min3: ' \u2212 ',
          comma1: ', ',
          comma2: ', ',
          comma3: ', ',
          lambda: '\u03bb',
          lambda1: '\u03bb',
          x_2: 'x',
          x_1: 'x',
          div1: ' \u2215 ',
          div2: ' \u2215 ',
          div3: ' \u2215 ',
          vin1: { symbol: 'vinculum', lineWidth: 0.007 },
          vin2: { symbol: 'vinculum', lineWidth: 0.007 },
          vin3: { symbol: 'vinculum', lineWidth: 0.007 },
          brace: { symbol: 'brace', side: 'bottom', lineWidth: 0.005 },
          tBrace: { symbol: 'brace', side: 'top', lineWidth: 0.005 },
          bBrace: {
            symbol: 'brace', side: 'bottom', lineWidth: 0.008, color: color1,
          },
          line1: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
          line2: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
          line3: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
          f_1: { color: color0 },
          f_2: { color: color0 },
          rx1: { text: 'x', color: color0 },
          rx2: { text: 'x', color: color0 },
          rx3: { text: 'x', color: color0 },
          rx4: { text: 'x', color: color0 },
          r01: { text: '0', color: color0 },
          r02: { text: '0', color: color0 },
          r03: { text: '0', color: color0 },
          r04: { text: '0', color: color0 },
          bx1: { text: 'x', color: color1 },
          bx2: { text: 'x', color: color1 },
          b11: { text: '1', color: color1 },
          b12: { text: '1', color: color1 },
          strike1: { symbol: 'strike', lineWidth: 0.007 },
          strike2: { symbol: 'strike', lineWidth: 0.007 },
          x0Box1: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          x0Box2: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          x0Box3: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          x1Box1: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          x1Box2: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          twoPi: '2\u03c0',
        },
        // Reusable phrases
        phrases: {
          x0y: { tBox: [{ sub: ['rx1', 'r01'] }, 'x0Box1'] },
          x0y2: { sub: ['rx2', 'r02'] },
          x0y3: { sub: ['rx3', 'r03'] },
          x0y4: { sub: ['rx4', 'r04'] },
          f1: { tBox: [{ container: [{ sub: ['f_1', 'x0y3'] }, 0.08] }, 'x0Box2'] },
          f2: { tBox: [{ container: [{ sub: ['f_2', 'x0y2'] }, 0.08] }, 'x0Box3'] },
          x11: { sub: ['x_1', '_1_1'] },
          x1y: { tBox: [{ sub: ['bx1', 'b11'] }, 'x1Box2'] },
          x1y2: { tBox: [{ sub: ['bx2', 'b12'] }, 'x1Box1'] },
          x1y2H: { tBox: [{ sub: [[hide('x_2'), 'bx2'], 'b12'] }, 'x1Box1'] },
          x1OnV: frac(['x1y2'], 'vin1', 'v_1'),
          x1OnVb: { scale: [frac('x1y2', 'vin1', 'v_1'), 0.8] },
          x1OnVbH: { scale: [frac('x1y2H', 'vin1', 'v_1'), 0.8] },
          xOnV: frac(['x_2'], 'vin1', 'v_1'),
          xOnV1: frac(['x_3'], 'vin2', 'v_2'),
          wOnV1: frac(['w3'], 'vin2', 'v_2'),
          wxOnV1: frac(['w3', 'x_3'], 'vin2', 'v_2'),
          xOnV2: frac(['x_4'], 'vin3', 'v_3'),
          t11: { sub: ['t_1', '_1_2'] },
          t12: { sub: ['t_2', '_1_3'] },
          yx0t: ['y_1', brac(['x0y', 'comma1', 't_y1'], 1)],
          yx1t: ['y_3', brac(['x1y', 'comma3', 't_y3'], 3)],
          yx1tH: ['y_3', brac([hide('x_1'), 'x1y', 'comma3', 't_y3'], 3)],
          yxt: ['y_3', brac(['x_1', 'comma3', 't_y3'], 3)],
          yxtConstX: ['y_3', brac([bCom('x_1', 'constant_1', 'line2', 0.27, false), 'comma3', 't_y3'], 3)],
          yxtConstT: ['y_3', brac(['x_1', 'comma3', bCom('t_y3', 'constant_1', 'line2', 0.21, false)], 3)],
          ft: ['f1', brac('t', 2)],
          ftt1: ['f2', brac(['t_3', 'min2', 't12'], 5)],
          ftt1Sub: ['f2', brac(['t_3', 'min2', tCom('t12', 'x1OnVb', 'line1', 0.2, false, 0.8)], 5)],
          ftx1: ['f2', brac(['t_3', 'min2', 'x1OnVb'], 5)],
          ftx1H: ['f2', brac(['t_3', 'min2', 'x1OnVbH'], 5)],
          ftx: ['f2', brac(['t_3', 'min2', 'xOnV'], 5)],
          ftx2: ['f1', brac('t_1', 1)],
          ftx3: ['f1', brac(['t_2', 'min1', 'xOnV1'], 1)],
          sinwt: ['sin', brac(['w1', 't_4'], 2)],
          sinwtXOnV: ['sin', brac(['w1', brac(['t_5', 'min3', 'xOnV2'], 7)], 2)],
          sinwtXOnVExpand: ['sin', brac([tCom(['w1', brac(['t_5', 'min3', 'xOnV2'], 7)], ['w2', 't_2', 'min1', 'w3', ' ', 'xOnV1'], 'tBrace', 0.05, false)], 2)],
          sinwtwXOnV: ['sin', brac(['w2', 't_2', 'min1', 'w3', ' ', 'xOnV1'], 2)],
          sinwtwxOnVComb: ['sin', brac(['w2', 't_2', 'min1', 'wxOnV1'], 2)],
          sinwtwOnVx: ['sin', brac(['w2', 't_2', 'min1', 'wOnV1', ' ', 'x_3'], 2)],
          sinConstX: ['sin', brac(['w2', 't_2', 'min1', bCom(['wOnV1', ' ', 'x_3'], ['constant'], 'line1', 0.2, false)], 2)],
          constT: bCom(['w2', 't_2'], ['constant'], 'line1', 0.2, false),
          expandW: tCom('wOnV1', ['twoPi', 'f_4'], 'line3', 0.2, false),
          twoPiFOnV1: { frac: [['twoPi', 'f_4'], 'vin2', 'v_2'] },
          sinConstT: ['sin', brac(['constT', 'min1', 'wOnV1', ' ', 'x_3'], 2)],
          sinExpandW: ['sin', brac(['constT', 'min1', 'expandW', ' ', 'x_3'], 2)],
          sin2pif: ['sin', brac(['constT', 'min1', 'twoPiFOnV1', ' ', 'x_3'], 2)],
          sin2pifTimesF: ['sin', brac([
            'constT', 'min1',
            frac(['twoPi', 'f_4', 'div1', 'f_5'], 'vin2', ['v_2', 'div2', 'f_6']),
            '  ', 'x_3',
          ], 2)],
          sin2pifTimesFCancel: ['sin', brac(['constT', 'min1', frac(['twoPi', stk('f_4', 1), 'div1', stk('f_5', 2)], 'vin2', ['v_2', 'div2', 'f_6']), '  ', 'x_3',
          ], 2)],
          sin2piOnfv: ['sin', brac(['constT', 'min1', frac('twoPi', 'vin2', ['v_2', 'div2', 'f_6']), '  ', 'x_3'], 2)],
          sin2piOnfvL: ['sin', brac(['constT', 'min1', frac('twoPi', 'vin2', bCom(['v_2', 'div2', 'f_6'], 'lambda', 'brace', 0.05, false)), '  ', 'x_3'], 2)],
          sin2piOnLConst: ['sin', brac(['constT', 'min1', frac('twoPi', 'vin2', 'lambda'), '  ', 'x_3'], 2)],
          sin2piOnL: ['sin', brac(['w2', 't_2', 'min1', frac('twoPi', 'vin2', 'lambda'), '  ', 'x_3'], 2)],
          ftxBotCom: ['f2', brac({
            bar: {
              content: ['t_3', 'min2', 'xOnV'],
              symbol: 'bBrace',
              inSize: false,
              side: 'bottom',
              space: 0.08,
            },
          }, 5)],
          fOnVUnits: [
            frac('v_1', 'vin3', 'f_5'),
            '_ \u21d2 ',
            frac(['m_1', 'div3', 's_2'], 'vin1', ['_1_1', 'div1', 's_1']),
            'equals2',
            'm_2',
          ],
        },
        formDefaults: {
          alignment: { fixTo: 'equals' },
        },
        forms: {
          // //////////////////////////////////////////////////////////
          title: {
            content: ['v', 'equals', 'lambda', ' ', 'f'],
            scale: 1.1,
          },
          // //////////////////////////////////////////////////////////
          t1: ['t11', 'equals', 'x1OnV'],
          // //////////////////////////////////////////////////////////
          yx0t: ['yx0t', 'equals', 'ft'],
          yx0tAndft: {
            content: {
              lines: {
                content: [
                  { content: ['yx0t', 'equals', 'ft'], justify: 'equals' },
                  { content: ['yx1t', 'equals2', 'ftt1'], justify: 'equals2' },
                ],
                justify: 'element',
                space: 0.1 / 0.7,
              },
            },
            alignment: { yAlign: -2.9 },
          },
          yx1tTemp: {
            content: ['yx1t', 'equals2', 'ftt1'],
            alignment: { fixTo: 'equals2' },
          },
          yx1t: ['yx1t', 'equals', 'ftt1'],
          yx1tSub: ['yx1t', 'equals', 'ftt1Sub'],
          yx1tx1: ['yx1t', 'equals', 'ftx1'],
          yx1tx1HiddenX: ['yx1tH', 'equals', 'ftx1H'],
          yxtx: ['yxt', 'equals', 'ftx'],
          // //////////////////////////////////////////////////////////
          yxtxAndSine: {
            content: {
              lines: {
                content: [
                  { content: ['yxt', 'equals', 'ftx'], justify: 'equals' },
                  { content: ['ftx2', 'equals2', 'sinwt'], justify: 'equals2' },
                ],
                justify: 'element',
                baselineSpace: 0.4 / 0.7,
              },
            },
            alignment: { yAlign: -2.9 },
          },
          yxtxAndSineBotCom: {
            content: {
              lines: {
                content: [
                  { content: ['yxt', 'equals', 'ftxBotCom'], justify: 'equals' },
                  { content: ['ftx2', 'equals2', 'sinwt'], justify: 'equals2' },
                ],
                justify: 'element',
                baselineSpace: 0.4 / 0.7,
              },
            },
            alignment: { yAlign: -2.9 },
          },
          yxtxAndSineXOnV: {
            content: {
              lines: {
                content: [
                  { content: ['yxt', 'equals', 'ftx'], justify: 'equals' },
                  { content: ['ftx3', 'equals3', 'sinwtXOnV'], justify: 'equals3' },
                ],
                justify: 'element',
                baselineSpace: 0.4 / 0.7,
              },
            },
            alignment: { yAlign: -2.9 },
          },
          yxtxSine: ['yxt', 'equals', 'sinwtXOnV'],
          yxtxSineExpanded: ['yxt', 'equals', 'sinwtXOnVExpand'],
          yxtxSinewtwxv: ['yxt', 'equals', 'sinwtwXOnV'],
          yxtxSinewtwxOnv: ['yxt', 'equals', 'sinwtwxOnVComb'],
          yxtxSinewtwvx: ['yxt', 'equals', 'sinwtwOnVx'],
          // //////////////////////////////////////////////////////////
          sineConstX: ['yxtConstX', 'equals', 'sinConstX'],
          sineConstT: ['yxtConstT', 'equals', 'sinConstT'],
          sineExpandW: ['yxtConstT', 'equals', 'sinExpandW'],
          sine2PiF: ['yxtConstT', 'equals', 'sin2pif'],
          sine2PiFTimesF: ['yxtConstT', 'equals', 'sin2pifTimesF'],
          sine2PiFTimesFCancel: ['yxtConstT', 'equals', 'sin2pifTimesFCancel'],
          sine2PiOnfv: ['yxtConstT', 'equals', 'sin2piOnfv'],
          sine2PiOnfvUnits: ['yxtConstT', 'equals', 'sin2piOnfv', 'comma2', '            ', 'fOnVUnits'],
          sine2PiOnfvL: ['yxtConstT', 'equals', 'sin2piOnfvL'],
          sine2PiOnL: ['yxtConstT', 'equals', 'sin2piOnLConst'],
          sineGeneral: ['yxt', 'equals', 'sin2piOnL'],
          vOnFLambda: [{ frac: ['v', 'vin1', 'f'] }, 'equals2', 'lambda1'],
          cLambdaF: {
            content: ['v', 'equals2', 'lambda1', ' ', 'f'],
            translation: {
              f: { style: 'curve', direction: 'down', mag: 0.8 },
            },
          },
        },
        position: [0, 1],
      },
      mods: {
        scenarios: {
          title: { position: [-0.4, 1.9], scale: 1.3 },
          default: { position: [-0.1, 1.9], scale: 1.3 },
          left: { position: [-0.4, 1.9], scale: 1.3 },
          farLeft: { position: [-1.3, 1.9], scale: 1.3 },
          low: { position: [-0.4, 0.3], scale: 1.8 },
        },
      },
    },
    {
      name: 'sideEqn',
      make: 'equation',
      options: {
        elements: {
          equals: '  =  ',
          vin1: { symbol: 'vinculum', lineWidth: 0.007 },
          x1Box: { symbol: 'tBox', touchBorder: 0.1, isTouchable: true },
          x_1: { color: color1 },
          _1_1: { color: color1 },
        },
        phrases: {
          x11: { tBox: [{ sub: ['x_1', '_1_1'] }, 'x1Box'] },
          t11: { sub: ['t_1', '_1_2'] },
        },
        forms: {
          t1: ['t11', 'equals', frac('x11', 'vin1', 'v_1')],
          t11: ['t11', 'equals', frac('x11', 'vin1', 'v_1'), '_      (1)'],
        },
        formDefaults: {
          alignment: { fixTo: 'equals' },
        },
      },
      mods: {
        scenarios: {
          side: { position: [2, 0.4], scale: 1 },
          default: { position: [-0.1, 1.9], scale: 1.3 },
        },
      },
    },
    {
      name: 'nav',
      make: 'collections.slideNavigator',
      options: {
        prevButton: {
          position: [-2.75, 1.5], type: 'arrow', length: 0.4, width: 0.8,
        },
        nextButton: {
          position: [2.75, 1.5], type: 'arrow', length: 0.4, width: 0.8,
        },
        text: { font: { size: 0.15 }, position: [-2.4, 2.7], xAlign: 'left' },
        equation: 'eqn',
      },
    },
  ]);
}

// addEquation();
