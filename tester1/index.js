const figure = new Fig.Figure({
  limits: [-2, -1.5, 4, 3], color: [0.5, 0.5, 0.5, 1],
});

// const button = (name, position, label) => ({
//   name,
//   method: 'collections.rectangle',
//   options: {
//     width: 0.4,
//     height: 0.2,
//     line: { width: 0.005 },
//     corner: { radius: 0.03, sides: 5 },
//     button: true,
//     position,
//     label,
//   },
//   mods: { isTouchable: true, touchBorder: 0.1 },
// });

// figure.add([
//   {
//     name: 'description',
//     method: 'primitives.textLines',
//     options: {
//       font: { color: [0.5, 0.5, 0.5, 1], size: 0.1, weight: 100 },
//       xAlign: 'center',
//       yAlign: 'middle',
//       position: [0, -1],
//       lineSpace: 0.15,
//     },
//     mods: {
//       isTouchable: true,
//     },
//   },
//   button('nextButton', [1.5, -1], 'Next'),
//   button('prevButton', [-1.5, -1], 'Prev'),
// ]);
figure.add({
  name: 'nav',
  method: 'collections.slideNavigator',
  options: {
    // color: [1, 0, 0, 1],
    prevButton: { position: [-0.5, -1] },
    nextButton: { position: [0.5, -1] },
    text: { position: [0, 0.5] },
  },
});

// const nav = figure.getElement('nav');
figure.getElement('nav').setSlides([
  { text: 'hello' },
  { text: 'there' },
]);
