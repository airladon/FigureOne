/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */


function layoutBow() {
  const radius = 1.1;
  const angle = 0.8;
  const lineWidth = 0.012;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  const [bow] = figure.add({
    name: 'bow',
    method: 'collection',
    elements: [
      {
        name: 'x',
        method: 'primitives.line',
        options: {
          p1: [-radius, 0],
          p2: [radius, 0],
          dash: [0.01, 0.005],
          width: 0.006,
          color: colGrey,
        },
      },
      {
        name: 'y',
        method: 'primitives.line',
        options: {
          p1: [0, -radius],
          p2: [0, radius],
          dash: [0.01, 0.005],
          width: 0.006,
          color: colGrey,
        },
      },
      {
        name: 'circle',
        method: 'primitives.polygon',
        options: {
          radius,
          line: { width: 0.006 },
          sides: 100,
          color: colGrey,
        },
      },
      {
        name: 'arc',
        method: 'primitives.polygon',
        options: {
          radius,
          rotation: -angle,
          line: { width: lineWidth },
          sides: 300,
          angleToDraw: angle * 2,
          color: color1,
        },
      },
      {
        name: 'hyp',
        method: 'collections.line',
        options: {
          p1: [0, 0],
          p2: [x, y],
          width: lineWidth,
          color: color1,
        },
      },
      // {
      //   name: 'negHyp',
      //   method: 'line',
      //   options: {
      //     p1: [0, 0],
      //     p2: [x, -y],
      //     width: lineWidth,
      //     color: color1,
      //   },
      // },
      {
        name: 'cos',
        method: 'collections.line',
        options: {
          p2: [0, 0],
          p1: [x, 0],
          width: lineWidth,
          color: color1,
        },
        mods: {
          scenarios: { final: { position: [x, 0] } },
        },
      },
      {
        name: 'bowString',
        method: 'collections.line',
        options: {
          p1: [x, y],
          p2: [x, -y],
          width: lineWidth,
          color: color1,
        },
      },
      {
        name: 'rightAngle',
        method: 'collections.angle',
        options: {
          p1: [x, y],
          p2: [x, 0],
          p3: [0, 0],
          curve: {
            width: lineWidth,
            autoRightAngle: true,
            radius: 0.2,
          },
          color: color1,
        },
      },
      {
        name: 'theta',
        method: 'collections.angle',
        options: {
          p1: [x, 0],
          p2: [0, 0],
          p3: [x, y],
          curve: {
            width: lineWidth,
            autoRightAngle: true,
            radius: 0.2,
          },
          label: {
            text: '\u03b8',
            offset: 0.01,
          },
          color: color1,
        },
      },
      {
        name: 'sin',
        method: 'collections.line',
        options: {
          p2: [x, 0],
          p1: [x, y],
          width: lineWidth,
          color: color1,
        },
      },
      {
        name: 'eqn',
        method: 'equation',
        options: {
          elements: { comma: ', ' },
          forms: {
            0: 'bowstring',
            1: ['half - ', 'bowstring'],
            2: 'sinus',
            3: 'sine',
            4: ['sine', 'comma', 'sin'],
          },
          color: color1,
          position: [0.9, 0.8],
          scale: 1,
          formDefaults: {
            alignment: { yAlign: 'baseline', xAlign: 'left' },
          },
        },
      },
    ],
  });
  const eqn = bow.getElement('eqn');
  figure.fnMap.global.add('bowString', () => {
    bow.showOnly(['circle', 'bowString']);
    bow.getElement('bowString').animations.new()
      .length({ start: 0, duration: 1.5 })
      .then(eqn.animations.goToForm({ start: null, target: '0', duration: 1 }))
      .start();
  });
  figure.fnMap.global.add('bow', () => {
    bow.showOnly(['circle', 'bowString', 'arc']);
    const arc = bow.getElement('arc');
    eqn.showForm('0');
    arc.animations.new()
      .custom({
        callback: (p) => {
          arc.angleToDraw = p * angle * 2;
        },
        duration: 1,
      })
      .start();
  });
  figure.fnMap.global.add('bowRad', () => {
    bow.showOnly(['circle', 'x', 'y', 'hyp']);
    eqn.showForm('0');
    bow.getElement('hyp').animations.new()
      .length({ start: 0, duration: 1 })
      .start();
  });
  figure.fnMap.global.add('bowCircle', () => {
    bow.showOnly(['circle', 'bowString', 'arc']);
    eqn.showForm('0');
    bow.animations.new()
      .inParallel([
        bow.getElement('bowString').animations.dissolveOut(0.8),
        bow.getElement('arc').animations.dissolveOut(0.8),
      ])
      .inParallel([
        bow.getElement('x').animations.dissolveIn(0.8),
        bow.getElement('y').animations.dissolveIn(0.8),
      ])
      .start();
  });
  figure.fnMap.global.add('bowTri', () => {
    bow.showOnly(['circle', 'x', 'y', 'hyp', 'sin', 'cos']);
    const [sin, cos, rightAngle] = bow.getElements(['sin', 'cos', 'rightAngle']);
    cos.setEndPoints([x, y], [0, y]);
    bow.animations.new()
      .inParallel([
        sin.animations.length({ start: 0, duration: 2 }),
        cos.animations.length({ start: 0, duration: 2 }),
      ])
      .then(cos.animations.position({ target: [x, 0], duration: 2 }))
      .then(rightAngle.animations.dissolveIn(0.6))
      .start();
  });
  figure.fnMap.global.add('bowSin', () => {
    bow.showOnly(['circle', 'x', 'y', 'hyp', 'sin', 'cos', 'rightAngle']);
    bow.highlight(['sin']);
  });
}
