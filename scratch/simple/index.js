/* globals Fig */
const figure = new Fig.Figure();


// figure.fnMap.add('toConsole', s => console.log(s));
// figure.fnMap.exec('toConsol', 'hello');

figure.add([
  {
    name: 'text',
    method: 'text',
    options: { text: 'hello' },
  },
  {
    name: 'ellipse',
    method: 'ellipse',
    options: { width: 1, height: 0.2, position: [0, 0], color: [1, 0, 0, 1], line: { width: 0.01 } },
  },
  {
    name: 'polygon2',
    method: 'polygon',
    options: { radius: 0.5, position: [-0.2, 0], color: [1, 0, 0, 1] },
  },
  {
    name: 'polygon3',
    method: 'polygon',
    options: { radius: 0.5, position: [0.2, 0], color: [1, 0, 0, 0.5] },
  },

]);
figure.add(
  {
    name: 'flower',
    method: 'rectangle',
    options: {
      width: 1.8,
      height: 1.333,
      corner: { radius: 0.1, sides: 10 },
      texture: {
        src: 'gradient.png',
        mapTo: [-1, -0.667, 2, 1.333],
      },
    },
  },
);
figure.elements.animations.new()
  .delay(0.1)
  .dissolveIn(0.1)
  .start();
// // Figure has two squares and a slide navigator. Slides will dissolve in,
// // dissolve out, move and rotate squares
// const [sq1, sq2] = figure.add([
//   {
//     name: 'sq1',
//     method: 'primitives.rectangle',
//     options: {
//       width: 0.4, height: 0.4, position: [-0.5, 0.5],
//     },
//   },
//   {
//     name: 'sq2',
//     method: 'primitives.rectangle',
//     options: {
//       width: 0.4, height: 0.4, position: [0.5, 0.5],
//     },
//   },
//   {
//     name: 'nav',
//     method: 'collections.slideNavigator',
//   },
// ]);

// // Helper function to set position and rotation of sq1 and sq2
// const setPositionAndRotation = (sq1Pos, sq1Rot, sq2Pos, sq2Rot) => {
//   sq1.setPosition(sq1Pos);
//   sq1.setRotation(sq1Rot);
//   sq2.setPosition(sq2Pos);
//   sq2.setRotation(sq2Rot);
// };

// // Add slides to the navigator
// figure.getElement('nav').loadSlides([
//   {
//     show: 'sq1',
//   },
//   // Slide 1
//   {
//     showCommon: 'sq1',
//     enterStateCommon: () => setPositionAndRotation([-0.5, 0.5], 0, [0.5, 0.5], 0),
//   },

//   // Slide 2
//   {
//     transition: { in: 'sq2' },
//   },

//   // Slide 3
//   // When using animation objects, the targets of animations will be
//   // automatically set at steady state, so user does not need to set them
//   {
//     showCommon: ['sq1', 'sq2'],
//     transition: { position: 'sq2', target: [0.3, 0.5], duration: 1 },
//   },

//   // Slide 4
//   // Use an array of animation object definitions to create a sequence of steps
//   {
//     enterState: () => setPositionAndRotation([-0.5, 0.5], 0, [0.3, 0.5], 0),
//     transition: [
//       { position: 'sq1', target: [-0.3, 0.5], duration: 1 },
//       { rotation: 'sq1', target: Math.PI / 4, duration: 1 },
//       { rotation: 'sq2', target: Math.PI / 4, duration: 1 },
//     ],
//   },

//   // Slide 5
//   // Use an array within an array to create parallel steps
//   {
//     enterState: () => setPositionAndRotation([-0.3, 0.5], Math.PI / 4, [0.3, 0.5], Math.PI / 4),
//     transition: [
//       [
//         { rotation: 'sq1', target: 0, duration: 1 },
//         { rotation: 'sq2', target: 0, duration: 1 },
//       ],
//       [
//         { position: 'sq1', target: [-0.5, 0.5], duration: 1 },
//         { position: 'sq2', target: [0.5, 0.5], duration: 1 },
//       ],
//       { out: ['sq1', 'sq2'] },
//     ],
//   },
// ]);
