/* eslint-disable camelcase */
/* globals figure, colTheta, colHyp, colOpp, colAdj, colText, color1 */

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
      {
        name: 'tris',
        method: 'collection',
        elements: [
          polyline('tri1', tri1Points, [-2.5, -0.4], 'A', 'B', 'C'),
          polyline('tri2', tri2Points, [-1.2, -0.4], 'D', 'E', 'F'),
          polyline('tri3', tri3Points, [0.6, -0.4], 'G', 'H', 'I'),
        ],
        mods: {
          scenarios: {
            similarLarge: { scale: 1, position: [0, 0] },
            similarSmall: { scale: 0.8, position: [0, 0.2] },
          },
        },
      },
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
          position: [0, -1],
          formDefaults: { alignment: { xAlign: 'center' } },
        },
      },
    ],
  });

  const similar = figure.getElement('similar');
  const eqn = figure.getElement('similar.eqn');

  /*
  .########.....###....########.####..#######...######.
  .##.....##...##.##......##.....##..##.....##.##....##
  .##.....##..##...##.....##.....##..##.....##.##......
  .########..##.....##....##.....##..##.....##..######.
  .##...##...#########....##.....##..##.....##.......##
  .##....##..##.....##....##.....##..##.....##.##....##
  .##.....##.##.....##....##....####..#######...######.
  */
  const t = 0.2;
  const elements = {
    C: ['tri1._side01', 'tri2._side01', 'tri3._side01'],
    A: ['tri1._side12', 'tri2._side12', 'tri3._side12'],
    B: ['tri1._side20', 'tri2._side20', 'tri3._side20'],
  };
  const goToEqn = (form, outElements, inElements) => {
    eqn.stop('complete');
    similar.stop('complete');
    eqn.goToForm({
      form, animate: 'move', duration: t * 2, dissolveOutTime: t, dissolveInTime: t, blankTime: 0,
    });
    similar._tris.animations.new()
      .dissolveOut({ elements: elements[outElements], duration: t })
      .dissolveIn({ elements: elements[inElements], duration: t })
      .start();
  };
  figure.fnMap.global.add('similarToggleRatios', () => {
    const form = eqn.getCurrentForm().name;
    if (form === 'AB') {
      goToEqn('CB', 'A', 'C');
    } else if (form === 'CB') {
      goToEqn('CA', 'B', 'A');
    } else if (form === 'CA') {
      goToEqn('BA', 'C', 'B');
    } else if (form === 'BA') {
      goToEqn('BC', 'A', 'C');
    } else if (form === 'BC') {
      goToEqn('AC', 'B', 'A');
    } else if (form === 'AC') {
      goToEqn('AB', 'C', 'B');
    }
  });

  /*
  .########.########.##.....##.########
  ....##....##........##...##.....##...
  ....##....##.........##.##......##...
  ....##....######......###.......##...
  ....##....##.........##.##......##...
  ....##....##........##...##.....##...
  ....##....########.##.....##....##...
  */
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

