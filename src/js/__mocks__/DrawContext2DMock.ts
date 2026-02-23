
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
    this.resize = () => {};
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
      measureText: (text) => {    // eslint-disable-line arrow-body-style
        let w = 20;
        const len = text.length;
        if (this.ctx.font != null) {
          const fontHeight = this.ctx.font.match(/[^ ]*px/);
          w = parseFloat(fontHeight[0]) / 2;
        }
        return {
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: w / 2,
          actualBoundingBoxRight: w / 2,
          actualBoundingBoxDescent: w / 2,
          width: w * len,
        };
      },
      transform: (a, b, c, d, e, f) => {
        this.ctx.transformMatrix = [a, b, c, d, e, f];
      },
    };
  }
}

export default DrawContext2D;
