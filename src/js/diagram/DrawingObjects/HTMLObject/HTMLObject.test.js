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
    mockElement = document.createElement('div');
    // mockElement.getBoundingClientRect = () => new Rect(475, 240, 50, 20);
    Object.defineProperty(mockElement, 'clientWidth', {
      writable: true,
      value: 50,
    });
    Object.defineProperty(mockElement, 'clientHeight', {
      writable: true,
      value: 20,
    });
    mockElement.style.left = '475px';
    mockElement.style.bottom = '240px';
    // mockElement.style.width = '50px';
    // mockElement.style.height = '20px';
    // mockElement.clientWidth = 50;
    // mockElement.clientHeight = 20;
    // const mocker = document.createElement('div');
    // document.body.appendChild(mocker);
    // mockElement = {
    //   style: {},
    //   getBoundingClientRect: () => new Rect(475, 240, 50, 20),
    //   clientWidth: 50,
    //   clientHeight: 20,
    //   getAttribute: mocker.getAttribute,
    //   setAttribute: mocker.setAttribute,
    // };
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
    expect(h.yAlign).toBe('middle');
    expect(h.xAlign).toBe('center');
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
      expect(h.element.style.position).toEqual('absolute');
      expect(h.element.style.left).toEqual('475px');
      expect(h.element.style.top).toEqual('240px');
      expect(h.element.style.visibility).toEqual('visible');

      h.transformHtml(new Transform().translate(0.1, 0.1).matrix());
      expect(h.element.style.position).toEqual('absolute');
      expect(h.element.style.left).toEqual('525px');
      expect(h.element.style.top).toEqual('215px');
      expect(h.element.style.visibility).toEqual('visible');

      h.transformHtml(new Transform().translate(0.1, 0).rotate(Math.PI / 2).matrix());
      expect(h.element.style.position).toEqual('absolute');
      expect(h.element.style.left).toEqual('475px');
      expect(h.element.style.top).toEqual('215px');
      expect(h.element.style.visibility).toEqual('visible');
    });
    test('Left, right, bottom, top', () => {
      h.xAlign = 'left';
      h.transformHtml(new Transform().matrix());
      expect(h.element.style.position).toEqual('absolute');
      expect(h.element.style.left).toEqual('500px');
      expect(h.element.style.top).toEqual('240px');
      expect(h.element.style.visibility).toEqual('visible');

      h.xAlign = 'right';
      h.transformHtml(new Transform().matrix());
      expect(h.element.style.position).toEqual('absolute');
      expect(h.element.style.left).toEqual('450px');
      expect(h.element.style.top).toEqual('240px');
      expect(h.element.style.visibility).toEqual('visible');

      h.xAlign = 'center';
      h.yAlign = 'top';
      h.transformHtml(new Transform().matrix());
      expect(h.element.style.position).toEqual('absolute');
      expect(h.element.style.left).toEqual('475px');
      expect(h.element.style.top).toEqual('250px');
      expect(h.element.style.visibility).toEqual('visible');

      h.yAlign = 'bottom';
      h.transformHtml(new Transform().matrix());
      expect(h.element.style.position).toEqual('absolute');
      expect(h.element.style.left).toEqual('475px');
      expect(h.element.style.top).toEqual('230px');
      expect(h.element.style.visibility).toEqual('visible');
    });
  });
  test('getGLBoundaries', () => {
    mockElement.getBoundingClientRect = () => new Rect(475, 240, 50, 20);
    const b = h.getGLBoundaries();
    expect(b[0].map(p => p.round(3))).toEqual([
      new Point(-0.25, 2.36),
      new Point(-0.15, 2.36),
      new Point(-0.15, 2.28),
      new Point(-0.25, 2.28),
    ]);
  });
});
