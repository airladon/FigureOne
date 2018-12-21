// @flow

class DrawContext2D {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  ratio: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

    /* $FlowFixMe */
    const bsr = this.ctx.webkitBackingStorePixelRatio
              /* $FlowFixMe */
              || this.ctx.mozBackingStorePixelRatio
              /* $FlowFixMe */
              || this.ctx.msBackingStorePixelRatio
              /* $FlowFixMe */
              || this.ctx.oBackingStorePixelRatio
              /* $FlowFixMe */
              || this.ctx.backingStorePixelRatio || 1;

    let dpr = window.devicePixelRatio || 1;
    if (dpr === 1) {
      dpr = 2;
    }

    this.ratio = dpr / bsr;
    this.resize();
  }

  resize() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.canvas.width = this.canvas.clientWidth * this.ratio;
    this.canvas.height = this.canvas.clientHeight * this.ratio;
    this.ctx.scale(this.ratio, this.ratio);
  }

  _dup() {
    return this;
  }
}

export default DrawContext2D;
