
class DrawContext2D {
  constructor(width, height) {
    this.ratio = 2;
    this.canvas = {
      width: width * this.ratio,
      height: height * this.ratio,
      offsetWidth: width,
      offsetHeight: height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
      },
    };
    this.ctx = {
      save: () => {},
      restore: () => {},
      scale: () => {},
      font: () => {},
      textAlign: () => {},
      textBaseline: () => {},
      clearRect: () => {},
      canvas: {
        width,
        height,
      },
      filledText: {
        text: '',
        x: null,
        y: null,
        count: 0,
      },
      fillText: (text, x, y) => {
        this.ctx.filledText.text = text;
        this.ctx.filledText.x = x;
        this.ctx.filledText.y = y;
        this.ctx.filledText.count += 1;
      },
      transformMatrix: [0],
      measureText: () => {    // eslint-disable-line arrow-body-style
        return {
          actualBoundingBoxLeft: 10,
          actualBoundingBoxAscent: 10,
          actualBoundingBoxRight: 10,
          actualBoundingBoxDescent: 10,
          width: 20,
        };
      },
      transform: (a, b, c, d, e, f) => {
        this.ctx.transformMatrix = [a, b, c, d, e, f];
      },
    };
  }
}

export default DrawContext2D;
