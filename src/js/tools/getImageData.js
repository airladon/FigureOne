// @flow

export default function getImageData(image: Image) {
  const imageWidth = image.width;
  const imageHeight = image.height;
  const canvas = document.createElement('canvas');
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, imageWidth, imageHeight).data;
}
