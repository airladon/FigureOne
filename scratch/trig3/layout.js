/* eslint-disable camelcase, object-curly-newline */
/* globals figure, layoutCirc, makeEquation */

function layout() {
  // figure.add([
  //   centerText('title', 'The Trigonometric Functions', {}, [0, 1]),
  //   centerText('subTitle', 'An interactive video', {}, [0, 0.7], 0.1),
  //   leftText('background1', 'Similar Triangles', {}, [-1.8, 0], 0.2, {
  //     default: { position: [-1.8, 0] },
  //     center: { position: [-0.5, 0] },
  //   }),
  //   leftText('background2', 'Similar Triangles  \u2192  Right Angle Triangles', {}, [-1.8, 0]),
  // ]);
  figure.add({
    name: 'cursor',
    method: 'collections.cursor',
    options: {
      color: [0, 0.5, 1, 0.7],
    },
    mods: {
      isShown: false,
    },
  });
}
layoutCirc();
makeEquation();
// t2 = performance.now()
// console.log('t2', t2 - t1)
// layoutLines();
// t3 = performance.now()
// console.log('t3', t3 - t2)
// layoutRight();
// t4 = performance.now()
// console.log('t4', t4 - t3)
layout();
// t5 = performance.now()
// console.log('t5', t5 - t4)
// similarLayout();
// t6 = performance.now()
// console.log('t6', t6 - t5)

function makeSlides() {
  figure.add({
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      nextButton: { position: [3.8, 0], width: 0.2, height: 0.2 },
      prevButton: { position: [-3.8, 0], width: 0.2, height: 0.2 },
      equation: ['eqn', 'similar.eqn', 'circ.eqn'],
      // equationDefaults: { duration: 4 },
    },
  });
// }
  const slides = [];

  const nav = figure.getElement('nav');
  // const circ = figure.getElement('circ');
  // const eqn = figure.getElement('eqn');

  /*
  .########.####.########.##.......########
  ....##.....##.....##....##.......##......
  ....##.....##.....##....##.......##......
  ....##.....##.....##....##.......######..
  ....##.....##.....##....##.......##......
  ....##.....##.....##....##.......##......
  ....##....####....##....########.########
  */
  slides.push({
    scenario: 'reset',
    enterState: 'reset',
    showCommon: 'circ',
  });

  nav.loadSlides(slides);
  nav.goToSlide(0);
}
makeSlides();

// const circ = figure.elements._circ;
// circ.
// figure.fnMap.exec('reset');
// figure.elements._eqn.hide();