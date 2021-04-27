/* globals Fig */
const figure = new Fig.Figure();

// Add movable ball to figure
figure.add({
  name: 'ball',
  method: 'primitives.polygon',
  options: {
    radius: 0.3,
    sides: 100,
    color: [1, 0, 0, 1],
  },
  mods: {
    isMovable: true,
    move: { bounds: 'figure' },
  },
});

figure.addCursor();

const ball = figure.getElement('ball');

figure.fnMap.add('pulseBall', () => {
  ball.pulse({ scale: 1.4, duration: 1.5 });
});

figure.fnMap.add('centerBall', () => {
  ball.stop();
  ball.animations.new()
    .position({ target: [0, 0], duration: 1 })
    .start();
});

figure.shortcuts = {
  1: 'pulseBall',
  2: 'centerBall',
};


// // Load audio, states and events data
figure.recorder.loadAudioTrack(new Audio('http://localhost:8080/docs/tutorials/16%20-%20Recording%20Manual%20Events/audio-track.mp3'));
figure.recorder.loadVideoTrack('http://localhost:8080/docs/tutorials/16%20-%20Recording%20Manual%20Events/video-track.json');
