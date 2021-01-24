/* global __title __frames __duration __timeStep */
__title = 'Example - Velocity Frequency Wavelength';
__duration = 11;
__timeStep = 1;
// __frames = [
//   [0],
//   [0.5, 'touchDown', [2.75, 1.5], 'Next'],
//   [0, 'touchUp'],
// ];
__frames = [];
for (let i = 0; i < 70 + 34; i += 1) {
  __frames.push([0.1, 'touchDown', [2.75, 1.5], 'Next']);
  __frames.push([0, 'touchUp']);
}
