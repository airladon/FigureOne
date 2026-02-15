class DrawContext2D {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  ratio: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d')!;

    const bsr = (this.ctx as any).webkitBackingStorePixelRatio
              || (this.ctx as any).mozBackingStorePixelRatio
              || (this.ctx as any).msBackingStorePixelRatio
              || (this.ctx as any).oBackingStorePixelRatio
              || (this.ctx as any).backingStorePixelRatio || 1;

    let dpr = window.devicePixelRatio || 1;
    if (dpr === 1) {
      dpr = 2;
    }

    if (typeof bsr === 'number') {
      this.ratio = dpr / bsr;
    } else {
      this.ratio = 1;
    }
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
