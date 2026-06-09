import Figure from '../Figure';
import FontManager from '../FontManager';
import createMockGL from '../../__mocks__/createMockGL';

jest.mock('../Gesture');
jest.mock('../DrawContext2D');
jest.mock('../DrawingObjects/HTMLObject/HTMLObject');

describe('gl primitive mask recolor (textureMap)', () => {
  let gl;
  let origCreateElement;

  function make2dContext(canvas) {
    return {
      canvas,
      measureText: () => ({ width: 10 }),
      fillText: () => {},
      strokeText: () => {},
      clearRect: () => {},
      fillRect: () => {},
      beginPath: () => {},
      rect: () => {},
      stroke: () => {},
      fillStyle: '',
      strokeStyle: '',
      font: '',
      lineWidth: 1,
    };
  }

  beforeEach(() => {
    FontManager.instance = undefined;
    document.body.innerHTML =
      '<div id="c">'
      + '  <canvas class="figureone__gl" id="id_figureone__gl__low"></canvas>'
      + '  <canvas class="figureone__text" id="id_figureone__text__low"></canvas>'
      + '  <div class="figureone__html"></div>'
      + '</div>';
    gl = createMockGL();
    origCreateElement = document.createElement.bind(document);
    document.createElement = (name) => {
      const el = origCreateElement(name);
      if (name === 'canvas') {
        el.getContext = type => (type === '2d' ? make2dContext(el) : gl);
      }
      return el;
    };
    document.querySelectorAll('canvas').forEach((canvas) => {
      // eslint-disable-next-line no-param-reassign
      canvas.getContext = type => (type === '2d' ? make2dContext(canvas) : gl);
    });
  });

  afterEach(() => {
    document.createElement = origCreateElement;
  });

  function makeMaskFigure(extra = {}) {
    const figure = new Figure({ htmlId: 'c', color: [1, 0, 0, 1] });
    figure.add({
      name: 'm',
      make: 'gl',
      vertices: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
      texture: { src: '/base.png', coords: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1] },
      mask: { src: '/mask.png' },
      tints: [[1, 0, 0, 1], [0, 0, 1]],
      ...extra,
    });
    return figure;
  }

  function addMaskElement(extra = {}) {
    return makeMaskFigure(extra).getElement('m');
  }

  test('mask option selects the textureMap color mode', () => {
    const e = addMaskElement();
    expect(e.drawingObject.fragmentShader.color).toBe('textureMap');
    expect(e.drawingObject.vertexShader.color).toBe('textureMap');
  });

  test('registers a mask texture alongside the base texture', () => {
    const e = addMaskElement();
    expect(e.drawingObject.texture.id).toBe('/base.png');
    expect(e.drawingObject.maskTextures.map(m => m.id)).toEqual(['/mask.png']);
    const { textures } = e.drawingObject.webgl;
    expect(textures['/base.png'].index).not.toEqual(textures['/mask.png'].index);
  });

  test('seeds u_tint uniforms from the tints option', () => {
    const e = addMaskElement();
    const u = e.drawingObject.uniforms;
    expect(u.u_tint0.value).toEqual([1, 0, 0, 1]);
    // 3-component tint defaults alpha to 1
    expect(u.u_tint1.value).toEqual([0, 0, 1, 1]);
    // unspecified tints default to transparent (no recolor)
    expect(u.u_tint2.value).toEqual([0, 0, 0, 0]);
    expect(u.u_tint3.value).toEqual([0, 0, 0, 0]);
  });

  test('tints beyond the four mask channels are ignored at seeding', () => {
    const e = addMaskElement({
      tints: [[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1], [1, 1, 0, 1], [1, 1, 1, 1]],
    });
    // Only four tint uniforms exist; the fifth is silently dropped.
    expect(e.drawingObject.uniforms.u_tint4).toBeUndefined();
    expect(e.customState.tints).toHaveLength(4);
  });

  test('mirrors tints into customState for state/recording capture', () => {
    const e = addMaskElement();
    expect(e.customState.tints).toEqual([
      [1, 0, 0, 1], [0, 0, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0],
    ]);
  });

  test('custom.setTint updates both the uniform and customState', () => {
    const e = addMaskElement();
    e.custom.setTint(0, [0, 1, 0, 0.5]);
    expect(e.drawingObject.uniforms.u_tint0.value).toEqual([0, 1, 0, 0.5]);
    expect(e.customState.tints[0]).toEqual([0, 1, 0, 0.5]);
  });

  test('custom.setTint ignores an out-of-range index without throwing or poisoning state', () => {
    const figure = makeMaskFigure();
    const e = figure.getElement('m');
    expect(() => e.custom.setTint(4, [1, 1, 1, 1])).not.toThrow();
    expect(() => e.custom.setTint(-1, [1, 1, 1, 1])).not.toThrow();
    // customState is not extended with a phantom 5th entry...
    expect(e.customState.tints).toHaveLength(4);
    // ...so a subsequent state restore does not re-throw on a missing uniform.
    const state = figure.getState({});
    expect(() => figure.setState(state)).not.toThrow();
  });

  test('custom.setTints replaces all four regions (clears higher tints)', () => {
    const e = addMaskElement();
    e.custom.setTints([[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1], [1, 1, 0, 1]]);
    expect(e.drawingObject.uniforms.u_tint3.value).toEqual([1, 1, 0, 1]);
    // A shorter array resets the unspecified regions to transparent.
    e.custom.setTints([[0.1, 0.2, 0.3, 1]]);
    expect(e.drawingObject.uniforms.u_tint0.value).toEqual([0.1, 0.2, 0.3, 1]);
    expect(e.drawingObject.uniforms.u_tint1.value).toEqual([0, 0, 0, 0]);
    expect(e.drawingObject.uniforms.u_tint3.value).toEqual([0, 0, 0, 0]);
    expect(e.customState.tints[3]).toEqual([0, 0, 0, 0]);
  });

  test('tints are restored to the GPU on state restore (recording/seek)', () => {
    const figure = makeMaskFigure();
    const e = figure.getElement('m');
    expect(e.drawingObject.uniforms.u_tint0.value).toEqual([1, 0, 0, 1]);

    // Capture state, then change the tint (as a recording timeline would).
    const state = figure.getState({});
    e.custom.setTint(0, [0, 1, 0, 1]);
    expect(e.drawingObject.uniforms.u_tint0.value).toEqual([0, 1, 0, 1]);
    expect(e.customState.tints[0]).toEqual([0, 1, 0, 1]);

    // Restoring the earlier state must re-apply the original tint to the GPU,
    // not just to customState.
    figure.setState(state);
    expect(e.customState.tints[0]).toEqual([1, 0, 0, 1]);
    expect(e.drawingObject.uniforms.u_tint0.value).toEqual([1, 0, 0, 1]);
  });

  test('multiple masks register N textures and 4*N tints', () => {
    const figure = new Figure({ htmlId: 'c', color: [1, 0, 0, 1] });
    figure.add({
      name: 'multi',
      make: 'gl',
      vertices: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
      texture: { src: '/base.png', coords: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1] },
      masks: [{ src: '/mask0.png' }, { src: '/mask1.png' }],
      // 8 tints: mask0 -> tints 0..3, mask1 -> tints 4..7.
      tints: [
        [1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1], [1, 1, 0, 1],
        [1, 0, 1, 1], [0, 1, 1, 1], null, null,
      ],
    });
    const e = figure.getElement('multi');
    expect(e.drawingObject.fragmentShader.color).toBe('textureMap');
    expect(e.drawingObject.fragmentShader.masks).toBe(2);
    // Two distinct mask textures registered on distinct units.
    expect(e.drawingObject.maskTextures.map(m => m.id)).toEqual(['/mask0.png', '/mask1.png']);
    const { textures } = e.drawingObject.webgl;
    expect(textures['/mask0.png'].index).not.toEqual(textures['/mask1.png'].index);
    // 8 tint uniforms exist; the 9th does not.
    expect(e.drawingObject.uniforms.u_tint7.value).toEqual([0, 0, 0, 0]); // null -> transparent
    expect(e.drawingObject.uniforms.u_tint4.value).toEqual([1, 0, 1, 1]);
    expect(e.drawingObject.uniforms.u_tint8).toBeUndefined();
    expect(e.customState.tints).toHaveLength(8);
    // Setter range follows the larger tint count.
    e.custom.setTint(7, [0.5, 0.5, 0.5, 1]);
    expect(e.drawingObject.uniforms.u_tint7.value).toEqual([0.5, 0.5, 0.5, 1]);
  });

  test('a non-array masks value is coerced instead of crashing', () => {
    const figure = new Figure({ htmlId: 'c', color: [1, 0, 0, 1] });
    expect(() => figure.add({
      name: 'obj',
      make: 'gl',
      vertices: [-1, -1, 1, -1, 1, 1],
      texture: { src: '/base.png', coords: [0, 0, 1, 0, 1, 1] },
      masks: { src: '/mask.png' }, // object, not array
      tints: [[1, 0, 0, 1]],
    })).not.toThrow();
    const e = figure.getElement('obj');
    expect(e.drawingObject.maskTextures.map(m => m.id)).toEqual(['/mask.png']);
    expect(e.drawingObject.fragmentShader.masks).toBe(1);
  });

  test('invalid mask slots stay positional (later masks keep their tint block)', () => {
    const figure = new Figure({ htmlId: 'c', color: [1, 0, 0, 1] });
    figure.add({
      name: 'holey',
      make: 'gl',
      vertices: [-1, -1, 1, -1, 1, 1],
      texture: { src: '/base.png', coords: [0, 0, 1, 0, 1, 1] },
      masks: [null, { src: '/real.png' }], // hole at slot 0
      tints: [
        [1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1], [1, 1, 0, 1], // slot 0 (no-op)
        [0.5, 0, 0.5, 1], // slot 1 (real mask), tint 4
      ],
    });
    const e = figure.getElement('holey');
    // Two positional slots: a transparent placeholder then the real mask.
    expect(e.drawingObject.fragmentShader.masks).toBe(2);
    expect(e.drawingObject.maskTextures[0].src).toBe(''); // placeholder
    expect(e.drawingObject.maskTextures[1].id).toBe('/real.png');
    // The real mask keeps slot 1, so it uses tints 4..7 (not 0..3).
    expect(e.drawingObject.uniforms.u_tint4.value).toEqual([0.5, 0, 0.5, 1]);
  });

  test('empty masks array falls back to the singular mask', () => {
    const figure = new Figure({ htmlId: 'c', color: [1, 0, 0, 1] });
    figure.add({
      name: 'fallback',
      make: 'gl',
      vertices: [-1, -1, 1, -1, 1, 1],
      texture: { src: '/base.png', coords: [0, 0, 1, 0, 1, 1] },
      masks: [],
      mask: { src: '/mask.png' },
      tints: [[1, 0, 0, 1]],
    });
    const e = figure.getElement('fallback');
    expect(e.drawingObject.fragmentShader.color).toBe('textureMap');
    expect(e.drawingObject.maskTextures.map(m => m.id)).toEqual(['/mask.png']);
  });

  test('masks of only invalid entries falls back to plain texture mode', () => {
    const figure = new Figure({ htmlId: 'c', color: [1, 0, 0, 1] });
    figure.add({
      name: 'allInvalid',
      make: 'gl',
      vertices: [-1, -1, 1, -1, 1, 1],
      texture: { src: '/base.png', coords: [0, 0, 1, 0, 1, 1] },
      masks: [null, {}],
    });
    const e = figure.getElement('allInvalid');
    expect(e.drawingObject.fragmentShader.color).toBe('texture');
    expect(e.drawingObject.maskTextures).toEqual([]);
  });

  test('too many masks for the device throws a clear error', () => {
    // Report only 2 texture units for the unit-count query.
    const realGetParameter = gl.getParameter;
    gl.getParameter = jest.fn(p => (p === gl.MAX_TEXTURE_IMAGE_UNITS ? 2 : realGetParameter(p)));
    const figure = new Figure({ htmlId: 'c', color: [1, 0, 0, 1] });
    expect(() => figure.add({
      name: 'tooMany',
      make: 'gl',
      vertices: [-1, -1, 1, -1, 1, 1],
      texture: { src: '/base.png', coords: [0, 0, 1, 0, 1, 1] },
      masks: [{ src: '/m0.png' }, { src: '/m1.png' }], // 2 masks + base = 3 > 2 units
    })).toThrow(/texture units/);
  });

  test('a single mask still produces exactly one mask sampler (cost parity)', () => {
    const e = addMaskElement();
    expect(e.drawingObject.fragmentShader.masks).toBe(1);
    const samplers = (e.drawingObject.webgl.programs[e.drawingObject.programIndex]
      .fragmentShader.src.match(/uniform sampler2D u_mask/g) || []).length;
    expect(samplers).toBe(1);
    expect(e.drawingObject.uniforms.u_tint4).toBeUndefined();
  });

  test('no mask option leaves the plain texture color mode and no tints', () => {
    const figure = new Figure({ htmlId: 'c', color: [1, 0, 0, 1] });
    figure.add({
      name: 'plain',
      make: 'gl',
      vertices: [-1, -1, 1, -1, 1, 1],
      texture: { src: '/base.png', coords: [0, 0, 1, 0, 1, 1] },
    });
    const e = figure.getElement('plain');
    expect(e.drawingObject.fragmentShader.color).toBe('texture');
    expect(e.drawingObject.maskTextures).toEqual([]);
    expect(e.customState.tints).toBeUndefined();
  });

  test('a mask without a source falls back to the plain texture color mode', () => {
    const figure = new Figure({ htmlId: 'c', color: [1, 0, 0, 1] });
    figure.add({
      name: 'noSrc',
      make: 'gl',
      vertices: [-1, -1, 1, -1, 1, 1],
      texture: { src: '/base.png', coords: [0, 0, 1, 0, 1, 1] },
      mask: {},
      tints: [[1, 0, 0, 1]],
    });
    const e = figure.getElement('noSrc');
    // No valid mask source -> do not select textureMap, do not bind/seed a mask.
    expect(e.drawingObject.fragmentShader.color).toBe('texture');
    expect(e.drawingObject.maskTextures).toEqual([]);
    expect(e.drawingObject.uniforms.u_tint0).toBeUndefined();
    expect(e.customState.tints).toBeUndefined();
  });
});
