
import getShaders from './shaders';
import type { TypeFragmentShader, TypeVertexShader } from './shaders';
import TargetTexture from './target';
import { hash32, Console } from '../../tools/tools';
import FontManager from '../FontManager';
import { FunctionMap } from '../../tools/FunctionMap';
import { colorToInt } from '../../tools/color';
import Atlas from './Atlas';
import type { TypeColor } from '../../tools/types';
import type { OBJ_Atlas } from './Atlas';

const glMock = {
  // Constants
  TRIANGLES: 1,
  TRIANGLE_STRIP: 2,
  TRIANGLE_FAN: 3,
  LINES: 4,
  LINK_STATUS: 1,
  VERTEX_SHADER: 1,
  COMPILE_STATUS: 1,
  FRAGMENT_SHADER: 1,
  SRC_ALPHA: 1,
  ONE_MINUS_SRC_ALPHA: 1,
  ONE: 1,
  BLEND: 1,
  COLOR_BUFFER_BIT: 1,
  DEPTH_TEST: 1,
  TEXTURE_2D: 1,
  RGBA: 1,
  UNSIGNED_BYTE: 1,
  TEXTURE_WRAP_S: 1,
  CLAMP_TO_EDGE: 1,
  TEXTURE_WRAP_T: 1,
  TEXTURE_MIN_FILTER: 1,
  LINEAR: 1,
  ARRAY_BUFFER: 1,
  STATIC_DRAW: 1,
  FLOAT: 1,
  UNPACK_PREMULTIPLY_ALPHA_WEBGL: 1,
  UNPACK_FLIP_Y_WEBGL: 1,
  REPEAT: 1,
  TEXTURE0: 1,
  RENDERBUFFER: 1,
  FRAMEBUFFER: 1,
  COLOR_ATTACHMENT0: 1,
  DEPTH_ATTACHMENT: 1,
  DEPTH_COMPONENT16: 1,

  // Methods
  createBuffer: () => {},
  bindBuffer: () => {},
  bufferData: () => {},
  enableVertexAttribArray: () => {},
  vertexAttribPointer: () => {},
  disableVertexAttribArray: () => {},
  uniformMatrix3fv: () => {},
  uniform4f: () => {},
  uniform1f: () => {},
  uniform1i: () => {},
  texParameteri: () => {},
  drawArrays: () => {},
  clearColor: () => {},
  clear: () => {},
  createTexture: () => null,
  activeTexture: () => {},
  bindTexture: () => {},
  pixelStorei: () => {},
  texImage2D: () => {},
  blendFunc: () => {},
  attachShader: () => {},
  linkProgram: () => {},
  getProgramParameter: () => {},
  createProgram: () => {},
  deleteProgram: () => {},
  createShader: () => {},
  shaderSource: () => {},
  compileShader: () => {},
  getShaderParameter: () => {},
  getAttribLocation: () => {},
  getUniformLocation: () => {},
  enable: () => {},
  map: () => {},
  getExtension: () => ({
    loseContext: () => {},
  }),
  disable: () => {},
  deleteShader: () => {},
  useProgram: () => {},
  viewport: () => {},
  generateMipmap: () => {},
  deleteTexture: () => {},
  getProgramInfoLog: () => '',

  // Framebuffer/renderbuffer methods (used by TargetTexture)
  createRenderbuffer: () => null,
  bindRenderbuffer: () => {},
  renderbufferStorage: () => {},
  createFramebuffer: () => null,
  bindFramebuffer: () => {},
  framebufferTexture2D: () => {},
  framebufferRenderbuffer: () => {},
  deleteRenderbuffer: () => {},
  deleteFramebuffer: () => {},

  drawingBufferWidth: 100,
  drawingBufferHeight: 100,
  canvas: ({
    toDataURL: () => '',
    width: 100,
    clientHeight: 100,
    height: 100,
    style: {
      top: 0,
      visibility: 'visible',
    },
  }),

};

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw new Error(`Could not compile WebGL program. \n\n ${info || ''}`);
  }
  return program;
}


