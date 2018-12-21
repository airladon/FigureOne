import {
  createEquationElements, Equation,
} from './GLEquation';
import EquationForm from './EquationForm';
import { Point } from '../../../tools/g2';
import {
  DiagramElementPrimative, DiagramElementCollection,
} from '../../Element';
import DrawContext2D from '../../../__mocks__/DrawContext2DMock';


describe('Equation Form', () => {
  describe('Create collection', () => {
    test('One element collection', () => {
      const collection = createEquationElements({ a: 'a' }, new DrawContext2D());
      expect(collection.drawOrder).toHaveLength(1);
      expect(collection._a).not.toBe(undefined);
      expect(collection._a).toBeInstanceOf(DiagramElementPrimative);
      expect(collection).toBeInstanceOf(DiagramElementCollection);
    });
    test('Three element collection', () => {
      const collection = createEquationElements({
        a: 'a',
        b: 'b',
        c: 'c',
      }, new DrawContext2D());
      expect(collection.drawOrder).toHaveLength(3);
      expect(collection._a).not.toBe(undefined);
      expect(collection._b).not.toBe(undefined);
      expect(collection._c).not.toBe(undefined);
    });
  });
  describe('Equation', () => {
    let collection;
    let eqn;
    beforeEach(() => {
      collection = createEquationElements({
        a: 'a',
        b: 'b',
        c: 'c',
      }, new DrawContext2D());
      eqn = new EquationForm(
        collection.elements,
        {
          getAllElements: collection.getAllElements.bind(collection),
          hideAll: collection.hideAll.bind(collection),
          show: collection.show.bind(collection),
          showOnly: collection.showOnly.bind(collection),
          stop: collection.stop.bind(collection),
          getElementTransforms: collection.getElementTransforms.bind(collection),
          setElementTransforms: collection.setElementTransforms.bind(collection),
          animateToTransforms: collection.animateToTransforms.bind(collection),
        },
      );
    });
    test('Instantiation', () => {
      expect(eqn.elements).toBe(collection.elements);
      expect(eqn.ascent).toBe(0);
      expect(eqn.descent).toBe(0);
      expect(eqn.width).toBe(0);
      expect(eqn.content).toEqual([]);
      expect(eqn.location).toEqual(new Point(0, 0));
      expect(eqn.height).toBe(0);
    });
    describe('Create', () => {
      test('Simple inline', () => {
        eqn.createEq(['a', 'b', 'c']);
        expect(eqn.content).toHaveLength(3);
      });
      // test('Fraction', () => {
      //   eqn.createEq([eqn.frac('a', 'b', 'c')]);
      //   expect(eqn.content).toHaveLength(1);
      //   const c = eqn.content[0];
      //   expect(c.vinculum).toBe(collection._c);
      //   expect(c.numerator.content[0].content).toBe(collection._a);
      //   expect(c.denominator.content[0].content).toBe(collection._b);
      // });
    });
    describe('arrange', () => {
      test('Fixed to left baseline', () => {
        eqn.createEq(['a', 'b', 'c']);
        eqn.arrange(1, 'left', 'baseline');
        const c = eqn.content;
        expect(c[0].location.round(4)).toEqual(new Point(0, 0));
        expect(c[1].location.round(4)).toEqual(new Point(0.04, 0));
        expect(c[2].location.round(4)).toEqual(new Point(0.08, 0));
        expect(c[0].content.transform.t().round(4)).toEqual(new Point(0, 0));
        expect(c[1].content.transform.t().round(4)).toEqual(new Point(0.04, 0));
        expect(c[2].content.transform.t().round(4)).toEqual(new Point(0.08, 0));
      });
      test('Fixed to center middle', () => {
        eqn.createEq(['a', 'b', 'c']);
        eqn.arrange(1, 'center', 'middle');
        const c = eqn.content;
        expect(c[0].location.round(4)).toEqual(new Point(-0.06, -0.0264));
        expect(c[1].location.round(4)).toEqual(new Point(-0.02, -0.0264));
        expect(c[2].location.round(4)).toEqual(new Point(0.02, -0.0264));
        expect(c[0].content.transform.t().round(4)).toEqual(new Point(-0.06, -0.0264));
        expect(c[1].content.transform.t().round(4)).toEqual(new Point(-0.02, -0.0264));
        expect(c[2].content.transform.t().round(4)).toEqual(new Point(0.02, -0.0264));
      });
      test('Fixed to right bottom', () => {
        eqn.createEq(['a', 'b', 'c']);
        eqn.arrange(1, 'right', 'bottom');
        const c = eqn.content;
        expect(c[0].location.round(4)).toEqual(new Point(-0.12, 0.0032));
        expect(c[1].location.round(4)).toEqual(new Point(-0.08, 0.0032));
        expect(c[2].location.round(4)).toEqual(new Point(-0.04, 0.0032));
        expect(c[0].content.transform.t().round(4)).toEqual(new Point(-0.12, 0.0032));
        expect(c[1].content.transform.t().round(4)).toEqual(new Point(-0.08, 0.0032));
        expect(c[2].content.transform.t().round(4)).toEqual(new Point(-0.04, 0.0032));
      });
      test('Fixed to right top', () => {
        eqn.createEq(['a', 'b', 'c']);
        eqn.arrange(1, 'right', 'top');
        const c = eqn.content;
        expect(c[0].location.round(4)).toEqual(new Point(-0.12, -0.056));
        expect(c[1].location.round(4)).toEqual(new Point(-0.08, -0.056));
        expect(c[2].location.round(4)).toEqual(new Point(-0.04, -0.056));
        expect(c[0].content.transform.t().round(4)).toEqual(new Point(-0.12, -0.056));
        expect(c[1].content.transform.t().round(4)).toEqual(new Point(-0.08, -0.056));
        expect(c[2].content.transform.t().round(4)).toEqual(new Point(-0.04, -0.056));
      });
      test('fixed to element left, baseline', () => {
        eqn.createEq(['a', 'b', 'c']);
        eqn.arrange(1, 'left', 'baseline', collection._b);
        const c = eqn.content;
        expect(c[0].location.round(4)).toEqual(new Point(-0.04, 0));
        expect(c[1].location.round(4)).toEqual(new Point(0, 0));
        expect(c[2].location.round(4)).toEqual(new Point(0.04, 0));
        expect(c[0].content.transform.t().round(4)).toEqual(new Point(-0.04, 0));
        expect(c[1].content.transform.t().round(4)).toEqual(new Point(0, 0));
        expect(c[2].content.transform.t().round(4)).toEqual(new Point(0.04, 0));
      });
      test('fixed to element center, middle', () => {
        eqn.createEq(['a', 'b', 'c']);
        eqn.arrange(1, 'center', 'middle', collection._b);
        const c = eqn.content;
        expect(c[0].location.round(4)).toEqual(new Point(-0.06, -0.0264));
        expect(c[1].location.round(4)).toEqual(new Point(-0.02, -0.0264));
        expect(c[2].location.round(4)).toEqual(new Point(0.02, -0.0264));
        expect(c[0].content.transform.t().round(4)).toEqual(new Point(-0.06, -0.0264));
        expect(c[1].content.transform.t().round(4)).toEqual(new Point(-0.02, -0.0264));
        expect(c[2].content.transform.t().round(4)).toEqual(new Point(0.02, -0.0264));
      });
      test('fixed to element right, top', () => {
        eqn.createEq(['a', 'b', 'c']);
        eqn.arrange(1, 'right', 'top', collection._b);
        const c = eqn.content;
        expect(c[0].location.round(4)).toEqual(new Point(-0.08, -0.056));
        expect(c[1].location.round(4)).toEqual(new Point(-0.04, -0.056));
        expect(c[2].location.round(4)).toEqual(new Point(0, -0.056));
        expect(c[0].content.transform.t().round(4)).toEqual(new Point(-0.08, -0.056));
        expect(c[1].content.transform.t().round(4)).toEqual(new Point(-0.04, -0.056));
        expect(c[2].content.transform.t().round(4)).toEqual(new Point(0, -0.056));
      });
      test('fixed to element right, bottom', () => {
        eqn.createEq(['a', 'b', 'c']);
        eqn.arrange(1, 'right', 'bottom', collection._b);
        const c = eqn.content;
        expect(c[0].location.round(4)).toEqual(new Point(-0.08, 0.0032));
        expect(c[1].location.round(4)).toEqual(new Point(-0.04, 0.0032));
        expect(c[2].location.round(4)).toEqual(new Point(0, 0.0032));
        expect(c[0].content.transform.t().round(4)).toEqual(new Point(-0.08, 0.0032));
        expect(c[1].content.transform.t().round(4)).toEqual(new Point(-0.04, 0.0032));
        expect(c[2].content.transform.t().round(4)).toEqual(new Point(0, 0.0032));
      });
      test('fixed to point', () => {
        eqn.createEq(['a', 'b', 'c']);
        eqn.arrange(1, 'left', 'bottom', new Point(1, 1));
        const c = eqn.content;
        expect(c[0].location.round(4)).toEqual(new Point(1, 1.0032));
        expect(c[1].location.round(4)).toEqual(new Point(1.04, 1.0032));
        expect(c[2].location.round(4)).toEqual(new Point(1.08, 1.0032));
        expect(c[0].content.transform.t().round(4)).toEqual(new Point(1, 1.0032));
        expect(c[1].content.transform.t().round(4)).toEqual(new Point(1.04, 1.0032));
        expect(c[2].content.transform.t().round(4)).toEqual(new Point(1.08, 1.0032));
      });
    });
    describe('duplicate', () => {
      test('Simple Inline', () => {
        eqn.createEq(['a', 'b', 'c']);
        expect(eqn.content).toHaveLength(3);
        // testing to make sure colleciton is not overwritten
        const eqnCopy = eqn._dup(eqn.collection);
        expect(eqnCopy).toEqual(eqn);
        expect(eqnCopy).not.toBe(eqn);
        expect(eqnCopy.elements.a).toEqual(eqn.elements.a);
        expect(eqnCopy.elements.a).toBe(eqn.elements.a);
      });
    });
  });
});
describe('Equation', () => {
  let eqn;
  beforeEach(() => {
    eqn = new Equation(new DrawContext2D());
    eqn.createElements({
      a: 'a',
      b: 'b',
      c: 'c',
    });
    eqn.addForm('f1', ['a', 'b', 'c']);
    eqn.addForm('f2', [eqn.frac('a', 'b', 'c')]);
    eqn.addForm('f3', ['a', 'b', 'c']);
  });
  test('Instantiation', () => {
    expect(eqn.collection.drawOrder).toHaveLength(3);
    expect(eqn.form.f2.base.content[0].vinculum).toBe(eqn.collection._c);
  });
  describe('Duplicate', () => {
    test('Simple', () => {
      const dup = eqn._dup();
      expect(dup.collection).toEqual(eqn.collection);
      expect(dup.collection).not.toBe(eqn.collection);
      expect(dup.collection._a).toEqual(eqn.collection._a);
      expect(dup.collection._a).not.toBe(eqn.collection._a);
      dup.form.f1.base.collectionMethods = {};
      eqn.form.f1.base.collectionMethods = {};
      dup.form.f2.base.collectionMethods = {};
      eqn.form.f2.base.collectionMethods = {};
      dup.form.f3.base.collectionMethods = {};
      eqn.form.f3.base.collectionMethods = {};
      expect(dup.form).toEqual(eqn.form);
      expect(dup).not.toBe(eqn);
      expect(eqn.form.f1.base.content[0].content).toBe(eqn.form.f3.base.content[0].content);
      expect(dup.form.f1.base.content[0].content).toBe(dup.form.f3.base.content[0].content);
    });
    test('Add new form', () => {
      const dup = eqn._dup();
      eqn.addForm('f4', ['a', 'b', 'c']);
      dup.addForm('f4', ['a', 'b', 'c']);
      expect(dup.collection.elements).toBe(dup.form.f1.base.elements);
      expect(dup.collection.elements).toBe(dup.form.f4.base.elements);
      expect(dup.collection._a).toBe(dup.form.f1.base.content[0].content);
      expect(dup.form.f1.base.elements).toBe(dup.form.f4.base.elements);

      expect(eqn.form.f1.base.content[0].content).toBe(eqn.form.f4.base.content[0].content);

      expect(dup.form.f1.base.content[0].content).toBe(dup.form.f3.base.content[0].content);
      expect(dup.form.f1.base.content[0].content).toBe(dup.form.f4.base.content[0].content);

      expect(eqn.form.f4.base.content[0].content).toEqual(dup.form.f4.base.content[0].content);
      expect(eqn.form.f4.base.content[0].content).not.toBe(dup.form.f4.base.content[0].content);

      expect(dup.collection._a.drawingObject.text).not.toBe(eqn.collection._a.drawingObject.text);
      expect(dup.collection._a.drawingObject.text[0].location)
        .not.toBe(eqn.collection._a.drawingObject.text[0].location);
      expect(dup.collection._a.drawingObject.text[0].font)
        .not.toBe(eqn.collection._a.drawingObject.text[0].font);
    });
  });
  // describe('Create', () => {
  //   test('Simple inline', () => {
  //     eqn.createEq(['a', 'b', 'c']);
  //     expect(eqn.content).toHaveLength(3);
  //   });
  //   test('Fraction', () => {
  //     eqn.createEq([eqn.frac('a', 'b', 'c')]);
  //     expect(eqn.content).toHaveLength(1);
  //     const c = eqn.content[0];
  //     expect(c.vinculum).toBe(collection._c);
  //     expect(c.numerator.content[0].content).toBe(collection._a);
  //     expect(c.denominator.content[0].content).toBe(collection._b);
  //   });
  // });
});
// makeEquationTheta(color: Array<number> = [1, 1, 1, 1]) {
//    const collection = this.diagram.equation.elements({ theta: 'θ' }, color);
//    const eqn = this.diagram.equation.make(collection);
//    eqn.createEq(['θ']);
//    collection.eqn = eqn;
//    return collection;
//  }
