// @flow
import {
  Point,
} from '../../../tools/g2';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';
// // Equation is a class that takes a set of drawing objects (TextObjects,
// // FigureElementPrimitives or FigureElementCollections and HTML Objects
// // and arranges their size in a )

export default class Fraction extends BaseEquationFunction {
  calcSize(location: Point, incomingScale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const [vinculum] = this.glyphs;
    const [numerator, denominator] = this.contents;
    const {
      scaleModifier, numeratorSpace, denominatorSpace, overhang,
      offsetY, fullContentBounds, baseline,
    } = this.options;
    const scale = incomingScale * scaleModifier;
    const vinculumBounds = new Bounds();
    const numeratorBounds = new Bounds();
    const denominatorBounds = new Bounds();
    const fullBounds = new Bounds();
    if (numerator != null) {
      numerator.calcSize(loc._dup(), scale);
      numeratorBounds.copyFrom(numerator.getBounds(fullContentBounds));
    }

    if (denominator != null) {
      denominator.calcSize(loc._dup(), scale);
      denominatorBounds.copyFrom(denominator.getBounds(fullContentBounds));
    }

    this.location = location._dup();


    vinculumBounds.width = Math.max(
      numeratorBounds.width, denominatorBounds.width,
    ) + overhang * 2 * scale;

    if (vinculum != null) {
      vinculumBounds.height = vinculum.getHeight(
        vinculum._custom.options, vinculumBounds.width,
      );
    }

    const lineVAboveBaseline = scale * offsetY / scaleModifier;

    const numeratorLoc = new Point(
      loc.x + (vinculumBounds.width - numeratorBounds.width) / 2,
      loc.y + lineVAboveBaseline + vinculumBounds.height
        + numeratorSpace * scale + numeratorBounds.descent,
    );
    const denominatorLoc = new Point(
      loc.x + (vinculumBounds.width - denominatorBounds.width) / 2,
      loc.y + lineVAboveBaseline - denominatorSpace * scale
        - denominatorBounds.ascent,
    );

    let baselineOffset = 0;
    if (baseline === 'numerator' && numerator != null) {
      baselineOffset = loc.y - numeratorLoc.y;
    } else if (baseline === 'denominator' && denominator != null) {
      baselineOffset = loc.y - denominatorLoc.y;
    }

    if (numerator != null) {
      numerator.offsetLocation(
        numeratorLoc.sub(numerator.location.x, numerator.location.y - baselineOffset),
      );
    }
    if (denominator != null) {
      denominator.offsetLocation(
        denominatorLoc.sub(denominator.location.x, denominator.location.y - baselineOffset),
      );
    }

    this.width = vinculumBounds.width;
    this.descent = loc.y - (denominatorLoc.y - denominatorBounds.descent);
    if (this.descent < 0) {
      this.descent = 0;
    }
    this.ascent = (numeratorLoc.y + numeratorBounds.ascent) - loc.y;
    this.height = this.descent + this.ascent;

    this.glyphLocations[0] = new Point(
      this.location.x,
      this.location.y + lineVAboveBaseline + baselineOffset,
    );
    this.glyphWidths[0] = vinculumBounds.width;
    this.glyphHeights[0] = vinculumBounds.height;

    fullBounds.copyFrom(vinculumBounds);
    fullBounds.left = this.glyphLocations[0].x;
    fullBounds.bottom = this.glyphLocations[0].y;
    if (numerator != null) {
      fullBounds.growWithSameBaseline(numerator.getBounds(true));
    }
    if (denominator != null) {
      fullBounds.growWithSameBaseline(denominator.getBounds(true));
    }

    if (vinculum) {
      vinculum._custom.setSize(
        this.glyphLocations[0],
        vinculumBounds.width,
        vinculumBounds.height,
      );
    }

    this.fullSize = {
      leftOffset: this.location.x - fullBounds.left,
      width: fullBounds.width,
      ascent: fullBounds.ascent,
      descent: fullBounds.descent,
      height: fullBounds.height,
    };
  }
}
