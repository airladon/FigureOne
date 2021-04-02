/* global __duration __frames __timeStep __title*/

__title = 'Example - Trig 1';
__duration = 6;
__timeStep = 0.5;
__frames = [
  // [0, 'figure.recorder.audio = null'],
  [0, `
figure.recorder.audio = null;
figure.recorder.startPlayback();
/*
figure.recorder.fetchAndLoad('http://localhost:8080/docs/examples/Trig%201%20-%20Trig%20Functions/ivid_data.json');
setTimeout(500, () => {
  figure.recorder.startPlayback();
});
*/
`],
  // [0.5, 'figure.recorder.startPlayback();'],
];
