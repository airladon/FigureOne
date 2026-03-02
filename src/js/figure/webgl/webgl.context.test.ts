import FontManager from '../FontManager';
import WebGLInstance from './webgl';
import { FigureFont } from '../DrawingObjects/TextObject/TextObject';
import Scene from '../../tools/geometry/scene';
import Figure from '../Figure';
import * as tools from '../../tools/tools';

jest.mock('../Gesture');
jest.mock('../DrawContext2D');
jest.mock('../DrawingObjects/HTMLObject/HTMLObject');

tools.isTouchDevice = jest.fn();

// Create a minimal mock GL context that behaves normally
function createMockGL() {
  return {
    TRIANGLES: 4,
    TRIANGLE_STRIP: 5,
    TRIANGLE_FAN: 6,
    LINES: 1,
    LINK_STATUS: 0x8B82,
    VERTEX_SHADER: 0x8B31,
    COMPILE_STATUS: 0x8B81,
    FRAGMENT_SHADER: 0x8B30,
    SRC_ALPHA: 0x0302,
    ONE: 1,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    BLEND: 0x0BE2,
    COLOR_BUFFER_BIT: 0x4000,
    TEXTURE_2D: 0x0DE1,
    RGBA: 0x1908,
    UNSIGNED_BYTE: 0x1401,
    TEXTURE_WRAP_S: 0x2802,
    CLAMP_TO_EDGE: 0x812F,
    TEXTURE_WRAP_T: 0x2803,
    TEXTURE_MIN_FILTER: 0x2801,
    LINEAR: 0x2601,
    ARRAY_BUFFER: 0x8892,
    STATIC_DRAW: 0x88E4,
    FLOAT: 0x1406,
    UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241,
    UNPACK_FLIP_Y_WEBGL: 0x9240,
    TEXTURE0: 0x84C0,
    DEPTH_TEST: 0x0B71,
    RENDERBUFFER: 0x8D41,
    FRAMEBUFFER: 0x8D40,
    COLOR_ATTACHMENT0: 0x8CE0,
    DEPTH_ATTACHMENT: 0x8D00,
    DEPTH_COMPONENT16: 0x81A5,
    MAX_TEXTURE_SIZE: 0x0D33,
    drawingBufferWidth: 100,
    drawingBufferHeight: 100,
    createBuffer: jest.fn(() => ({})),
    deleteBuffer: jest.fn(),
    bindBuffer: jest.fn(),
    bufferData: jest.fn(),
    enableVertexAttribArray: jest.fn(),
    vertexAttribPointer: jest.fn(),
    disableVertexAttribArray: jest.fn(),
    uniformMatrix3fv: jest.fn(),
    uniform4f: jest.fn(),
    uniform1f: jest.fn(),
    uniform1i: jest.fn(),
    uniform3fv: jest.fn(),
    texParameteri: jest.fn(),
    drawArrays: jest.fn(),
    clearColor: jest.fn(),
    clear: jest.fn(),
    createTexture: jest.fn(() => ({})),
    activeTexture: jest.fn(),
    bindTexture: jest.fn(),
    pixelStorei: jest.fn(),
    texImage2D: jest.fn(),
    blendFunc: jest.fn(),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    getProgramParameter: jest.fn(() => true),
    getProgramInfoLog: jest.fn(() => ''),
    createProgram: jest.fn(() => ({ id: 'program' })),
    deleteProgram: jest.fn(),
    createShader: jest.fn(type => ({ type })),
    shaderSource: jest.fn(),
    compileShader: jest.fn(),
    getShaderParameter: jest.fn(() => true),
    getAttribLocation: jest.fn(() => 0),
    getUniformLocation: jest.fn(() => ({})),
    enable: jest.fn(),
    disable: jest.fn(),
    deleteShader: jest.fn(),
    useProgram: jest.fn(),
    viewport: jest.fn(),
    REPEAT: 0x2901,
    generateMipmap: jest.fn(),
    deleteTexture: jest.fn(),
    getParameter: jest.fn(() => 4096),
    getExtension: jest.fn(() => ({ loseContext: jest.fn() })),
    createRenderbuffer: jest.fn(() => ({})),
    bindRenderbuffer: jest.fn(),
    createFramebuffer: jest.fn(() => ({})),
    bindFramebuffer: jest.fn(),
    framebufferTexture2D: jest.fn(),
    framebufferRenderbuffer: jest.fn(),
    renderbufferStorage: jest.fn(),
    canvas: {
      toDataURL: () => '',
      width: 100,
      clientWidth: 100,
      clientHeight: 100,
      height: 100,
      style: { top: 0, visibility: 'visible' },
    },
  };
}

