// @flow
// import Diagram from '../Diagram';

import {
  Point, clipAngle,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import { Equation } from '../DiagramElements/Equation/Equation';
import type {
  TypeVAlign, TypeHAlign,
} from '../DiagramElements/Equation/EquationForm';
import { joinObjects } from '../../tools/tools';
import type { EQN_Equation } from '../DiagramElements/Equation/Equation';
// export type TypeEquationLabel = {
//   eqn: Equation;
//   updateRotation: (number, Point, number, number) => void;
//   setText: (string) => {};
//   getText: void => string;
//   // updateScale: (Point) => void;
// };

// deprecate
// export type TypeLabelEquationOptions = {
//   eqn: 'fraction' | 'fractionPre',
//   denominator: string,
//   numerator: string,
//   main?: string,
//   scale?: number,
//   fracScale?: number,
// };

// function getRadiusOfRoundedRect(
//   halfWidth: number,
//   halfHeight: number,
//   cornerR: number,
//   angle: number,
// ) {
//   const angleRadiusStart = Math.atan2(halfHeight - cornerR, halfWidth);
//   const angleRadiusEnd = Math.atan2(halfHeight, halfWidth - cornerR);
//   let normalizedAngle = angle;
//   if (angle > Math.PI / 2 && angle < Math.PI) {
//     normalizedAngle = Math.PI - angle;
//   } else if (angle > Math.PI && angle < 3 * Math.PI / 2) {
//     normalizedAngle = angle - Math.PI;
//   } else if (angle > 3 * Math.PI / 2 && angle < 2 * Math.PI) {
//     normalizedAngle = Math.PI * 2 - angle;
//   }
//   if (normalizedAngle <= angleRadiusStart) {
//     return halfWidth * Math.tan(normalizedAngle);
//   }
//   if (normalizedAngle >= angleRadiusEnd) {
//     return halfHeight * Math.tan(Math.PI / 2 - normalizedAngle);
//   }
// }

export type TypeLabelOptions = {
  label?: string | Equation | Array<string> | EQN_Equation,
  color?: Array<number>,
  scale?: number,
  position?: Point,
  form?: string,
  yAlign?: TypeVAlign,
  xAlign?: TypeHAlign,
};

/**
 * Equation label
 */
export default class EquationLabel {
  eqn: Equation;
  height: number;
  width: number;
  aOffset: number;

  constructor(
    equations: Object,
    options: TypeLabelOptions = {},
  ) {
    const defaultOptions = {
      label: '',
      color: [0, 0, 1, 1],
      scale: 0.7,
      position: new Point(0, 0),
      xAlign: 'center',
      yAlign: 'middle',
    };
    const optionsToUse = joinObjects({}, defaultOptions, options);
    const labelTextOrEquation = optionsToUse.label;
    const { color, scale, position } = optionsToUse;
    // const { form } = optionsToUse;
    const { yAlign, xAlign } = optionsToUse;
    let eqn;
    if (typeof labelTextOrEquation === 'string') {
      eqn = equations.equation({
        elements: { base: labelTextOrEquation },
        color,
        formDefaults: {
          alignment: {
            fixTo: new Point(0, 0),
            xAlign,
            yAlign,
          },
        },
        scale,
        forms: {
          base: ['base'],
        },
        position,
      });
      eqn.showForm('base');
    } else if (labelTextOrEquation instanceof Equation) {
      eqn = labelTextOrEquation;
      eqn.showForm(Object.keys(eqn.eqn.forms)[0]);
    } else if (Array.isArray(labelTextOrEquation)) {
      const elements = {};
      const forms = {};
      labelTextOrEquation.forEach((labelText, index) => {
        elements[`_${index}`] = labelText;
        forms[index] = [labelText];
      });

      eqn = equations.equation({
        elements,
        forms,
        color,
        position,
        formDefaults: {
          alignment: {
            fixTo: new Point(0, 0),
            xAlign,
            yAlign,
          },
        },
        scale,
      });
      eqn.showForm('0');
    } else {
      const defaultEqnOptions = {
        color,
        formDefaults: {
          alignment: {
            fixTo: new Point(0, 0),
            xAlign,
            yAlign,
          },
        },
        scale,
        // form,
      };
      eqn = equations.equation(joinObjects(
        defaultEqnOptions, labelTextOrEquation,
      ));
      // if (form == null) {
      eqn.showForm(Object.keys(eqn.eqn.forms)[0]);
    }
    this.eqn = eqn;
    this.width = 0;
    this.height = 0;
    this.aOffset = 0;
  }

  // TODO
  // setEqn() {
  // }

  setText(text: string) {
    const form = this.eqn.getCurrentForm();
    if (form != null) {
      const key = Object.keys(form.elements)[0];
      // This is ok to fix for flow because all the elements of the
      // simple equation created by Equationlabel will be Primitives
      // $FlowFixMe
      const textObject = form.elements[key].drawingObject;
      if (textObject != null) {
        textObject.setText(text);
      }
      // console.log(form)
      form.arrange(
        this.eqn.eqn.scale,
        this.eqn.eqn.formDefaults.alignment.xAlign,
        this.eqn.eqn.formDefaults.alignment.yAlign,
        this.eqn.eqn.formDefaults.alignment.fixTo,
      );
    }
  }

  getText(): string {
    let textToReturn = '';
    const form = this.eqn.getCurrentForm();
    if (form != null) {
      const key = Object.keys(form.elements)[0];
      // This is ok to fix for flow because all the elements of the
      // simple equation created by Equationlabel will be Primitives
      // $FlowFixMe
      const textObject = form.elements[key].drawingObject;
      // This is ok to fix for flow because all the elements of the
      // simple equation created by Equationlabel will be Primitives
      // that are text objects
      if (textObject != null) {
        // $FlowFixMe
        textToReturn = textObject.text[0].text;
      }
    }
    return textToReturn;
  }

  // eslint-disable-next-line class-methods-use-this
  updateRotation(
    position: Point,
    lineAngle: number,
    offsetMag: number,
    location: 'top' | 'bottom' | 'left' | 'right' | 'positive' | 'negative' | 'start' | 'end' | 'inside' | 'outside',
    subLocation: 'top' | 'bottom' | 'left' | 'right',
    orientation: 'horizontal' | 'baseAway' | 'baseToLine' | 'upright',
    parentAngleOffset: number = 0,
    style: 'oval' | 'rectangle' = 'oval',
  ) {
    // Calculate the offsetAngle and label angle
    let offsetAngle = Math.PI / 2;
    let labelAngle = 0;
    if (location === 'start') {
      offsetAngle = -Math.PI;
    } else if (location === 'end') {
      offsetAngle = 0;
    } else {
      const offsetTop = Math.cos(lineAngle) < 0 ? -Math.PI / 2 : Math.PI / 2;
      const offsetBottom = -offsetTop;
      const offsetLeft = Math.sin(lineAngle) > 0 ? Math.PI / 2 : -Math.PI / 2;
      const offsetRight = -offsetLeft;

      if (location === 'top') {
        offsetAngle = offsetTop;
      }
      if (location === 'bottom') {
        offsetAngle = offsetBottom;
      }
      if (location === 'right') {
        offsetAngle = offsetRight;
      }
      if (location === 'left') {
        offsetAngle = offsetLeft;
      }
      if (location === 'positive') {
        offsetAngle = Math.PI / 2;
      }
      if (location === 'negative') {
        offsetAngle = -Math.PI / 2;
      }
      if (round(Math.sin(lineAngle), 4) === 0
        && (location === 'left' || location === 'right')
      ) {
        if (subLocation === 'top') {
          offsetAngle = offsetTop;
        }
        if (subLocation === 'bottom') {
          offsetAngle = offsetBottom;
        }
      }
      if (round(Math.cos(lineAngle), 4) === 0
        && (location === 'top' || location === 'bottom')
      ) {
        if (subLocation === 'right') {
          offsetAngle = offsetRight;
        }
        if (subLocation === 'left') {
          offsetAngle = offsetLeft;
        }
      }
      if (location === 'inside') {
        offsetAngle = -Math.PI / 2;
      }
      if (location === 'outside') {
        offsetAngle = Math.PI / 2;
      }
    }

    if (orientation === 'horizontal') {
      labelAngle = -lineAngle;
    }
    if (orientation === 'baseToLine') {
      labelAngle = 0;
      if (offsetAngle < 0) {
        labelAngle = Math.PI;
      }
    }
    if (orientation === 'baseAway') {
      labelAngle = Math.PI;
      if (offsetAngle < 0) {
        labelAngle = 0;
      }
    }
    if (orientation === 'upright') {
      if (Math.cos(lineAngle) < 0) {
        labelAngle = Math.PI;
      }
    }

    labelAngle -= parentAngleOffset;

    // half height and width of text
    let h = 0;
    let w = 0;
    const currentForm = this.eqn.getCurrentForm();
    let change = false;
    if (currentForm != null) {
      if (this.height !== currentForm.height) {
        this.height = currentForm.height;
        change = true;
      }
      if (this.width !== currentForm.width) {
        this.width = currentForm.width;
        change = true;
      }
      h = currentForm.height / 2;
      w = currentForm.width / 2;
    }
    let positionOffset = new Point(0, 0);
    if (style === 'oval') {
      positionOffset = this.getOvalOffset(
        labelAngle, h, w, offsetMag, offsetAngle, change, location, position,
      );
    }

    this.eqn.setPosition(position.add(positionOffset));
    this.eqn.transform.updateRotation(labelAngle);
  }

  getOvalOffset(
    labelAngle: number,
    h: number,
    w: number,
    offsetMag: number,
    offsetAngle: number,
    change: boolean,
    location: 'top' | 'bottom' | 'left' | 'right' | 'positive' | 'negative' | 'start' | 'end' | 'inside' | 'outside',
    position: Point,
  ) {
    // eslint-disable-next-line max-len
    const getR = (a, b, angle) => a * b / Math.sqrt((b * Math.cos(angle)) ** 2 + (a * Math.sin(angle)) ** 2);

    // Create an oval around the label by:
    // * Find top corner of label
    // * Find distance (R) and angle to top corner
    // * The oval must go through this top corner
    // * Find 'a' and 'b' of the oval so that 'a' and 'b' are the width and
    //   height with the same offset (a = w + o), (b = h + o)
    // * To find 'o', make an oval with o = offsetMag and see how close
    //   its topCorner R is to the reference.
    // * If it doesn't reach the top corner reference, then step o in fifths
    //   of the delta until either 10 steps have occured, or the top corner
    //   is covered.
    if (change) {
      const topCornerAngle = Math.atan(h / w);
      const topCornerR = h / Math.sin(topCornerAngle) + offsetMag;
      const delta = topCornerR - getR(w + offsetMag, h + offsetMag, topCornerAngle);
      let i = 2;
      let testR = -1;
      let ovalOffset = 0;
      while (i < 33 && testR < topCornerR) {
        ovalOffset = delta * i * 0.1 + offsetMag;
        testR = getR(w + ovalOffset, h + ovalOffset, topCornerAngle);
        i += 1;
      }
      this.aOffset = ovalOffset;
    }

    const a = this.aOffset + w;
    const b = this.aOffset + h;

    const phi = clipAngle(labelAngle, '0to360');
    let theta;
    let xOffset;
    let yOffset;
    let R;
    if (location === 'start') {
      theta = Math.PI * 2 - phi;
      R = getR(a, b, theta);
      xOffset = -R;
      yOffset = 0;
    } else if (location === 'end') {
      theta = Math.PI - phi;
      R = getR(a, b, theta);
      xOffset = R;
      yOffset = 0;
    } else {
      // Calculate the position
      // Refer to oval_math.pdf for working
      theta = clipAngle(Math.PI * 2 - Math.atan(-(b ** 2) / (a ** 2 * Math.tan(phi))), '0to360');
      R = getR(a, b, theta);
      let sigma = clipAngle(phi + theta - Math.PI, '-180to180');
      if (sigma < 0) {
        sigma += Math.PI;
      }
      xOffset = R * Math.cos(sigma);
      yOffset = R * Math.sin(sigma);
      if (offsetAngle < 0) {
        yOffset = -yOffset;
        xOffset = -xOffset;
      }
      // console.log(
      //   round(phi * 180 / Math.PI, 0),
      //   round(theta * 180 / Math.PI, 0),
      //   round(sigma * 180 / Math.PI, 0),
      //   round(a, 3),
      //   round(R, 3),
      // )
    }

    // DEBUG ONLY
    const debug = true;
    if (debug) {
      if (this.eqn.parent != null) {  // $FlowFixMe
        if (this.eqn.parent._debugEllipse == null) {
          const e = this.eqn.shapes.ellipse({
            width: 1,
            height: 0.5,
            color: [0, 0, 1, 0.6],
            sides: 50,
          }); // $FlowFixMe
          this.eqn.parent.add('debugEllipse', e);
        } // $FlowFixMe
        const e = this.eqn.parent._debugEllipse;
        if (e != null) {
          e.custom.update({
            width: a * 2,
            height: b * 2,
          });
          e.setPosition(position.add(xOffset, yOffset));
          e.setRotation(labelAngle);
        }
      }
    }

    return new Point(xOffset, yOffset);
  }

  // updateRotationLegacy(
  //   labelAngle: number,
  //   position: Point,
  //   offsetMag: number = 0,
  //   offsetAngle: number = 0,
  //   oval: boolean = true,
  // ) {
  //   if (offsetMag !== 0) {
  //     let h = 0;
  //     let w = 0;
  //     const currentForm = this.eqn.getCurrentForm();
  //     let change = false;
  //     if (currentForm != null) {
  //       if (this.height !== currentForm.height) {
  //         this.height = currentForm.height;
  //         change = true;
  //       }
  //       if (this.width !== currentForm.width) {
  //         this.width = currentForm.width;
  //         change = true;
  //       }
  //       h = currentForm.height / 2 + offsetMag;
  //       w = currentForm.width / 2 + offsetMag;
  //     }
  //     let r = 0; 
  //     if (oval) {
  //       // eslint-disable-next-line max-len
  //       const getR = (a, b, angle = labelAngle - offsetAngle) => a * b / Math.sqrt((b * Math.cos(angle)) ** 2 + (a * Math.sin(angle)) ** 2);
  //       if (change) {
  //         let i = 2;
  //         r = -1;
  //         const topCornerAngle = Math.atan(h / w);
  //         const topCornerR = h / Math.sin(topCornerAngle) + offsetMag;
  //         const delta = topCornerR - getR(w + offsetMag, h + offsetMag, topCornerAngle);
  //         let ovalOffset = 0;
  //         while (i < 13 && r < topCornerR) {
  //           ovalOffset = delta * i * 0.2;
  //           r = getR(w + ovalOffset, h + ovalOffset, topCornerAngle);
  //           i += 1;
  //         }
  //         this.aOffset = ovalOffset;
  //       }

  //       const a = this.aOffset + w;
  //       const b = this.aOffset + h;

  //       const phi = clipAngle(labelAngle, '0to360');
  //       const theta = clipAngle(Math.PI * 2 - Math.atan(-(b ** 2) / (a ** 2 * Math.tan(phi))), '0to360');
  //       const R = getR(a, b, theta);
  //       let sigma = clipAngle(phi + theta - Math.PI, '-180to180');
  //       if (sigma < 0) {
  //         sigma += Math.PI;
  //       }
  //       let xOffset = R * Math.cos(sigma);
  //       let yOffset = R * Math.sin(sigma);
  //       if (offsetAngle < 0) {
  //         yOffset = -yOffset;
  //         xOffset = -xOffset;
  //       }
  //       this.eqn.setPosition(position.add(xOffset, yOffset));

  //       if (this.eqn.parent != null && this.eqn.parent.parent != null && this.eqn.parent.parent._ell != null) {
  //         // console.log(this.eqn.parent.parent)
  //         const e = this.eqn.parent.parent._ell;
  //           e.custom.update({
  //             width: a * 2,
  //             height: b * 2,
  //           });
  //       }
  //     } else {
  //       r = getRadiusOfRoundedRect(labelWidth, labelHeight, 0, labelAngle);
  //       this.eqn.setPosition(position.add(polarToRect(r, offsetAngle)));
  //     }
  //   } else {
  //     this.eqn.setPosition(position);
  //   }
  //   this.eqn.transform.updateRotation(labelAngle);
  //   if (this.eqn.parent != null && this.eqn.parent.parent != null && this.eqn.parent.parent._ell != null) {
  //     const e = this.eqn.parent.parent._ell;
  //     e.setPosition(this.eqn.getPosition('diagram'));
  //   }
  // }

  // const label = {
  //   eqn,
  //   updateRotation,
  //   setText,
  //   getText,
  //   // updateScale,
  // };

  // return label;
}

export type TypeEquationLabel = EquationLabel;
