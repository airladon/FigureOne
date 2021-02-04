/* eslint-disable camelcase */
/* globals color1 */

function rightTris() {
  const label = (text, s = '', location = 'outside') => ({
    label: {
      scale: 0.7,
      offset: 0.04,
      location,
      text: {
        forms: { 0: [{ s: { text: s, color: color1 } }, text] },
      },
    },
  });

  const polyline = (name, scale, position, s) => ({
    name,
    method: 'collections.polyline',
    options: {
      points: [[0, 0], [scale, scale * 0.7], [scale, 0]],
      close: true,
      width: 0.008,
      angle: [
        {
          curve: null,
          label: { text: '', scale: 0.6 },
          color: [0, 0, 0, 0],
        },
        { curve: { radius: 0.1 * scale, width: 0.006, autoRightAngle: true }, label: '' },
        {
          curve: {
            radius: 0.2, width: 0.006,
          },
          label: { text: '\u03b8', scale: 0.6, offset: 0.02 },
          color: color1,
        },
      ],
      side: [
        label('hypotenuse', s),
        label('opposite', s),
        label('adjacent', s),
      ],
      position,
    },
    // mods: {
    //   scenarios: {
    //     default: { position },
    //     center: { position: [-1, -0.5] },
    //   },
    // },
  });

  figure.add({
    name: 'rightTris',
    method: 'collection',
    elements: [
      polyline('tri1', 1.8, [0, -0.8], ''),
      polyline('tri2', 1.2, [-1.8, -0.8], ''),
    ],
    mods: {
      hideSides: () => {
        figure.getElement('rightTris.tri1').hideSides();
        figure.getElement('rightTris.tri2').hideSides();
      },
    },
  });
}