describe('WebGL context loss handling', () => {
  let gl;
  let webgl;
  let origCreateElement;

  beforeEach(() => {
    // Reset FontManager singleton so each test gets a fresh one
    FontManager.instance = undefined;

    // Mock document.createElement to return a canvas with 2D context
    origCreateElement = document.createElement.bind(document);
    document.createElement = (name) => {
      const el = origCreateElement(name);
      if (name === 'canvas') {
        el.getContext = (type) => {
          if (type === '2d') {
            return {
              canvas: el,
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
          return gl;
        };
      }
      return el;
    };

    gl = createMockGL();
    const canvas = {
      width: 100,
      clientWidth: 100,
      height: 100,
      clientHeight: 100,
      style: { top: 0, visibility: 'visible' },
      getContext: () => gl,
    };
    webgl = new WebGLInstance(canvas, [1, 1, 1, 1]);
  });

  afterEach(() => {
    document.createElement = origCreateElement;
  });

  describe('getProgram with working context', () => {
    test('creates a program and returns a valid index', () => {
      const index = webgl.getProgram('simple', 'simple');
      expect(index).toBeGreaterThanOrEqual(0);
      expect(webgl.programs[index]).toBeDefined();
      expect(webgl.programs[index].program).toBeDefined();
    });

    test('reuses existing program for same shaders', () => {
      const index1 = webgl.getProgram('simple', 'simple');
      const index2 = webgl.getProgram('simple', 'simple');
      expect(index1).toBe(index2);
    });
  });

  describe('getProgram with lost context (createShader returns null)', () => {
    test('returns -1', () => {
      gl.createShader.mockReturnValue(null);
      const index = webgl.getProgram('simple', 'simple');
      expect(index).toBe(-1);
    });

    test('does not add a broken program to the programs array', () => {
      const lengthBefore = webgl.programs.length;
      gl.createShader.mockReturnValue(null);
      webgl.getProgram('simple', 'simple');
      expect(webgl.programs.length).toBe(lengthBefore);
    });

    test('does not call shaderSource', () => {
      gl.createShader.mockReturnValue(null);
      gl.shaderSource.mockClear();
      webgl.getProgram('simple', 'simple');
      expect(gl.shaderSource).not.toHaveBeenCalled();
    });
  });

  describe('useProgram with invalid index', () => {
    test('returns null for index -1', () => {
      const result = webgl.useProgram(-1);
      expect(result).toBeNull();
    });

    test('returns null for out-of-bounds index', () => {
      const result = webgl.useProgram(999);
      expect(result).toBeNull();
    });

    test('does not call gl.useProgram for invalid index', () => {
      gl.useProgram.mockClear();
      webgl.useProgram(-1);
      expect(gl.useProgram).not.toHaveBeenCalled();
    });
  });

  describe('context loss then recovery', () => {
    test('programs work after re-init', () => {
      // Normal operation
      const index1 = webgl.getProgram('simple', 'simple');
      expect(index1).toBeGreaterThanOrEqual(0);

      // Context lost - createShader returns null
      gl.createShader.mockReturnValue(null);
      const lostIndex = webgl.getProgram(
        { color: 'vertex', dimension: 2, light: null },
        { color: 'vertex', light: null },
      );
      expect(lostIndex).toBe(-1);

      // Context restored - re-init clears programs, createShader works again
      gl.createShader.mockImplementation(type => ({ type }));
      webgl.init(gl);
      const index2 = webgl.getProgram('simple', 'simple');
      expect(index2).toBeGreaterThanOrEqual(0);
      expect(webgl.programs[index2].program).toBeDefined();
    });
  });

  describe('atlas deduplication', () => {
    let scene;

    beforeEach(() => {
      scene = new Scene({});
    });

    test('reuses atlas when two fonts have the same properties', () => {
      const font1 = new FigureFont({ family: 'Helvetica', size: 0.2, glyphs: 'latin' });
      const font2 = new FigureFont({ family: 'Helvetica', size: 0.2, glyphs: 'latin' });

      const atlas1 = webgl.getAtlas({ font: font1, scene });
      const atlas2 = webgl.getAtlas({ font: font2, scene });

      expect(atlas1).toBe(atlas2);
      expect(Object.keys(webgl.atlases)).toHaveLength(1);
    });

    test('creates separate atlases for fonts with different families', () => {
      const font1 = new FigureFont({ family: 'Helvetica', size: 0.2, glyphs: 'latin' });
      const font2 = new FigureFont({ family: 'Arial', size: 0.2, glyphs: 'latin' });

      webgl.getAtlas({ font: font1, scene });
      webgl.getAtlas({ font: font2, scene });

      expect(Object.keys(webgl.atlases)).toHaveLength(2);
    });

    test('shares atlas for fonts with different sizes but same atlasId', () => {
      const font1 = new FigureFont({
        family: 'Helvetica', size: 0.2, glyphs: 'latin', atlasId: 'shared',
      });
      const font2 = new FigureFont({
        family: 'Helvetica', size: 0.5, glyphs: 'latin', atlasId: 'shared',
      });

      const atlas1 = webgl.getAtlas({ font: font1, scene });
      const atlas2 = webgl.getAtlas({ font: font2, scene });

      expect(atlas1).toBe(atlas2);
      expect(Object.keys(webgl.atlases)).toHaveLength(1);
    });
  });
});

describe('Figure atlas integration', () => {
  let origCreateElement;
  let gl;

  beforeEach(() => {
    FontManager.instance = undefined;

    document.body.innerHTML =
      '<div id="c">'
      + '  <canvas class="figureone__gl" id="id_figureone__gl__low">'
      + '  </canvas>'
      + '  <canvas class="figureone__text" id="id_figureone__text__low">'
      + '  </canvas>'
      + '  <div class="figureone__html">'
      + '  </div>'
      + '</div>';

    gl = createMockGL();

    origCreateElement = document.createElement.bind(document);
    document.createElement = (name) => {
      const el = origCreateElement(name);
      if (name === 'canvas') {
        el.getContext = (type) => {
          if (type === '2d') {
            return {
              canvas: el,
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
          return gl;
        };
      }
      return el;
    };

    // Also patch getContext on the existing DOM canvases
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach((canvas) => {
      // eslint-disable-next-line no-param-reassign
      canvas.getContext = (type) => {
        if (type === '2d') {
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
        return gl;
      };
    });
  });

  afterEach(() => {
    document.createElement = origCreateElement;
  });

  test('two gl text elements with different sizes but same atlasId share one atlas', () => {
    const figure = new Figure({ htmlId: 'c', color: [1, 0, 0, 1] });

    figure.add([
      {
        name: 'text1',
        make: 'text',
        text: 'hello',
        font: { size: 0.2, render: 'gl', atlasId: 'shared' },
      },
      {
        name: 'text2',
        make: 'text',
        text: 'world',
        font: { size: 0.5, render: 'gl', atlasId: 'shared' },
      },
    ]);

    expect(Object.keys(figure.webglLow.atlases)).toHaveLength(1);
  });
  test('two gl text elements with different sizes DO NOT share one atlas', () => {
    const figure = new Figure({ htmlId: 'c', color: [1, 0, 0, 1] });

    figure.add([
      {
        name: 'text1',
        make: 'text',
        text: 'hello',
        font: { size: 0.2, render: 'gl' },
      },
      {
        name: 'text2',
        make: 'text',
        text: 'world',
        font: { size: 0.5, render: 'gl' },
      },
    ]);

    expect(Object.keys(figure.webglLow.atlases)).toHaveLength(2);
  });
});
