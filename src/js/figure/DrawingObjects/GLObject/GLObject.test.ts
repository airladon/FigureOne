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

  test('registers base and mask as distinct textures', () => {
    expect(webgl.textures['base.png']).toBeDefined();
    expect(webgl.textures['mask.png']).toBeDefined();
    expect(webgl.textures['base.png'].handle)
      .not.toEqual(webgl.textures['mask.png'].handle);
  });

  test('draw binds base and mask to distinct content units', () => {
    const scene = new Scene();
    const identity = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
    gl.activeTexture.mockClear();
    gl.bindTexture.mockClear();
    glObject.drawWithTransformMatrix(scene, identity, [1, 1, 1, 1], 3);

    // The draw binds the base and mask glTextures to the content pool.
    const baseGl = webgl.textures['base.png'].glTexture;
    const maskGl = webgl.textures['mask.png'].glTexture;
    expect(gl.bindTexture.mock.calls.some(call => call[1] === baseGl)).toBe(true);
    expect(gl.bindTexture.mock.calls.some(call => call[1] === maskGl)).toBe(true);

    // Unit 0 is reserved for the target texture, so content starts at unit 1,
    // and base and mask occupy different units within the same draw.
    const baseUnit = webgl.boundUnits.indexOf('base.png');
    const maskUnit = webgl.boundUnits.indexOf('mask.png');
    expect(baseUnit).toBeGreaterThanOrEqual(1);
    expect(maskUnit).toBeGreaterThanOrEqual(1);
    expect(baseUnit).not.toEqual(maskUnit);
  });

  test('skips the draw when the base texture is missing instead of sampling a stale unit', () => {
    const scene = new Scene();
    const identity = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
    // Simulate a shared base texture being deleted by another element's cleanup
    // while this element still references it.
    webgl.deleteTexture('base.png');
    gl.drawArrays.mockClear();
    glObject.drawWithTransformMatrix(scene, identity, [1, 1, 1, 1], 3);

    // Composed texture shaders sample u_texture unconditionally, so with no base
    // texture to bind the object renders nothing rather than sampling whatever
    // texture happens to occupy the content unit.
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  test('consecutive draws of the same textures skip rebinding (bind-on-change)', () => {
    const scene = new Scene();
    const identity = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
    // First draw binds base and mask to their units.
    glObject.drawWithTransformMatrix(scene, identity, [1, 1, 1, 1], 3);
    gl.bindTexture.mockClear();
    // Second draw: both textures are already on their units, so no rebinds.
    glObject.drawWithTransformMatrix(scene, identity, [1, 1, 1, 1], 3);
    const baseGl = webgl.textures['base.png'].glTexture;
    const maskGl = webgl.textures['mask.png'].glTexture;
    expect(gl.bindTexture.mock.calls.some(call => call[1] === baseGl)).toBe(false);
    expect(gl.bindTexture.mock.calls.some(call => call[1] === maskGl)).toBe(false);
  });

  test('a draw rebinds the unit when a different texture has taken it', () => {
    const scene = new Scene();
    const identity = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
    glObject.drawWithTransformMatrix(scene, identity, [1, 1, 1, 1], 3);
    // Something else takes unit 1 (the base texture's unit).
    webgl.bindTextureToUnit('mask.png', 1);
    gl.bindTexture.mockClear();
    glObject.drawWithTransformMatrix(scene, identity, [1, 1, 1, 1], 3);
    // The base texture must be re-bound since the cached unit no longer holds it.
    const baseGl = webgl.textures['base.png'].glTexture;
    expect(gl.bindTexture.mock.calls.some(call => call[1] === baseGl)).toBe(true);
  });

  test('adopting an unregistered texture id takes no reference and over-releases nothing', () => {
    // initTexture acquired a reference to the base texture in beforeEach.
    expect(glObject.acquiredBaseTextureId).toBe('base.png');
    // Adopt an id that was never registered (simulates an atlas not uploaded yet).
    glObject.setBaseTextureRef('not-registered');
    // No reference was taken, so nothing is left dangling to over-release.
    expect(glObject.acquiredBaseTextureId).toBeNull();

    const deleteSpy = jest.spyOn(webgl, 'deleteTexture');
    glObject.resetTextureBuffer(true);
    // resetTextureBuffer releases only what was acquired — never the
    // unregistered id (which would be an over-release without the hardening).
    expect(deleteSpy.mock.calls.every(call => call[0] !== 'not-registered')).toBe(true);
    deleteSpy.mockRestore();
  });

  test('resetTextureBuffer deletes both textures from the registry', () => {
    glObject.resetTextureBuffer(true);
    expect(webgl.textures['base.png']).toBeUndefined();
    expect(webgl.textures['mask.png']).toBeUndefined();
  });
});
