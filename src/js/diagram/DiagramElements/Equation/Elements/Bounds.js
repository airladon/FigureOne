// @flow
import { joinObjects } from '../../../../tools/tools';

type TypeBounds = {
  width: number;
  height: number;
  ascent: number;
  descent: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
};
export default class Bounds {
  width: number;
  height: number;
  ascent: number;
  descent: number;
  top: number;
  bottom: number;
  left: number;
  right: number;

  constructor(boundsIn: {
    width?: number;
    height?: number;
    ascent?: number;
    descent?: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  } = {}) {
    const defaultBounds = {
      width: 0,
      height: 0,
      ascent: 0,
      descent: 0,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };
    const bounds = joinObjects(defaultBounds, boundsIn);
    this.copyFrom(bounds);
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
    if (from.left != null) {
      this.left = from.left;
    }
    if (from.right != null) {
      this.right = from.right;
    }
    if (from.top != null) {
      this.top = from.top;
    }
    if (from.bottom != null) {
      this.bottom = from.bottom;
    }
  }

  growWithSameBaseline(newBounds: TypeBounds) {
    const baseline = this.bottom + this.descent;
    if (newBounds.left < this.left) {
      this.left = newBounds.left;
    }
    if (newBounds.right > this.right) {
      this.right = newBounds.right;
    }
    if (newBounds.top > this.top) {
      this.top = newBounds.top;
    }
    if (newBounds.bottom < this.bottom) {
      this.bottom = newBounds.bottom;
    }
    this.width = this.right - this.left;
    this.height = this.top - this.bottom;
    this.ascent = this.top - baseline;
    this.descent = baseline - this.bottom;
  }
}
