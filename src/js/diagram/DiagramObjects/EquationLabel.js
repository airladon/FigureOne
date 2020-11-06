// @flow
// import Diagram from '../Diagram';

import {
  Point, polarToRect,
} from '../../tools/g2';
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

export type TypeLabelOptions = {
  label?: string | Equation | Array<string> | EQN_Equation,
  color?: Array<number>,
  scale?: number,
  position?: Point,
  form?: string,
  formType?: string,
  yAlign?: TypeVAlign,
  xAlign?: TypeHAlign,
};

export default class EquationLabel {
  eqn: Equation;
  updateRotation: (number, Point, ?number, ?number) => void;
  setText: (string) => void;
  getText: void => string;

  constructor(
    equations: Object,
    options: TypeLabelOptions = {},
  ) {
    const defaultOptions = {
      label: '',
      color: [0, 0, 1, 1],
      scale: 0.7,
      position: new Point(0, 0),
      form: '0',
      formType: 'base',
      xAlign: 'center',
      yAlign: 'middle',
    };
    const optionsToUse = joinObjects({}, defaultOptions, options);
    const labelTextOrEquation = optionsToUse.label;
    const { color, scale, position } = optionsToUse;
    const { form, formType } = optionsToUse;
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
      eqn.setCurrentForm('base');
    } else if (labelTextOrEquation instanceof Equation) {
      eqn = labelTextOrEquation;
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
      eqn.setCurrentForm(form, formType);
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
        form,
        formType,
      };
      eqn = equations.equation(joinObjects(
        defaultEqnOptions, labelTextOrEquation,
      ));
    }
    this.eqn = eqn;
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

  updateRotation(
    labelAngle: number,
    position: Point,
    offsetMag: number = 0,
    offsetAngle: number = 0,
  ) {
    if (offsetMag !== 0) {
      let labelWidth = 0;
      let labelHeight = 0;
      const currentForm = this.eqn.getCurrentForm();
      if (currentForm != null) {
        labelWidth = currentForm.width / 2 + 0.04;
        labelHeight = currentForm.height / 2 + 0.04;
      }
      const a = labelWidth + offsetMag;
      const b = labelHeight + offsetMag;
      const r = a * b / Math.sqrt((b * Math.cos(labelAngle - offsetAngle)) ** 2
        + (a * Math.sin(labelAngle - offsetAngle)) ** 2);
      this.eqn.setPosition(position.add(polarToRect(r, offsetAngle)));
    } else {
      this.eqn.setPosition(position);
    }
    this.eqn.transform.updateRotation(labelAngle);
  }

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
