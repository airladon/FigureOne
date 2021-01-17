/* globals figure */

function slides() {
  const nav = figure.getElement('nav');
  const medium = figure.getElement('medium');

  const slides = [];

  slides.push({
    showCommon: ['medium'],
    scenario: ['default'],
    steadyState: () => {
      medium.custom.movePad.setMovable(true);
    },
  });
  nav.loadSlides(slides);
}

slides();