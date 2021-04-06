/* eslint-disable camelcase, object-curly-newline */
/* globals figure makeEquation, layoutRight, centerText, leftText */

const figure = new Fig.Figure({
  limits: [-3, -1.5, 6, 3],
  color: [0.3, 0.3, 0.3, 1],
  font: { size: 0.1 },
  dimColor: [0.5, 0.5, 0.5, 1],
});

function layout() {
  figure.add({
    name: 'gridMinor',
    method: 'grid',
    options: {
      xStep: 0.1,
      yStep: 0.1,
      line: { width: 0.005 },
      color: [0.8, 0.8, 0.8, 1],
      bounds: { left: -3, bottom: -2, width: 6, height: 4 },
    },
  });
  figure.add({
    name: 'gridMajor',
    method: 'grid',
    options: {
      xStep: 0.5,
      yStep: 0.5,
      line: { width: 0.008 },
      color: [0.5, 0.5, 0.5, 1],
      bounds: { left: -3, bottom: -2, width: 6, height: 4 },
    },
  });
  figure.add({
    name: 'ball',
    method: 'polygon',
    options: {
      radius: 0.5,
      sides: 10,
      line: { width: 0.01 },
      position: [-2, 0],
      color: [1, 0, 0, 1],
    },
  });
  figure.add({
    name: 'cursor',
    method: 'collections.cursor',
    options: {
      color: [0, 0.5, 1, 0.7],
      radius: 0.15,
    },
    mods: {
      isShown: false,
    },
  });
}
layout();

function makeSlides() {
  figure.add({
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      nextButton: { position: [3.8, 0], width: 0.2, height: 0.2 },
      prevButton: { position: [-3.8, 0], width: 0.2, height: 0.2 },
    },
  });
  const slides = [];

  const nav = figure.getElement('nav');
  const addReference = true;
  // /*
  // .########..####..######...##.....##.########....########.########..####
  // .##.....##..##..##....##..##.....##....##..........##....##.....##..##.
  // .##.....##..##..##........##.....##....##..........##....##.....##..##.
  // .########...##..##...####.#########....##..........##....########...##.
  // .##...##....##..##....##..##.....##....##..........##....##...##....##.
  // .##....##...##..##....##..##.....##....##..........##....##....##...##.
  // .##.....##.####..######...##.....##....##..........##....##.....##.####
  // */
  slides.push({
    addReference,
    showCommon: ['ball', 'gridMinor', 'gridMajor'],
  });
  slides.push({
    time: 1,
    transition: [
      { position: 'ball', target: [2, 0], duration: 3, progression: 'linear' },
    ],
  });
  nav.loadSlides(slides);
  nav.goToSlide(0);

  // figure.recorder.fetchAndLoad('./ivid_data.json');
  figure.recorder.loadAudio(new Audio('./audio.mp3'));
}
makeSlides();
