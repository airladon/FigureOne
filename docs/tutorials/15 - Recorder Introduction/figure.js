/* globals Fig */
const figure = new Fig.Figure();

// Add movable ball to figure
figure.add({
  name: 'ball',
  make: 'primitives.polygon',
  radius: 0.3,
  sides: 100,
  color: [1, 0, 0, 1],
  move: {
    bounds: {
      left: -0.7, bottom: -0.7, top: 0.7, right: 0.7,
    },
  },
});

figure.addCursor();

// // Load audio, states and events data
figure.recorder.loadAudioTrack(new Audio('http://localhost:8080/docs/tutorials/15%20-%20Recorder%20Introduction/audio-track.mp3'));
figure.recorder.loadVideoTrack('http://localhost:8080/docs/tutorials/15%20-%20Recorder%20Introduction/video-track.json');
