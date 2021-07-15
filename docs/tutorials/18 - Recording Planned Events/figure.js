/* globals Fig */
const figure = new Fig.Figure();

// Add movable ball and triangle to figure
const [ball] = figure.add([
  {
    name: 'ball',
    make: 'polygon',
    radius: 0.3,
    sides: 100,
    color: [1, 0, 0, 1],
    move: {
      bounds: {
        left: 1, bottom: 1, top: 1, right: 1,
      },
    },
  },
  {
    name: 'triangle',
    make: 'triangle',
    width: 0.5,
    height: 0.5,
    color: [0.5, 0.5, 1, 1],
    move: {
      bounds: {
        left: 1, bottom: 1, top: 1, right: 1,
      },
    },
  },
]);

figure.addCursor();

const nav = figure.addSlideNavigator({
  nextButton: null, prevButton: null, text: null,
});

figure.fnMap.add('pulseBall', () => ball.pulse({ scale: 1.4 }));

nav.loadSlides([
  {
    show: 'ball',
    exec: ['0:01.2', 'pulseBall'],
  },
  {
    time: '0:06',
    transition: [
      { out: 'ball' },
      { in: 'triangle' },
    ],
  },
]);


figure.recorder.loadAudioTrack(new Audio('http://localhost:8080/docs/tutorials/18%20-%20Recording%20Planned%20Events/audio-track.mp3'));
figure.recorder.loadVideoTrack('http://localhost:8080/docs/tutorials/18%20-%20Recording%20Planned%20Events/video-track.json');
