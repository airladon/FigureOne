/* eslint-disable camelcase, object-curly-newline */
/* globals figure, layoutCirc, makeEquation */

function layout() {
  figure.addCursor({ color: [0, 0.5, 1, 0.7], radius: 0.15 });
}

/*
Execute all figure element creation at the same time. If it is executed in each
respective file, then there is a delay between each as the next file is loaded.
As a result, the figure is constructed in patches, with everything shown before
the slideNavigator kicks in and hides and positions everything to start.
*/
layoutCirc();
makeEquation();
layout();

function makeSlides() {
  figure.add({
    name: 'nav',
    make: 'collections.slideNavigator',
    options: {
      nextButton: { position: [3.8, 0], width: 0.2, height: 0.2 },
      prevButton: { position: [-3.8, 0], width: 0.2, height: 0.2 },
      equation: ['eqn', 'similar.eqn'],
      text: null,
    },
  });
  const slides = [];

  const nav = figure.getElement('nav');

  figure.fnMap.add('addReference', () => {
    figure.recorder.addCurrentStateAsReference();
  });
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
    showCommon: 'geom',
    exec: [
      ['0:19.8', 'pulseSinTri'],
      ['0:19.8', 'pulseTanTri'],
      ['0:19.8', 'pulseCotTri'],
      ['0:32.5', 'pulseRightAngles'],
      ['0:41.3', 'pulseSinTri'],
      ['0:44.5', 'eqnSinCosOne'],
      ['0:50', 'eqnTanSecOne'],
      ['0:54', 'eqnCotCscOne'],
      ['1:00', 'pulseSinTheta'],
      ['1:00', 'pulseTanTheta'],
      ['1:00', 'pulseCotTheta'],
      ['1:00', 'pulseRightAngles'],
      ['1:08', 'eqnOppAdj'],
      ['1:13', 'pulseSin'],
      ['1:14', 'pulseCos'],
      ['1:17', 'pulseTan'],
      ['1:17.7', 'pulseTanUnit'],
      ['1:21.5', 'pulseCotUnit'],
      ['1:22.3', 'pulseCot'],
      ['1:28', 'eqnHypAdj'],
      ['1:32', 'eqnHypOpp'],
      ['2:16', 'addReference'],
      ['2:41.8', 'pulseSin'],
      ['2:42.5', 'pulseCos'],
      ['3:06', 'eqnCoord'],
      ['3:39', 'addReference'],
      ['3:45', 'eqnLim'],
      ['4:13', 'addReference'],
      ['4:30', 'addReference'],
      ['5:20', 'eqnCotTanCscSec'],
      ['5:35', 'preset5'],
      ['5:41', 'preset4'],
      ['5:50', 'preset3'],
    ],
  });


  nav.loadSlides(slides);
  nav.goToSlide(0);

  figure.recorder.loadVideoTrack(window.location.href.replace(/\/tests.index.html|\/index.html|\/tests\/$|\/$/, '/video-track.json'));
  figure.recorder.loadAudioTrack(new Audio(window.location.href.replace(/\/tests.index.html|\/index.html|\/tests\/$|\/$/, '/audio-track.mp3')));
}
makeSlides();

// figure.get('geom.triCotCsc.rotRight').setColor([1, 0, 0, 0.5])