/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */

function layout() {
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
      },
    },
  ]);
  figure.add({
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      nextButton: { position: [2.7, -1.1] },
      prevButton: { position: [-2.7, -1.1] },
    },
  });
}
totalAngleLayout();
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
  scenario: 'title',
  enterState: () => {
    circle.getElement('line').setRotation(0.87);
  },
});

nav.loadSlides(slides);


// figure.getElement('similar').hide();
// figure.getElement('totalAngle').hide();
// figure.getElement('circle').hide();
