import HTMLObject from './HTMLObject';
import {
  Point, Transform, Rect,
} from '../../../tools/g2';

describe('Diagram HTML Object', () => {
  let parentDiv;
  let h;
  let mockElement;
  beforeEach(() => {
    parentDiv = {
      clientWidth: 1000,
      clientHeight: 500,
      getBoundingClientRect: () => new Rect(100, 100, 1000, 500),
    };
    // Element is initially in center of the parent Div
    mockElement = {
      style: {},
      getBoundingClientRect: () => new Rect(475, 240, 50, 20),
      clientWidth: 50,
      clientHeight: 20,
    };
    const element = document.createElement('div');
    const inside = document.createTextNode('test text');
    element.appendChild(inside);
    element.setAttribute('id', 'html_test_element');
    document.body.appendChild(element);
    h = new HTMLObject(parentDiv, 'html_test_element', new Point(0, 0), 'middle', 'center');
    h.element = mockElement;
  });
  test('Instantiation', () => {
    expect(h.location).toEqual(new Point(0, 0));
    expect(h.alignV).toBe('middle');
    expect(h.alignH).toBe('center');
    expect(h.parentDiv).toBe(parentDiv);
    expect(h.element).toBe(mockElement);
  });
  test('glToPixelSpace', () => {
    let gl = new Point(0, 0);
    let pixel = h.glToPixelSpace(gl);
    let expected = new Point(500, 250);
    expect(pixel).toEqual(expected);

    gl = new Point(-1, 1);
    pixel = h.glToPixelSpace(gl);
    expected = new Point(0, 0);
    expect(pixel).toEqual(expected);

    gl = new Point(1, -1);
    pixel = h.glToPixelSpace(gl);
    expected = new Point(1000, 500);
    expect(pixel).toEqual(expected);
  });
  describe('transformHtml', () => {
    test('Center, middle, (0,0) and transforms', () => {
      h.transformHtml(new Transform().matrix());
      expect(h.element.style)
        .toEqual({
          position: 'absolute',
          left: '475px',
          top: '240px',
          visibility: 'visible',
        });

      h.transformHtml(new Transform().translate(0.1, 0.1).matrix());
      expect(h.element.style)
        .toEqual({
          position: 'absolute',
          left: '525px',
          top: '215px',
          visibility: 'visible',
        });

      h.transformHtml(new Transform().translate(0.1, 0).rotate(Math.PI / 2).matrix());
      expect(h.element.style)
        .toEqual({
          position: 'absolute',
          left: '475px',
          top: '215px',
          visibility: 'visible',
        });
    });
    test('Left, right, bottom, top', () => {
      h.alignH = 'left';
      h.transformHtml(new Transform().matrix());
      expect(h.element.style)
        .toEqual({
          position: 'absolute',
          left: '500px',
          top: '240px',
          visibility: 'visible',
        });

      h.alignH = 'right';
      h.transformHtml(new Transform().matrix());
      expect(h.element.style)
        .toEqual({
          position: 'absolute',
          left: '450px',
          top: '240px',
          visibility: 'visible',
        });

      h.alignH = 'center';
      h.alignV = 'top';
      h.transformHtml(new Transform().matrix());
      expect(h.element.style)
        .toEqual({
          position: 'absolute',
          left: '475px',
          top: '250px',
          visibility: 'visible',
        });

      h.alignV = 'bottom';
      h.transformHtml(new Transform().matrix());
      expect(h.element.style)
        .toEqual({
          position: 'absolute',
          left: '475px',
          top: '230px',
          visibility: 'visible',
        });
    });
  });
  test('getGLBoundaries', () => {
    const b = h.getGLBoundaries();
    expect(b[0].map(p => p.round(3))).toEqual([
      new Point(-0.25, 2.36),
      new Point(-0.15, 2.36),
      new Point(-0.15, 2.28),
      new Point(-0.25, 2.28),
    ]);
  });
});