function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  throw new Error(`Could not compile shader: ${source}`);
}


function createProgramFromScripts(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
) {
  // Get the strings for our GLSL shaders
  // const vertexShaderSource = document.getElementById(vertexScript).text;
  // const fragmentShaderSource = document.getElementById(fragScript).text;
  // create GLSL shaders, upload the GLSL source, compile the shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);


  // Link the two shaders into a program
  if (vertexShader && fragmentShader) {
    const program = createProgram(gl, vertexShader, fragmentShader);
    // Shaders can be safely deleted after linking — they're flagged for
    // deletion and freed when the program is deleted
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return program;
  }
  return null;
}

function getGLLocations(gl: WebGLRenderingContext, program: WebGLProgram | null, locationsList: string[]) {
  let i;
  const newLocations: Record<string, any> = {};
  let loc;
  for (i = 0; i < locationsList.length; i += 1) {
    loc = locationsList[i];
    if (loc[0] === 'a') {
      newLocations[loc] = gl.getAttribLocation(program!, loc);
    }
    if (loc[0] === 'u') {
      newLocations[loc] = gl.getUniformLocation(program!, loc);
    }
  }
  return newLocations;
}

// function resizeCanvasToDisplaySize(canvas) {
//   // const mul = multiplier || 1;
//   const mul = window.devicePixelRatio || 1;
//   const width = canvas.clientWidth * mul || 0;
//   const height = canvas.clientHeight * mul || 0;

//   if (canvas.width !== width || canvas.height !== height) {
//     canvas.width = width;     // eslint-disable-line no-param-reassign
//     canvas.height = height;   // eslint-disable-line no-param-reassign
//     return true;
//   }
//   return false;
// }

/* eslint-disable */
function autoResize(event: any) {
  // let contRect = document.getElementById('container').getBoundingClientRect();
  // let diagRect = document.getElementById('figure').getBoundingClientRect();
  // let textRect = document.getElementById('learning_text_container').getBoundingClientRect();
  // let canvRect = this.gl.canvas.getBoundingClientRect();
  // // this.gl.canvas.height = 500;
  // // this.gl.canvas.width = 500;
  // // this.gl.canvas.width=500;
  // // this.gl.viewport(diagRect.left, canvRect.height+canvRect.top, textRect.width, textRect.height); 
  // // this.gl.viewport(0,0,100,100);
}


/*
  A webgl instance manages a webgl context.
  
  It loads and manages programs, shaders and textures for the context, and by extension also manages font atlases (as each atlas is a texture).
*/
class WebGLInstance {
  gl!: WebGLRenderingContext;
  program!: WebGLProgram;
  // locations: Object;
  lastUsedProgram!: WebGLProgram | null;
  textures!: {
    [name: string]: {
      glTexture: WebGLTexture;
      // Stable, monotonic id for the texture. NOT a texture unit number — units
      // are assigned per draw from a small shared pool (see bindTextureToUnit).
      handle: number;
      // Number of live owners referencing this id (e.g. several GLText elements
      // sharing one font atlas, plus the Atlas itself). The GL texture is freed
      // only when this reaches zero — see addTexture/deleteTexture.
      refCount: number;
      state: 'loading' | 'loaded';
      onLoad: Array<((b: boolean, n: number) => void) | string>;
    };
  };

  // Content texture units are a small shared pool reused across draws. Unit 0 is
  // reserved for the target/selector framebuffer texture, so content starts at
  // unit 1. boundUnits[u] tracks which texture id is currently bound to GL unit
  // u, so bindTextureToUnit can skip redundant binds (bind-on-change).
  boundUnits!: Array<string | null>;
  // Monotonic source for texture handles (never reused, so deleting a texture
  // can never cause a later texture to collide with a live one).
  nextTextureHandle!: number;
  // gl.MAX_TEXTURE_IMAGE_UNITS (the fragment-shader sampler limit), queried once
  // for a diagnostic warning. Matches the per-object mask guard in
  // FigurePrimitives.gl().
  maxTextureUnits!: number;
  // Set once the unit-budget warning has fired, so it isn't logged every frame.
  warnedUnitOverflow!: boolean;

