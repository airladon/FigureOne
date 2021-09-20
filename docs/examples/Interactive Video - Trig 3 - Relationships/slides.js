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

  figure.fnMap.global.add('trueASDF', () => {
    window.asdf = true;
    console.log('here');
    /*
    geom.triCotCsc.rotRight
    Point {_type: "point", x: 0.0566666661, y: 0.4600000023, z: 0}
    Point {_type: "point", x: 0.47708493545383934, y: -0.38400000171263615, z: 0}
    Point {_type: "point", x: 0.49890290739469745, y: -0.39999999999999997, z: 0}
    Point {_type: "point", x: 0.49890290739469745, y: 0.050000000000000044, z: 0}
    Point {_type: "point", x: 0.04890290739469744, y: -0.3999999999999999, z: 0}

    [3.0000000300000003, -0, -0, 0, -0, 1.4999999925, -0, 0, -0, -0, -4.9500000495, 0, 0, 0, 0, 1]

    [1, -0, -0, 0.30708493545383936, -3.5897930298416118e-9, -1, -0, 0.30599999889762863, 0, 0, 1, 0, 0, 0, 0, 1]

    0: (4) ["s", 1, 1, 1]
1: (2) ["r", 0]
2: (4) ["t", 0, 0, 0]
3: (4) ["s", -1, 1, 1]
4: (2) ["r", 3.14159265]
5: (4) ["t", -0.3070849326053024, 0.306, 0]
6: (4) ["s", 1, 1, 1]
7: (2) ["r", 0]
8: (4) ["t", 0, 0, 0]
9: (4) ["s", 1, 1, 1]
10: (2) ["r", 0]
11: (4) ["t", 0, 0, 0]
geom.triCotCsc.rotTheta
    */

    /*
    0: (4) ["s", 1, 1, 1]
1: (2) ["r", 0]
2: (4) ["t", -0.9978058189282798, -0.39999999999999997, 0]
3: (4) ["s", -1, 1, 1]
4: (2) ["r", 3.141592653589793]
5: (4) ["t", -0.3070849322825582, 0.30599999999999994, 0]
6: (4) ["s", 1, 1, 1]
7: (2) ["r", 0]
8: (4) ["t", 0, 0, 0]
9: (4) ["s", 1, 1, 1]
10: (2) ["r", 0]
11: (4) ["t", 0, 0, 0]
    [3.0000000000000004, -0, -0, 0, -0, 1.5000000000000002, -0, 0, -0, -0, -4.95, 0, 0, 0, 0, 1]
[1, -0, -0, 0.4532829487645487, -1.2246467991473532e-16, -1, -0, 0.3059999999999999, 0, 0, 1, 0, 0, 0, 0, 1]

    geom.triCotCsc.rotTheta
    Point {_type: "point", x: 0.05666666666666667, y: 0.45999999999999996, z: 0}
    Point {_type: "point", x: 0.6232829487645488, y: -0.3840000000000002, z: 0}
    Point {_type: "point", x: -0.9978058189282798, y: -0.39999999999999997, z: 0}
    Point {_type: "point", x: -0.44780581892827975, y: -0.39999999999999997, z: 0}
    Point {_type: "point", x: -0.5686964600473896, y: -0.0559576216207785, z: 0}






    Play:
    glToFigure
      [3.0000000300000003, -0, -0, 0, -0, 1.4999999925, -0, 0, -0, -0, -4.9500000495, 0, 0, 0, 0, 1]
    FigureToDraw0:
      [1, -0, -0, 0.30708493545383936, -3.5897930298416118e-9, -1, -0, 0.30599999889762863, 0, 0, 1, 0, 0, 0, 0, 1]
      getFigureTransform: [1, -3.5897930298416118e-9, 0, -0.3070849326053024, -3.5897930298416118e-9, -1, 0, 0.306, 0, 0, 1, 0, 0, 0, 0, 1] 
    Transform:
      0: (4) ["s", 1, 1, 1]
      1: (2) ["r", 0]
      2: (4) ["t", 0, 0, 0]
      3: (4) ["s", -1, 1, 1]
      4: (2) ["r", 3.14159265]
      5: (4) ["t", -0.3070849326053024, 0.306, 0]
      6: (4) ["s", 1, 1, 1]
      7: (2) ["r", 0]
      8: (4) ["t", 0, 0, 0]
      9: (4) ["s", 1, 1, 1]
      10: (2) ["r", 0]
      11: (4) ["t", 0, 0, 0]

    Transform:
      0: (4) ["s", 1, 1, 1]
      1: (2) ["r", 0]
      2: (4) ["t", 0, 0, 0]
    Matrix:
      [3.0000000300000003, 0, 0, 0.30708493545383936, -1.0769379197218627e-8, -1.4999999925, 0, 0.30599999889762863, 0, 0, -4.9500000495, 0, 0, 0, 0, 1]
    geom.triCotCsc.rotRight
    glLocation: [0.0566666661, 0.4600000023]
    vertexLocation: [0.47708493545383934, -0.38400000171263615]
    borders[0]: [0.49890290739469745, -0.39999999999999997]
    borders[1]: [0.49890290739469745, 0.050000000000000044]
    borders[2]: [0.04890290739469744, -0.3999999999999999]


    Record States:
    glToFigure
      [3.0000000000000004, -0, -0, 0, -0, 1.5000000000000002, -0, 0, -0, -0, -4.95, 0, 0, 0, 0, 1]
    FigureToDraw0:
      [1, -0, -0, 0.4532829487645487, -1.2246467991473532e-16, -1, -0, 0.3059999999999999, 0, 0, 1, 0, 0, 0, 0, 1]
    getFigureTransform: [1, -1.2246467991473532e-16, 0, -0.3070849322825582, -1.2246467991473532e-16, -1, 0, 0.30599999999999994, 0, 0, 1, 0, 0, 0, 0, 1] 
    Transform:
      0: (4) ["s", 1, 1, 1]
      1: (2) ["r", 0]
      2: (4) ["t", 0, 0, 0]
      3: (4) ["s", -1, 1, 1]
      4: (2) ["r", 3.141592653589793]
      5: (4) ["t", -0.3070849322825582, 0.30599999999999994, 0]
      6: (4) ["s", 1, 1, 1]
      7: (2) ["r", 0]
      8: (4) ["t", 0, 0, 0]
      9: (4) ["s", 1, 1, 1]
      10: (2) ["r", 0]
      11: (4) ["t", 0, 0, 0]

    Transform:
      0: (4) ["s", 1, 1, 1]
      1: (2) ["r", 0]
      2: (4) ["t", 0, 0, 0]
    Matrix:
      [3.0000000000000004, 0, 0, 0.4532829487645487, -3.6739403974420604e-16, -1.5000000000000002, 0, 0.3059999999999999, 0, 0, -4.95, 0, 0, 0, 0, 1]
    geom.triCotCsc.rotRight
    glLocation: [0.05666666666666667, 0.45999999999999996]
    vertexLocation: [0.6232829487645488, -0.3840000000000002]
    borders[0]: [-0.9978058189282798, -0.39999999999999997]
    borders[1]: [-0.44780581892827975, -0.39999999999999997]
    borders[2]: [-0.5686964600473896, -0.0559576216207785]
    */
  });
  figure.fnMap.global.add('falseASDF', () => window.asdf = false);

  nav.loadSlides(slides);
  nav.goToSlide(0);

  figure.recorder.loadVideoTrack(window.location.href.replace(/\/tests.index.html|\/index.html|\/tests\/$|\/$/, '/video-track.json'));
  figure.recorder.loadAudioTrack(new Audio(window.location.href.replace(/\/tests.index.html|\/index.html|\/tests\/$|\/$/, '/audio-track.mp3')));
}
makeSlides();

// figure.get('geom.triCotCsc.rotRight').setColor([1, 0, 0, 0.5])