/* eslint-disable camelcase */
/* globals Fig */

function similarLayout() {
  const scale1 = 1;
  const scale2 = 1.6;
  const scale3 = 2.2;
  const tri1Points = [[0, 0], [0.4 * scale1, 0.5 * scale1], [0.8 * scale1, 0]];
  const tri2Points = [[0, 0], [0.4 * scale2, 0.5 * scale2], [0.8 * scale2, 0]];
  const tri3Points = [[0, 0], [0.4 * scale3, 0.5 * scale3], [0.8 * scale3, 0]];

  const label = (text, color) => ({
    label: {
      scale: 0.8,
      offset: 0.04,
      location: 'outside',
      color,
      text,
      // text: {
      //   forms: { 0: [{ s: { text: s, color } }, text] },
      // },
    },
  });

  const polyline = (name, points, position, label1, label2, label3) => ({
    name,
    method: 'collections.polyline',
    options: {
      points,
      close: true,
      angle: {
        color: colTheta,
        curve: {
          radius: 0.16,
          width: 0.01,
        },
        0: {
          curve: { num: 2, step: 0.03 },
          color: colAdj,
        },
        1: {
          curve: { num: 3, step: 0.03 },
          color: colHyp,
        },
        2: {
          color: colOpp,
        },
      },
      side: [
        label(label3, colHyp),
        label(label1, colOpp),
        label(label2, colAdj),
      ],
      position,
    },
  });

  const cont = content => ({ container: { content, width: 0.2 } });
  figure.add({
    name: 'similar',
    method: 'collection',
    elements: [
      polyline('tri1', tri1Points, [-2.5, -0.4], 'A', 'B', 'C'),
      polyline('tri2', tri2Points, [-1.2, -0.4], 'D', 'E', 'F'),
      polyline('tri3', tri3Points, [0.6, -0.4], 'G', 'H', 'I'),
      {
        name: 'eqn',
        method: 'collections.equation',
        options: {
          elements: {
            eq1: '  =  ',
            eq2: '  =  ',
            A: { color: colOpp },
            B: { color: colAdj },
            C: { color: colHyp },
            D: { color: colOpp },
            E: { color: colAdj },
            F: { color: colHyp },
            G: { color: colOpp },
            H: { color: colAdj },
            I: { color: colHyp },
          },
          forms: {
            AB: [
              { frac: [cont('A'), 'v1_vinculum', cont('B')] },
              'eq1',
              { frac: [cont('D'), 'v2_vinculum', cont('E')] },
              'eq2',
              { frac: [cont('G'), 'v3_vinculum', cont('H')] },
            ],
            BC: [
              { frac: [cont('B'), 'v1', cont('C')] },
              'eq1',
              { frac: [cont('E'), 'v2', cont('F')] },
              'eq2',
              { frac: [cont('H'), 'v3', cont('I')] },
            ],
            CA: [
              { frac: [cont('C'), 'v1', cont('A')] },
              'eq1',
              { frac: [cont('F'), 'v2', cont('D')] },
              'eq2',
              { frac: [cont('I'), 'v3', cont('G')] },
            ],
            BA: [
              { frac: [cont('B'), 'v1', cont('A')] },
              'eq1',
              { frac: [cont('E'), 'v2', cont('D')] },
              'eq2',
              { frac: [cont('H'), 'v3', cont('G')] },
            ],
            CB: [
              { frac: [cont('C'), 'v1', cont('B')] },
              'eq1',
              { frac: [cont('F'), 'v2', cont('E')] },
              'eq2',
              { frac: [cont('I'), 'v3', cont('H')] },
            ],
            AC: [
              { frac: [cont('A'), 'v1', cont('C')] },
              'eq1',
              { frac: [cont('D'), 'v2', cont('F')] },
              'eq2',
              { frac: [cont('G'), 'v3', cont('I')] },
            ],
          },
          scale: 1.2,
          position: [0, -1.2],
          formDefaults: { alignment: { xAlign: 'center' } },
        },
      },
    ],
  });

  const similar = figure.getElement('similar');
  const tri1 = figure.getElement('similar.tri1');
  const tri2 = figure.getElement('similar.tri2');
  // const pulseScale = () => {
  //   tri2.pulse({
  //     elements: ['side01.label.s', 'side12.label.s', 'side20.label.s'],
  //     xAlign: 'right',
  //   });
  // };
  // const pulseCorrespondingAngles = () => {
  //   similar.stop();
  //   similar.animations.new()
  //     .trigger({
  //       duration: 1,
  //       callback: () => similar.pulse({ elements: ['tri1.angle0', 'tri2.angle0'] }),
  //     })
  //     .trigger({
  //       duration: 1,
  //       callback: () => similar.pulse({ elements: ['tri1.angle1', 'tri2.angle1'] }),
  //     })
  //     .trigger({
  //       duration: 1,
  //       callback: () => similar.pulse({ elements: ['tri1.angle2', 'tri2.angle2'] }),
  //     })
  //     .start();
  // };

  const eqn = figure.getElement('similar.eqn');
  // const [s1, s2, A, B] = eqn.getElements(['s_1', 's_2', 'A', 'B']);
  // const animateEqn = () => {
  //   eqn.stop();
  //   eqn.showForm('blank');
  //   eqn.animations.new()
  //     .trigger({
  //       callback: () => {
  //         tri2.pulse({
  //           elements: ['side12.label.s', 'side12.label.A'],
  //           centerOn: 'side12.label.A',
  //         });
  //         tri2.pulse({
  //           elements: ['side20.label.s', 'side20.label.B'],
  //           centerOn: 'side20.label.B',
  //         });
  //       },
  //       duration: 1,
  //     })
  //     .trigger(() => {
  //       eqn.showForm('sAsB');
  //       // This is needed as the hidden s1, s2, A, B elements don't have a most
  //       // recent lastDrawTransform with the updated eqn position
  //       figure.setFirstTransform();
  //       s1.setPositionToElement(tri2._side12._label._s);
  //       s2.setPositionToElement(tri2._side20._label._s);
  //       A.setPositionToElement(tri2._side12._label._A);
  //       B.setPositionToElement(tri2._side20._label._B);
  //     })
  //     .goToForm({ target: 'sAOnsB', animate: 'move', duration: 2 })
  //     .goToForm({ delay: 0.5, target: 'sAOnsBSimplify1', animate: 'move' })
  //     .goToForm({ delay: 0.5, target: 'sAOnsBSimplify2', animate: 'move' })
  //     .goToForm({ delay: 1, target: 'AOnB', animate: 'move', duration: 1 })
  //     .trigger({
  //       callback: () => {
  //         tri1.pulse({ elements: ['side12.label.A', 'side20.label.B'], scale: 2.5 });
  //         eqn.pulse({ elements: ['A_2', 'B_2'], centerOn: 'v3' });
  //       },
  //       duration: 1,
  //     })
  //     .start();
  //   figure.animateNextFrame();
  // };

  // figure.fnMap.global.add('similarPulseAngles', pulseCorrespondingAngles);
  // figure.fnMap.global.add('similarAnimateEqn', animateEqn);
  // figure.fnMap.global.add('similarPulseScale', pulseScale);

  figure.fnMap.global.add('similarToggleRatios', () => {
    const t = 0.2;
    const form = eqn.getCurrentForm().name;
    // if (form === 'AB') {
    //   eqn.goToForm({ form: 'BC', animate: 'move', duration: t * 2 });
    //   similar.animations.new()
    //     .inParallel([
    //       similar._tri1._side12.animations.dissolveOut(t),
    //       similar._tri2._side12.animations.dissolveOut(t),
    //       similar._tri3._side12.animations.dissolveOut(t),
    //     ])
    //     .inParallel([
    //       similar._tri1._side01.animations.dissolveIn(t),
    //       similar._tri2._side01.animations.dissolveIn(t),
    //       similar._tri3._side01.animations.dissolveIn(t),
    //     ])
    //     .start();
    //   similar.hide(['tri1.side12', 'tri2.side12', 'tri3.side12']);
    // } else if (form === 'BC') {
    //   eqn.goToForm({ form: 'CA', animate: 'move', duration: t * 2 });
    //   similar.animations.new()
    //     .inParallel([
    //       similar._tri1._side20.animations.dissolveOut(t),
    //       similar._tri2._side20.animations.dissolveOut(t),
    //       similar._tri3._side20.animations.dissolveOut(t),
    //     ])
    //     .inParallel([
    //       similar._tri1._side12.animations.dissolveIn(t),
    //       similar._tri2._side12.animations.dissolveIn(t),
    //       similar._tri3._side12.animations.dissolveIn(t),
    //     ])
    //     .start();
    // } else if (form === 'CA') {
    //   eqn.goToForm({ form: 'BA', animate: 'move', duration: t * 2 });
    //   similar.animations.new()
    //     .inParallel([
    //       similar._tri1._side01.animations.dissolveOut(t),
    //       similar._tri2._side01.animations.dissolveOut(t),
    //       similar._tri3._side01.animations.dissolveOut(t),
    //     ])
    //     .inParallel([
    //       similar._tri1._side20.animations.dissolveIn(t),
    //       similar._tri2._side20.animations.dissolveIn(t),
    //       similar._tri3._side20.animations.dissolveIn(t),
    //     ])
    //     .start();
    // } else if (form === 'BA') {
    //   eqn.goToForm({ form: 'CB', animate: 'move', duration: t * 2 });
    //   similar.animations.new()
    //     .inParallel([
    //       similar._tri1._side12.animations.dissolveOut(t),
    //       similar._tri2._side12.animations.dissolveOut(t),
    //       similar._tri3._side12.animations.dissolveOut(t),
    //     ])
    //     .inParallel([
    //       similar._tri1._side01.animations.dissolveIn(t),
    //       similar._tri2._side01.animations.dissolveIn(t),
    //       similar._tri3._side01.animations.dissolveIn(t),
    //     ])
    //     .start();
    // } else if (form === 'CB') {
    //   eqn.goToForm({ form: 'AC', animate: 'move', duration: t * 2 });
    //   similar.animations.new()
    //     .inParallel([
    //       similar._tri1._side20.animations.dissolveOut(t),
    //       similar._tri2._side20.animations.dissolveOut(t),
    //       similar._tri3._side20.animations.dissolveOut(t),
    //     ])
    //     .inParallel([
    //       similar._tri1._side12.animations.dissolveIn(t),
    //       similar._tri2._side12.animations.dissolveIn(t),
    //       similar._tri3._side12.animations.dissolveIn(t),
    //     ])
    //     .start();
    // } else {
    //   eqn.goToForm({ form: 'AB', animate: 'move', duration: t * 2 });
    //   similar.animations.new()
    //     .inParallel([
    //       similar._tri1._side01.animations.dissolveOut(t),
    //       similar._tri2._side01.animations.dissolveOut(t),
    //       similar._tri3._side01.animations.dissolveOut(t),
    //     ])
    //     .inParallel([
    //       similar._tri1._side20.animations.dissolveIn(t),
    //       similar._tri2._side20.animations.dissolveIn(t),
    //       similar._tri3._side20.animations.dissolveIn(t),
    //     ])
    //     .start();
    // }
    if (form === 'AB') {
      eqn.stop('complete');
      similar.stop('complete');
      eqn.goToForm({ form: 'BA', animate: 'move', duration: t * 2 });
      similar.animations.new()
        // .inParallel([
        //   similar._tri1._side01.animations.dissolveOut(t),
        //   similar._tri2._side01.animations.dissolveOut(t),
        //   similar._tri3._side01.animations.dissolveOut(t),
        // ])
        // .inParallel([
        //   similar._tri1._side20.animations.dissolveIn(t),
        //   similar._tri2._side20.animations.dissolveIn(t),
        //   similar._tri3._side20.animations.dissolveIn(t),
        // ])
        // .start();
    } else if (form === 'BA') {
      eqn.stop('complete');
      similar.stop('complete');
      eqn.goToForm({ form: 'BC', animate: 'move', duration: t * 2 });
      similar.animations.new()
        .inParallel([
          similar._tri1._side12.animations.dissolveOut(t),
          similar._tri2._side12.animations.dissolveOut(t),
          similar._tri3._side12.animations.dissolveOut(t),
        ])
        .inParallel([
          similar._tri1._side01.animations.dissolveIn(t),
          similar._tri2._side01.animations.dissolveIn(t),
          similar._tri3._side01.animations.dissolveIn(t),
        ])
        .start();
      similar.hide(['tri1.side12', 'tri2.side12', 'tri3.side12']);
    } else if (form === 'BC') {
      eqn.stop('complete');
      similar.stop('complete');
      eqn.goToForm({ form: 'CB', animate: 'move', duration: t * 2 });
      // similar.animations.new()
      //   .inParallel([
      //     similar._tri1._side12.animations.dissolveOut(t),
      //     similar._tri2._side12.animations.dissolveOut(t),
      //     similar._tri3._side12.animations.dissolveOut(t),
      //   ])
      //   .inParallel([
      //     similar._tri1._side01.animations.dissolveIn(t),
      //     similar._tri2._side01.animations.dissolveIn(t),
      //     similar._tri3._side01.animations.dissolveIn(t),
      //   ])
      //   .start();
    } else if (form === 'CB') {
      eqn.stop('complete');
      similar.stop('complete');
      eqn.goToForm({ form: 'CA', animate: 'move', duration: t * 2 });
      similar.animations.new()
        .inParallel([
          similar._tri1._side20.animations.dissolveOut(t),
          similar._tri2._side20.animations.dissolveOut(t),
          similar._tri3._side20.animations.dissolveOut(t),
        ])
        .inParallel([
          similar._tri1._side12.animations.dissolveIn(t),
          similar._tri2._side12.animations.dissolveIn(t),
          similar._tri3._side12.animations.dissolveIn(t),
        ])
        .start();
    } else if (form === 'CA') {
      eqn.stop('complete');
      similar.stop('complete');
      eqn.goToForm({ form: 'AC', animate: 'move', duration: t * 2 });
      // similar.animations.new()
      //   .inParallel([
      //     similar._tri1._side20.animations.dissolveOut(t),
      //     similar._tri2._side20.animations.dissolveOut(t),
      //     similar._tri3._side20.animations.dissolveOut(t),
      //   ])
      //   .inParallel([
      //     similar._tri1._side12.animations.dissolveIn(t),
      //     similar._tri2._side12.animations.dissolveIn(t),
      //     similar._tri3._side12.animations.dissolveIn(t),
      //   ])
      //   .start();
    } else {
      eqn.stop('complete');
      similar.stop('complete');
      eqn.goToForm({ form: 'AB', animate: 'move', duration: t * 2 });
      similar.animations.new()
        .inParallel([
          similar._tri1._side01.animations.dissolveOut(t),
          similar._tri2._side01.animations.dissolveOut(t),
          similar._tri3._side01.animations.dissolveOut(t),
        ])
        .inParallel([
          similar._tri1._side20.animations.dissolveIn(t),
          similar._tri2._side20.animations.dissolveIn(t),
          similar._tri3._side20.animations.dissolveIn(t),
        ])
        .start();
    }
    
  });

  const summary = (name, position, text, modifiers = {}) => ({
    name,
    method: 'primitives.textLines',
    options: {
      text,
      modifiers,
      position,
      fixColor: true,
      font: { size: 0.18, color: colText },
      xAlign: 'center',
    },
    mods: {
      isTouchable: true,
    },
  });
  similar.add([
    summary('allAngles', [0, 1.1], 'Triangles with the same set of angles are similar'),
    summary('allRatios', [0, 1.1], [
      'Similar triangles have |equal| corresponding side ratios',
    ], {
      equal: {
        font: { color: color1 },
        onClick: 'similarToggleRatios',
        touchBorder: 0.1,
      },
    }),
  ]);
  eqn.showForm('AOnB');
}