  atlases: {
    [atlasId: string]: Atlas;
  };

  programs!: Array<{
    vars: Array<string>;
    vertexShader: {
      src: string;
      hash: number;
    };
    fragmentShader: {
      src: string;
      hash: number;
    };
    locations: Record<string, any>;
    program: WebGLProgram;
  }>;

  targetTexture!: null | TargetTexture;
  fnMap: FunctionMap;
  fontManager: FontManager;

  /*
    Add, or update a texture. If the texture already exists, then do nothing.

    A texture is referenced with a unique id, and defined by either a url (string), Image or html canvas element.

    If the texture is a url, then it will be asynchronously loaded, and so a temporary solid color texture width color `loadColor` will be used in its place temporarily.

    `repeat` can only repeat textures if the texture is a multiple of 2.

    `onLoad` is a callback called once the url texture is loaded

    Use `force` to force overwriting a texture that already exits
  */
  addTexture(
    id: string,
    data: string | HTMLImageElement | HTMLCanvasElement,
    loadColor: TypeColor = [0, 0, 0, 0],
    repeat: boolean = false,
    onLoad: null | string | ((b: boolean, n: number) => void) = null,
    force: boolean = false,
  ) {
    /*
      A texture id can be shared by multiple owners (e.g. several GLText elements
      using the same font atlas, plus the Atlas itself). Each addTexture call
      that isn't a forced content update acquires one reference; deleteTexture
      releases one, and the GL texture is freed only when the last owner releases
      it. This lets one element's cleanup() drop its reference without pulling a
      still-shared texture out from under the survivors.

      If the texture already exists and is still loading, the onLoad callback is
      added to the list to be called once the texture loads.
    */
    if (!force && this.textures[id] != null) {
      // Another owner (or the same owner re-acquiring) references an existing
      // texture: take a reference and (re)register the load callback.
      const existingTexture = this.textures[id];
      existingTexture.refCount += 1;
      if (onLoad != null) {
        existingTexture.onLoad.push(onLoad);
      }
      if (existingTexture.state === 'loaded') {
        this.onLoad(id);
      }
      return existingTexture.handle;
    }
    const { gl } = this;
    if (this.textures[id] != null) {
      // Forced content update of an existing texture: keep its identity AND
      // reference count so other owners survive the update. setTextureData
      // (below) frees and replaces the old glTexture, so the entry — including
      // its glTexture pointer — is preserved here rather than recreated.
      // Append (don't replace) onLoad so pending callbacks other owners
      // registered while the texture was still loading aren't silently dropped.
      this.textures[id].state = 'loading';
      if (onLoad != null) {
        this.textures[id].onLoad.push(onLoad);
      }
    } else {
      // Brand new texture: the first owner holds the only reference.
      this.textures[id] = {
        id,
        state: 'loading',
        onLoad: onLoad != null ? [onLoad] : [],
        handle: this.nextTextureHandle,
        refCount: 1,
      } as any;
      this.nextTextureHandle += 1;
    }
    const texture = this.textures[id];
    // If the data is a url string, then load the data into an image
    if (typeof data === 'string') {
      this.setTextureData(id, loadColor);
      const image = new Image();
      texture.state = 'loading';

      image.src = data;
      // When the image is loaded, set the texture to it
      image.addEventListener('load', () => {
        this.setTextureData(id, image, repeat);
        this.onLoad(id);
        texture.state = 'loaded';
      });
    } else {
      // Otherwise, the data is an image/canvas so set it directly
      this.setTextureData(id, data, repeat);
      this.onLoad(id);
      texture.state = 'loaded';
    }
    return this.textures[id].handle;
  }

