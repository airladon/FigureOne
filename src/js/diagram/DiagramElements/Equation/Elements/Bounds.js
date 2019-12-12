// @flow
export default class Bounds {
  width: number;
  height: number;
  ascent: number;
  descent: number;
  constructor() {
    this.width = 0;
    this.height = 0;
    this.ascent = 0;
    this.descent = 0;
  }

  copyFrom(from: Object) {
    if (from.width != null) {
      this.width = from.width;
    }
    if (from.height != null) {
      this.height = from.height;
    }
    if (from.ascent != null) {
      this.ascent = from.ascent;
    }
    if (from.descent != null) {
      this.descent = from.descent;
    }
  }
}
