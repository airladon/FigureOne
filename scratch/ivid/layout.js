/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */

function layout() {
  const centerText = (name, text, modifiers = {}) => ({
    name,
    method: 'textLines',
    options: {
      text,
      modifiers,
      position: [0, 0],
      xAlign: 'center',
      justify: 'left',
      yAlign: 'middle',
      font: { size: 0.2, color: [0.3, 0.3, 0.3, 1] },
      fixColor: true,
    },
    mods: {
      scenarios: {
        default: { position: [0, 0], scale: 1 },
        top: { position: [0, 1], scale: 1 },
      },
    },
  });

  figure.add([
    {
      name: 'title',
      method: 'textLines',
      options: {
        text: [
          'Sin, Cos & Tan',
          {
            text: 'Where do they come from?',
            font: { size: 0.1 },
          },
        ],
        position: [0, 1],
        xAlign: 'center',
        justify: 'center',
        font: { size: 0.2, color: [0.3, 0.3, 0.3, 1] },
        fixColor: true,
      },
    },
    centerText('background', 'Background'),
    centerText('sumOfAngles', 'Angles in a triangle always add to 180\u00b0'),
    centerText('similarTriangles', 'Similar Triangles'),
  ]);
  figure.add({
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      nextButton: { position: [3.8, 0], width: 0.2, height: 0.2 },
      prevButton: { position: [-3.8, 0], width: 0.2, height: 0.2 },
    },
  });
  figure.add({
    name: 'cursor',
    method: 'collections.cursor',
    options: {
      color: [0.5, 0.5, 0, 0.7],
    },
    mods: {
      isShown: false,
    },
  });
}
const totalAngle = totalAngleLayout();
layoutRight();
layoutCircle();
similarLayout();
layout();

function makeSlides() {
  const slides = [];

  const nav = figure.getElement('nav');
  const rightTri = figure.getElement('rightTri');
  const circle = figure.getElement('circle');

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
    show: ['circle', 'title'],
    scenario: 'title',
    steadyState: () => {
      circle.getElement('line').setRotation(0.87);
    },
  });

  slides.push({ show: ['background'] });

  /*
  ..######..##.....##.##.....##
  .##....##.##.....##.###...###
  .##.......##.....##.####.####
  ..######..##.....##.##.###.##
  .......##.##.....##.##.....##
  .##....##.##.....##.##.....##
  ..######...#######..##.....##
  */
  slides.push({
    scenario: 'default',
    show: ['sumOfAngles'],
  });

  slides.push({
    show: ['sumOfAngles'],
    scenario: ['default', 'top'],
    transition: (done) => {
      figure.getElement('sumOfAngles').animations.new()
        .scenario({ start: 'default', target: 'top', duration: 10 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      // figure.getElement('sumOfAngles').animations.new()
      //   .scenario({ start: 'default', target: 'top', duration: 10 })
      //   .trigger(() => {
      //     figure.getElement('sumOfAngles').setScenario('top');
      //     figure.show(['totalAngle.tri', 'totalAngle.eqn']);
      //   })
      //   .whenFinished(done)
      //   .start();
      figure.getElement('sumOfAngles').setScenario('top');
      figure.show(['totalAngle.tri', 'totalAngle.eqn']);
      figure.shortCuts['1'] = 'totalAnglePulse';
      figure.shortCuts['2'] = 'totalAngleGoToAB';
    },
  });

  /*
  ..######..####.##.....##.####.##..........###....########.
  .##....##..##..###...###..##..##.........##.##...##.....##
  .##........##..####.####..##..##........##...##..##.....##
  ..######...##..##.###.##..##..##.......##.....##.########.
  .......##..##..##.....##..##..##.......#########.##...##..
  .##....##..##..##.....##..##..##.......##.....##.##....##.
  ..######..####.##.....##.####.########.##.....##.##.....##
  */
  slides.push({ scenario: 'default', show: ['similarTriangles'] });

  slides.push({
    show: ['similarTriangles'],
    scenario: ['default', 'top'],
    transition: (done) => {
      figure.getElement('similarTriangles').animations.new()
        .scenario({ start: 'default', target: 'top', duration: 0.9 })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      figure.getElement('similarTriangles').setScenario('top');
      figure.show(['similar.tri1', 'similar.tri2']);
      figure.shortCuts['1'] = 'similarPulseAngles';
      figure.shortCuts['2'] = 'similarPulseScale';
    },
  });

  // slides.push({
  //   show: ['similarTriangles', 'similar.tri1', 'similar.tri2', 'similar.eqn'],
  //   scenario: ['default', 'top'],
  //   transition: (done) => {
  //     figure.fnMap.exec()
  //   },
  //   // steadyState: () => {
  //   //   figure.shortCuts['1'] = 'similarPulseAngles';
  //   //   figure.shortCuts['2'] = 'similarPulseScale';
  //   //   figure.shortCuts['3'] = 'similarAnimateEqn';
  //   // },
  // });

  slides.push({ show: ['similar'] });
  // slides.push({ show: ['similar.tri1', 'similar.tri2'] });

  nav.loadSlides(slides);
  // nav.goToSlide(0)
}
makeSlides();