  getAtlas(options: OBJ_Atlas) {
    const font = options.font;
    const textureID = (font as any).getTextureID();
    if (this.atlases[textureID] != null) {
      return this.atlases[textureID];
    }
    const atlas = new Atlas(this, options);
    this.atlases[textureID] = atlas;
    // atlas.notifications.add('updated', () => {
    //   // Notification for primitives
    //   this.notifications.publish('atlasUpdated', textureID);
    //   // Notificaiton for collections
    //   this.notifications.publish('atlasUpdated2', textureID);
    // });
    return atlas;
  }

  recreateAtlases() {
    const errors: Array<Error> = [];
    Object.keys(this.atlases).forEach(textureID => {
      try {
        this.atlases[textureID].recreate();
      } catch (e) {
        errors.push(e instanceof Error ? e : new Error(String(e)));
      }
    });
    if (errors.length > 0) {
      throw errors[0];
    }
  }

  // Take an additional reference to an already-registered texture, without
  // re-uploading it or touching its load callbacks. Used when an element adopts
  // a texture another owner created and uploaded (e.g. a GLText element sharing
  // a font atlas registered by the Atlas). Returns false if the texture isn't
  // registered yet, in which case no reference was taken. Release with
  // deleteTexture.
  acquireTexture(id: string): boolean {
    const texture = this.textures[id];
    if (texture == null) {
      return false;
    }
    texture.refCount += 1;
    return true;
  }

  // Release one reference to a texture. The GL texture is freed only once the
  // last owner releases it, so one element's cleanup can't delete a texture
  // another element still shares (see addTexture for the rationale).
  deleteTexture(id: string) {
    const texture = this.textures[id];
    if (texture == null) {
      return;
    }
    texture.refCount -= 1;
    if (texture.refCount <= 0) {
      this.freeTexture(id);
    }
  }

  // Unconditionally free a texture regardless of reference count. Used for
  // teardown (cleanup), where every owner is going away at once.
  freeTexture(id: string) {
    const texture = this.textures[id];
    if (texture == null) {
      return;
    }
    const { gl } = this;
    // gl.deleteTexture unbinds it from any unit it was bound to, so we just drop
    // the stale cache entries.
    if (texture.glTexture != null) {
      gl.deleteTexture(texture.glTexture);
      this.clearBoundUnits(id);
    }
    this.cancel(id);
    delete this.textures[id];
  }

  contextLost() {
    Object.keys(this.textures).forEach((id) => {
      this.textures[id].glTexture = null as any;
    });
    // The new context starts with nothing bound, so the bind cache is stale.
    this.boundUnits = [];
  }

  // Drop any working-unit cache entries that point at this texture id, so a
  // future draw re-binds rather than trusting a stale/deleted glTexture.
  clearBoundUnits(id: string) {
    for (let u = 0; u < this.boundUnits.length; u += 1) {
      if (this.boundUnits[u] === id) {
        this.boundUnits[u] = null;
      }
    }
  }

