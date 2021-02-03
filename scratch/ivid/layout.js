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
    // {
    //   name: 'background',
    //   method: 'textLines',
    //   options: {
    //     text: [
    //       'Background:',
    //       {
    //         text: '  \u2022 Angles in a triangle always sum to 180\u00b0',
    //         lineSpace: 0.3,
    //       },
    //       {
    //         text: '  \u2022 Similar Triangles',
    //         lineSpace: 0.3,
    //         // font: { size: 0.1 },
    //       },
    //     ],
    //     position: [0, 0],
    //     xAlign: 'center',
    //     justify: 'left',
    //     yAlign: 'middle',
    //     font: { size: 0.2, color: [0.3, 0.3, 0.3, 1] },
    //   },
    // },
  ]);
  figure.add({
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      nextButton: { position: [2.7, -1.1] },
      prevButton: { position: [-2.7, -1.1] },
    },
  });
  figure.add({
    name: 'cursor',
    method: 'collections.cursor',
    options: {
      color: [1, 0.6, 0.6, 0.7],
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


const slides = [];

const nav = figure.getElement('nav');
const rightTri = figure.getElement('rightTri');
const circle = figure.getElement('circle');

slides.push({
  show: ['circle', 'title'],
  scenarioCommon: 'title',
  enterState: () => {
    circle.getElement('line').setRotation(0.87);
    console.log('asdf')
  },
});

slides.push({ show: ['background'] });
slides.push({
  show: ['sumOfAngles'],
});
slides.push({
  show: ['totalAngle.tri', 'totalAngle.eqn'],
  steadyState: () => {
    figure.shortCuts['1'] = 'totalAnglePulse';
  },
});
slides.push({
  show: ['totalAngle'],
  hide: ['totalAngle.border', 'totalAngle.close'],
  steadyState: () => {
    figure.shortCuts['1'] = 'totalAngleGoToABC';
    figure.shortCuts['2'] = 'totalAnglePulse';
    figure.shortCuts['3'] = 'totalAngleGoToAB';
  },
});
slides.push({ show: ['similarTriangles'] });
slides.push({ show: ['similar.tri1', 'similar.tri2'] });

nav.loadSlides(slides);
console.log(nav)

// figure.getElement('similar').hide();
// figure.getElement('totalAngle').hide();
// figure.getElement('circle').hide();
