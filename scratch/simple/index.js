const figure = new Fig.Figure({ limits: [-2, -2, 4, 4] });
const { imageToShapes } = Fig.tools.morph;

const micImage = new Image();
micImage.src = './mic.png';
const headphonesImage = new Image();
headphonesImage.src = './headphones.png';

let index = 0;
const loaded = () => {
  index += 1;
  if (index < 2) {
    return;
  }

  const [mic, micColors] = imageToShapes({
    image: micImage,
    width: 0.7,
    filter: c => c[3] > 0,
  });

  const [headphones, headphoneColors] = imageToShapes({
    image: headphonesImage,
    width: 0.7,
    filter: c => c[3] > 0,
    num: mic.length / 6 / 2,
  });

  const m = figure.add({
    make: 'morph',
    points: [mic, headphones],
    color: [micColors, headphoneColors],
  });

  const a = figure.add({
    make: 'polygon',
    sides: 5,
    radius: 0.5,
    position: [0, 0, 0.5],
    color: [0.7, 0.7, 0.7, 1],
  });

  m.animations.new()
    .delay(1)
    .morph({ start: 0, target: 1, duration: 30 })
    .start();
  // m.animations.new()
  //   .rotation({ target: [Math.PI / 3, Math.PI / 3, 0], duration: 2 })
  //   .start();
};

micImage.onload = loaded.bind(this);
headphonesImage.onload = loaded.bind(this);
