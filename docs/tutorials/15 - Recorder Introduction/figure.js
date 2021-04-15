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

// // Load audio, states and events data
figure.recorder.loadAudio(new Audio('./audio-track.mp3'));
figure.recorder.fetchAndLoad('./video-track.json');
