import WebGLInstance from '../../webgl/webgl';
import GLObject from './GLObject';
import Scene from '../../../tools/geometry/scene';
import FontManager from '../../FontManager';
import createMockGL from '../../../__mocks__/createMockGL';

jest.mock('../../Gesture');
jest.mock('../../DrawContext2D');
jest.mock('../../DrawingObjects/HTMLObject/HTMLObject');

describe('GLObject mask texture (textureMap)', () => {
  let gl;
  let webgl;
  let glObject;
  let origCreateElement;

  beforeEach(() => {
    FontManager.instance = undefined;
    gl = createMockGL();
    origCreateElement = document.createElement.bind(document);
    document.createElement = (name) => {
      const el = origCreateElement(name);
      if (name === 'canvas') {
        el.getContext = type => (type === '2d'
          ? {
            canvas: el,
            measureText: () => ({ width: 10 }),
            fillText: () => {},
            clearRect: () => {},
            fillRect: () => {},
            fillStyle: '',
            font: '',
          }
          : gl);
      }
      return el;
    };
    const canvas = {
      width: 100,
      clientWidth: 100,
      height: 100,
      clientHeight: 100,
      style: { top: 0, visibility: 'visible' },
      getContext: () => gl,
    };
    webgl = new WebGLInstance(canvas, [1, 1, 1, 1]);
    glObject = new GLObject(
      webgl,
      { color: 'textureMap', dimension: 2 },
      { color: 'textureMap' },
    );
    // A 2D triangle so the texture coordinates have an a_vertex buffer to map to.
    glObject.addAttribute('a_vertex', 2, [-1, -1, 1, -1, 1, 1]);
    glObject.initAttributes();
    glObject.addTexture('base.png');
    glObject.addMaskTexture('mask.png');
    glObject.initTexture();
  });

  afterEach(() => {
    document.createElement = origCreateElement;
  });

  test('addMaskTexture appends a mask with a transparent default load color', () => {
    expect(glObject.maskTextures).toEqual([{
      id: 'mask.png',
      src: 'mask.png',
      loadColor: [0, 0, 0, 0],
      uniformName: 'u_mask0',
    }]);
  });

  test('addMaskTexture appends additional masks in order with indexed uniforms', () => {
    glObject.addMaskTexture('mask2.png');
    expect(glObject.maskTextures.map(m => m.id)).toEqual(['mask.png', 'mask2.png']);
    expect(glObject.maskTextures.map(m => m.uniformName)).toEqual(['u_mask0', 'u_mask1']);
  });

  test('addMaskTexture with an empty location registers a transparent placeholder', () => {
    glObject.addMaskTexture('');
    const placeholder = glObject.maskTextures[1];
    expect(placeholder.src).toBe('');
    expect(placeholder.loadColor).toEqual([0, 0, 0, 0]);
    expect(placeholder.uniformName).toBe('u_mask1');
  });

  test('registers base and mask on distinct texture units', () => {
    expect(webgl.textures['base.png']).toBeDefined();
    expect(webgl.textures['mask.png']).toBeDefined();
    expect(webgl.textures['base.png'].index)
      .not.toEqual(webgl.textures['mask.png'].index);
  });

  test('draw binds u_mask to the mask texture unit', () => {
    const scene = new Scene();
    const identity = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
    glObject.drawWithTransformMatrix(scene, identity, [1, 1, 1, 1], 3);
    const maskIndex = webgl.textures['mask.png'].index;
    const boundMask = gl.uniform1i.mock.calls.some(call => call[1] === maskIndex);
    expect(boundMask).toBe(true);
  });

  test('resetTextureBuffer deletes both textures from the registry', () => {
    glObject.resetTextureBuffer(true);
    expect(webgl.textures['base.png']).toBeUndefined();
    expect(webgl.textures['mask.png']).toBeUndefined();
  });
});
