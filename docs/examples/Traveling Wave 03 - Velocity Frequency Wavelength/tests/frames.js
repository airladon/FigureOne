/* global __title __frames __duration __timeStep */
__title = 'Example - Velocity Frequency Wavelength';
__duration = 54;
// __duration = 5;
__timeStep = 0.5;
// __frames = [
//   [0],
//   [0.5, 'touchDown', [2.75, 1.5], 'Next'],
//   [0, 'touchUp'],
// ];
__frames = [[0,
`
layout.time.setGetNow(() => new Fig.GlobalAnimation().now() / 1000);
layout.reset();
const medium = figure.getElement('medium');
layout.unpause();
medium.custom.recording.reset((timeStep, num) => {
  const y = Array(num);
  for (let i = 0; i < num; i += 1) {
    y[i] = 0.6 * 0.8 * Math.sin(2 * Math.PI * 0.2 * (timeStep * i) + Math.PI);
  }
  return y.reverse();
});
`]];
for (let i = 0; i < 70 + 34; i += 1) {
  __frames.push([0.5, 'touchDown', [2.75, 1.5], 'Next']);
  __frames.push([0.1, 'touchUp']);
}
