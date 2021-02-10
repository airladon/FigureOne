/* eslint-disable camelcase */
/* globals Fig */


const figure = new Fig.Figure({
  limits: [-3, -1.5, 6, 3],
  color: [0.3, 0.3, 0.3, 1],
  font: { size: 0.1 },
});

const color1 = [1, 0, 0, 1];
const color2 = [0, 0.5, 1, 1];
const color3 = [0, 0.6, 0, 1];
const color4 = [0.6, 0, 0.6, 1];
const colGrey = [0.6, 0.6, 0.6, 1];
const colText = [0.3, 0.3, 0.3, 1];
const colCos = [0, 0, 0.9, 1];
const colSec = [0, 0.7, 1, 1];
const colTan = [0, 0.4, 0, 1];
const colCot = [0, 0.9, 0, 1];
const colSin = [0.9, 0, 0, 1];
const colCsc = [1, 0.4, 0, 1];
const colRad = [1, 0, 1, 1];
const colTheta = [0, 0.6, 0, 1];

function similarLayout() {
  const scale1 = 1.2;
  const scale2 = 1.9;
  const tri1Points = [[0, 0], [0.5 * scale1, 0.5 * scale1], [1.2 * scale1, 0]];
  const tri2Points = [[0, 0], [0.5 * scale2, 0.5 * scale2], [1.2 * scale2, 0]];

  const label = (text, s = '', location = 'outside') => ({
    label: {
      scale: 0.8,
      offset: 0.04,
      location,
      text: {
        forms: { 0: [{ s: { text: s, color: color2 } }, text] },
      },
    },
  });

  const polyline = (name, points, position, s = '', location = 'outside') => ({
    name,
    method: 'collections.polyline',
    options: {
      points,
      close: true,
      angle: {
        color: color1,
        curve: {
          radius: 0.16,
          width: 0.01,
        },
        2: {
          curve: { num: 2, step: 0.03 },
        },
        1: {
          curve: { num: 3, step: 0.03 },
        },
      },
      side: [
        label('C', s, location),
        label('A', s, location),
        label('B', s, location),
      ],
      position,
    },
  });

  figure.add({
    name: 'similar',
    method: 'collection',
    elements: [
      polyline('tri1', tri1Points, [-2.5, 0.2], ''),
      polyline('tri2', tri2Points, [-2.5, -1.1], 's'),
      {
        name: 'eqn',
        method: 'collections.equation',
        options: {
          elements: {
            s_1: { color: color2 },
            s_2: { color: color2 },
            s_3: { color: color2 },
            s_4: { color: color2 },
            strk1: { symbol: 'strike', lineWidth: 0.006 },
            strk2: { symbol: 'strike', lineWidth: 0.006 },
            equals: '  =  ',
            equals2: '  =  ',
          },
          phrases: {
            s3: { strike: ['s_3', 'strk1'] },
            s4: { strike: ['s_4', 'strk2'] },
          },
          forms: {
            blank: [],
            sAsB: { scale: [[['s_1', 'A'], ['s_2', 'B']], 0.6 / 0.7] },
            sAOnsB: { frac: [['s_1', 'A'], 'v1_vinculum', ['s_2', 'B']] },
            sAOnsBEquals: [
              { frac: [['s_1', 'A'], 'v1', ['s_2', 'B']] },
              'equals',
              { frac: [['s_3', 'A_2'], 'v2_vinculum', ['s_4', 'B_2']] },
            ],
            sAOnsBSimplify1: [
              { frac: [['s_1', 'A'], 'v1', ['s_2', 'B']] },
              'equals',
              { frac: [['s3', 'A_1'], 'v2', ['s4', 'B_1']] },
            ],
            sAOnsBSimplify2: [
              { frac: [['s_1', 'A'], 'v1', ['s_2', 'B']] },
              'equals',
              { frac: [['s3', 'A_1'], 'v2', ['s4', 'B_1']] },
              'equals2',
              { frac: ['A_2', 'v3_vinculum', 'B_2'] },
            ],
            AOnB: [
              { frac: [['s_1', 'A'], 'v1', ['s_2', 'B']] },
              'equals',
              { frac: ['A_2', 'v3', 'B_2'] },
            ],
          },
          scale: 0.9,
          position: [1, -0.9],
        },
      },
    ],
    // mods: {
    //   scenarios: {
    //     default: { scale: 1 },
    //   },
    // },
  });

  const similar = figure.getElement('similar');
  const tri1 = figure.getElement('similar.tri1');
  const tri2 = figure.getElement('similar.tri2');
  const pulseScale = () => {
    tri2.pulse({
      elements: ['side01.label.s', 'side12.label.s', 'side20.label.s'],
      xAlign: 'right',
    });
  };
  const pulseCorrespondingAngles = () => {
    similar.stop();
    similar.animations.new()
      .trigger({
        duration: 1,
        callback: () => similar.pulse({ elements: ['tri1.angle0', 'tri2.angle0'] }),
      })
      .trigger({
        duration: 1,
        callback: () => similar.pulse({ elements: ['tri1.angle1', 'tri2.angle1'] }),
      })
      .trigger({
        duration: 1,
        callback: () => similar.pulse({ elements: ['tri1.angle2', 'tri2.angle2'] }),
      })
      .start();
  };

  const eqn = figure.getElement('similar.eqn');
  const [s1, s2, A, B] = eqn.getElements(['s_1', 's_2', 'A', 'B']);
  const animateEqn = () => {
    eqn.stop();
    eqn.showForm('blank');
    eqn.animations.new()
      .trigger({
        callback: () => {
          tri2.pulse({
            elements: ['side12.label.s', 'side12.label.A'],
            centerOn: 'side12.label.A',
          });
          tri2.pulse({
            elements: ['side20.label.s', 'side20.label.B'],
            centerOn: 'side20.label.B',
          });
        },
        duration: 1,
      })
      .trigger(() => {
        eqn.showForm('sAsB');
        // This is needed as the hidden s1, s2, A, B elements don't have a most
        // recent lastDrawTransform with the updated eqn position
        figure.setFirstTransform();
        s1.setPositionToElement(tri2._side12._label._s);
        s2.setPositionToElement(tri2._side20._label._s);
        A.setPositionToElement(tri2._side12._label._A);
        B.setPositionToElement(tri2._side20._label._B);
      })
      .goToForm({ target: 'sAOnsB', animate: 'move', duration: 2 })
      .goToForm({ delay: 0.5, target: 'sAOnsBSimplify1', animate: 'move' })
      .goToForm({ delay: 0.5, target: 'sAOnsBSimplify2', animate: 'move' })
      .goToForm({ delay: 1, target: 'AOnB', animate: 'move', duration: 1 })
      .trigger({
        callback: () => {
          tri1.pulse({ elements: ['side12.label.A', 'side20.label.B'], scale: 2.5 });
          eqn.pulse({ elements: ['A_2', 'B_2'], centerOn: 'v3' });
        },
        duration: 1,
      })
      .start();
    figure.animateNextFrame();
  };

  figure.fnMap.global.add('similarPulseAngles', pulseCorrespondingAngles);
  figure.fnMap.global.add('similarAnimateEqn', animateEqn);
  figure.fnMap.global.add('similarPulseScale', pulseScale);


  const summary = (name, position, text, modifiers = {}) => ({
    name,
    method: 'primitives.textLines',
    options: {
      text,
      modifiers,
      position,
      fixColor: true,
      font: { size: 0.15, color: colText },
    },
    mods: {
      isTouchable: true,
    },
  });
  similar.add([
    summary('summary1', [0.2, 0.6], 'Equal corresponding |angles|', {
      angles: {
        font: { color: color1 },
        onClick: 'similarPulseAngles',
        touchBorder: 0.08,
      },
    }),
    summary('summary2', [0.2, 0.2], [
      'Equally |scaled| corresponding sides',
    ], {
      scaled: {
        font: { color: color2 },
        onClick: 'similarPulseScale',
        touchBorder: 0.1,
      },
    }),
    summary('summary3', [0.2, -0.2], [
      'Equal corresponding side |ratios|',
    ], {
      ratios: {
        onClick: 'similarAnimateEqn',
        font: { color: color1 },
        touchBorder: 0.08,
      },
    }),
  ]);
  eqn.showForm('AOnB');
}
