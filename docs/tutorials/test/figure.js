/* globals Fig */
const figure = new Fig.Figure();

// Add movable ball to figure
const [ball1, ball2, ball3] = figure.add([
  {
    name: 'ball1',
    method: 'primitives.polygon',
    options: {
      radius: 0.2,
      sides: 100,
      color: [1, 0, 0, 1],
      position: [-0.5, 0],
    },
    mods: {
      isMovable: true,
      move: { bounds: 'figure' },
    },
  },
  {
    name: 'ball2',
    method: 'primitives.polygon',
    options: {
      radius: 0.2,
      sides: 100,
      color: [0, 0, 1, 1],
      position: [0.5, 0],
    },
    mods: {
      isMovable: true,
      move: { bounds: 'figure' },
    },
  },
  {
    name: 'ball3',
    method: 'primitives.polygon',
    options: {
      radius: 0.2,
      sides: 100,
      color: [0, 0.6, 0, 1],
      position: [0, 0],
    },
    mods: {
      isMovable: true,
      move: { bounds: 'figure' },
    },
  },
]);

// ball1.subscriptions.add('setTransform', () => {
//   console.log(ball1.getPosition().round(4));
// })

figure.addCursor();

// const ball = figure.getElement('ball');

// figure.fnMap.add('pulseBall', () => {
//   ball.pulse({ scale: 1.4, duration: 1.5 });
// });

// figure.fnMap.add('centerBall', () => {
//   ball.stop();
//   ball.animations.new()
//     .position({ target: [0, 0], duration: 1 })
//     .start();
// });

// figure.shortcuts = {
//   1: 'pulseBall',
//   2: 'centerBall',
// };


// // Load audio, states and events data
figure.recorder.loadAudioTrack(new Audio('http://localhost:8080/docs/tutorials/16%20-%20Recording%20Manual%20Events/audio-track.mp3'));
figure.recorder.loadVideoTrack('./video-track.json');