  /*
    Bind a registered texture to a content texture unit for the current draw.

    Content units are a small shared pool (unit 0 is reserved for the
    target/selector framebuffer texture). bindTexture is only issued when the
    unit is not already pointing at this texture, so runs of draws that share a
    texture (e.g. text sharing a font atlas) issue zero bind calls.
  */
  bindTextureToUnit(id: string, unit: number): boolean {
    const texture = this.textures[id];
    if (texture == null || texture.glTexture == null) {
      return false;
    }
    if (unit >= this.maxTextureUnits) {
      // Out of unit budget: warn once (not every frame) and don't issue an
      // out-of-range bind. The caller treats false as "not bound".
      if (!this.warnedUnitOverflow) {
        Console(
          `FigureOne WebGL warning: texture unit ${unit} exceeds this device's `
          + `MAX_TEXTURE_IMAGE_UNITS (${this.maxTextureUnits}). Reduce the `
          + 'number of simultaneous textures/masks.',
        );
        this.warnedUnitOverflow = true;
      }
      return false;
    }
    if (this.boundUnits[unit] === id) {
      return true;
    }
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);
    this.boundUnits[unit] = id;
    return true;
  }

  cleanup() {
    const { gl } = this;
    // Delete all programs
    this.programs.forEach((p) => {
      if (p.program) {
        gl.deleteProgram(p.program);
      }
    });
    this.programs = [];
    // Free all textures outright, ignoring reference counts — every owner is
    // going away in this teardown.
    Object.keys(this.textures).forEach((id) => {
      this.freeTexture(id);
    });
    this.textures = {};
    // Clean up atlases
    this.atlases = {};
    // Clean up target texture
    if (this.targetTexture) {
      this.targetTexture.cleanup();
      this.targetTexture = null;
    }
    this.lastUsedProgram = null;
  }


  setTextureData(
    id: string,
    image: Record<string, any> | TypeColor, // image data
    repeat: boolean = false,
  ) {
    function isPowerOf2(value: number) { // eslint-disable-next-line no-bitwise
      return (value & (value - 1)) === 0;
    }

    const texture = this.textures[id];
    const { gl } = this;
    // Upload happens on the first content unit as scratch. Any cache entry for
    // this id refers to the old glTexture we're about to replace, so invalidate
    // them all before binding the new one.
    const uploadUnit = 1;
    this.clearBoundUnits(id);

    // If texture exists, then delete it
    if (texture.glTexture != null) {
      gl.activeTexture(gl.TEXTURE0 + uploadUnit);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.deleteTexture(texture.glTexture);
    }
    // Create a texture
    const glTexture = gl.createTexture();
    texture.glTexture = glTexture;
    gl.activeTexture(gl.TEXTURE0 + uploadUnit);
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    // The new glTexture is now bound to the upload unit; record it so a draw
    // that needs it on this unit can skip a redundant bind.
    this.boundUnits[uploadUnit] = id;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    // If image is a color, then create s ingle pixel image of that color
    if (Array.isArray(image)) {
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(colorToInt(image)),
      );
      return false;
    }

    // Load the image
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA,
      gl.RGBA, gl.UNSIGNED_BYTE, image as any,
    );
    // Check if the image is a power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
      if (repeat != null && repeat === true) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
    } else {
      // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    return true;
  }

  // addTexture(
  //   id: string,
  //   glTexture: WebGLTexture,
  //   type: 'image' | 'canvasText',
  //   atlas: Object = {},
  //   atlasDimension: number = 0,
  // ) {
  //   if (this.textures[id] && this.textures[id].glTexture != null) {
  //     return this.textures[id].index;
  //   }
  //   // Texture index 0 is dedicated to the target texture
  //   let index = 1;
  //   if (this.textures[id]) {
  //     index = this.textures[id].index;
  //   } else {
  //     index = Object.keys(this.textures).length + 1;
  //   }
  //   this.textures[id] = {
  //     glTexture,
  //     index,
  //     type,
  //     state: 'loaded',
  //     onLoad: [],
  //     atlas,
  //     atlasDimension,
  //   };
  //   return index;
  // }

  onLoad(id: string) {
    this.textures[id].onLoad.forEach(f => this.fnMap.exec(f, true, this.textures[id].handle));
    this.textures[id].onLoad = [];
  }

  cancel(id: string) {
    this.textures[id].onLoad.forEach(f => this.fnMap.exec(f, false, this.textures[id].handle));
    this.textures[id].onLoad = [];
  }

  getProgram(
    vertexShader: TypeVertexShader,
    fragmentShader: TypeFragmentShader,
  ) {
    // for (let i = 0; i < this.programs.length; i += 1) {
    //   const program = this.programs[i];
    //   if (program.vertexShader.def === vertexShader
    //     && program.fragmentShader.def === fragmentShader
    //   ) {
    //     return i;
    //   }
    // }
    const shaders = getShaders(vertexShader, fragmentShader);
    const hashVertexSrc = hash32((shaders as any).vertexSource);
    const hashFragmentSrc = hash32((shaders as any).fragmentSource);
    for (let i = 0; i < this.programs.length; i += 1) {
      const program = this.programs[i];
      if (program.vertexShader.hash === hashVertexSrc
        && program.fragmentShader.hash === hashFragmentSrc
      ) {
        return i;
      }
    }

    const newProgram = createProgramFromScripts(
      this.gl,
      (shaders as any).vertexSource,
      (shaders as any).fragmentSource,
    );

    if (!newProgram) {
      return -1;
    }

    const programDetails = {
      vertexShader:{
        src: (shaders as any).vertexSource,
        hash: hash32((shaders as any).vertexSource),
        def: vertexShader,
      },
      fragmentShader:{
        src: (shaders as any).fragmentSource,
        hash: hash32((shaders as any).fragmentSource),
        def: fragmentShader,
      },
      vars: shaders.vars,
      // fragmentShader,
      program: newProgram,
      locations: getGLLocations(this.gl, newProgram, shaders.vars),
    };
    this.programs.push(programDetails as any);
    return this.programs.length - 1;
  }

  useProgram(programIndex: number) {
    const program = this.programs[programIndex];
    if (!program) {
      return null;
    }
    if (this.lastUsedProgram !== program.program) {
      this.gl.useProgram(program.program);
      this.lastUsedProgram = program.program;
    }
    return program.locations;
  }

  atlasScale: number;
  webglAvailable: boolean;

  constructor(
  canvas: HTMLCanvasElement,
  // vertexSource: string,
  // fragmentSource: string,
  // shaderLocations: Array<string>,
  backgroundColor: Array<number>,
  antialias: boolean = true,
  atlasScale: number = 2,
) {
    this.atlasScale = atlasScale;
    let gl: WebGLRenderingContext | null = canvas.getContext('webgl', {
      antialias,
      // premultipliedAlpha: false,
      // alpha: false
    });
    this.fnMap = new FunctionMap();
    this.fontManager = new FontManager();
    this.atlases = {};
    if (gl == null) {
      gl = glMock as any;
      this.webglAvailable = false;
    } else {
      this.webglAvailable = true;
    }
    this.init(gl!);
  }

  init(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.textures = {};
    this.boundUnits = [];
    this.nextTextureHandle = 1;
    this.warnedUnitOverflow = false;
    const maxUnits = gl.getParameter
      ? gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
      : 0;
    this.maxTextureUnits = maxUnits || 8;
    this.programs = [];
    this.targetTexture = null;
    this.lastUsedProgram = null;
    this.resize();
    // Clear the canvas - removing this as it's done in the draw frame
    // this.gl.clearColor(1, 1, 1, 1);
    // this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA)
    this.gl.enable(this.gl.BLEND);
    this.targetTexture = new TargetTexture(this);
    this.targetTexture.setFramebufferAttachmentSizes(this.gl.canvas.width, this.gl.canvas.height);
  }

  resize() {
    var realToCSSPixels = window.devicePixelRatio;
    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    var displayWidth  =
      Math.floor((this.gl.canvas as HTMLCanvasElement).clientWidth  * realToCSSPixels);
    var displayHeight =
      Math.floor((this.gl.canvas as HTMLCanvasElement).clientHeight * realToCSSPixels);
    // Check if the canvas is not the same size.
    if (this.gl.canvas.width  !== displayWidth
        || this.gl.canvas.height !== displayHeight) {

      // Make the canvas the same size
      this.gl.canvas.width  = displayWidth;
      this.gl.canvas.height = displayHeight;
    }

    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    if (this.targetTexture != null) {
      this.targetTexture.setFramebufferAttachmentSizes(this.gl.canvas.width, this.gl.canvas.height);
    }
  }
  // resize() {
  //   var width = this.gl.canvas.clientWidth;
  //   var height = this.gl.canvas.clientHeight;
  //   if (this.gl.canvas.width != width ||
  //       this.gl.canvas.height != height) {
  //      this.gl.canvas.width = width;
  //      this.gl.canvas.height = height;
  //      return true;
  //   }
  //   return false;
  // }

  // var needToRender = true;  // draw at least once
  // function checkRender() {
  //    if (resize() || needToRender) {
  //      needToRender = false;
  //      drawStuff();
  //    }
  //    requestAnimationFrame(checkRender);
  // }
  // checkRender();
}


export default WebGLInstance;
