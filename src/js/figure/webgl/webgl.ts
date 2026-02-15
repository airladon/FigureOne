
import getShaders from './shaders';
import type { TypeFragmentShader, TypeVertexShader } from './shaders';
import TargetTexture from './target';
import { hash32 } from '../../tools/tools';
import FontManager from '../FontManager';
import { FunctionMap } from '../../tools/FunctionMap';
import { colorToInt } from '../../tools/color';
import Atlas from './Atlas';
import type { TypeColor } from '../../tools/types';
import type { OBJ_Atlas } from './Atlas';

const glMock = {
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
  BLEND: 1,
  COLOR_BUFFER_BIT: 1,
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
  createTexture: () => {},
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
  const shader = gl.createShader(type)!;
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
    return createProgram(gl, vertexShader, fragmentShader);
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
      index: number;
      state: 'loading' | 'loaded';
      onLoad: Array<((b: boolean, n: number) => void) | string>;
    };
  };

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
      If the texture already exits, then return its index. If the texture is
      still loading, then add the onLoad callback to the list of callbacks to
      be called once the texture loads.
    */
    if (!force && this.textures[id] != null) {
      if (this.textures[id].state === 'loaded') {
        if (onLoad != null) {
          this.textures[id].onLoad.push(onLoad);
        }
        this.onLoad(id);
        return this.textures[id].index;
      }
      // Otherwise loading
      if (onLoad != null) {
        this.textures[id].onLoad.push(onLoad);
      }
      return this.textures[id].index;;
    }
    let index = 0;
    if (this.textures[id] != null) {
      index = this.textures[id].index;
    } else {
      index = Object.keys(this.textures).length + 1;
    }
    // If a texture already exists, then unload it
    this.deleteTexture(id);
    const { gl } = this;

    this.textures[id] = {
      id,
      state: 'loading',
      onLoad: [],
      index,
      data: null,
    } as any;
    const texture = this.textures[id];
    if (onLoad != null) {
      texture.onLoad.push(onLoad);
    }
    // If the data is a url string, then load the data into an image
    if (typeof data === 'string') {
      this.setTextureData(id, loadColor);
      const image = new Image();
      texture.state = 'loading';

      image.src = data;
      // When the image is loaded, set the texture to it
      image.addEventListener('load', () => {
        (texture as any).data = image;
        this.setTextureData(id, image, repeat);
        this.onLoad(id);
        texture.state = 'loaded';
      });
    } else {
      (texture as any).data = data;
      // Otherwise, the data is an image so set it directly
      this.setTextureData(id, data, repeat);
      this.onLoad(id);
      texture.state = 'loaded';
    }
    return this.textures[id].index;
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
    Object.keys(this.atlases).forEach(textureID => this.atlases[textureID].recreate());
  }

  deleteTexture(id: string) {
    const texture = this.textures[id];
    if (texture == null) {
      return;
    }
    const { gl } = this;

    // If texture exists, then delete it
    if (texture.glTexture != null) {
      gl.activeTexture(gl.TEXTURE0 + texture.index);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.deleteTexture(texture.glTexture);
    }
    this.cancel(id);
    delete this.textures[id];
  }

  contextLost() {
    Object.keys(this.textures).forEach((id) => {
      this.textures[id].glTexture = null as any;
    });
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
    const { index } = texture;
    const { gl } = this;

    // If texture exists, then delete it
    if (texture.glTexture != null) {
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.deleteTexture(texture.glTexture);
    }
    // Create a texture
    const glTexture = gl.createTexture();
    texture.glTexture = glTexture;
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
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
    this.textures[id].onLoad.forEach(f => this.fnMap.exec(f, true, this.textures[id].index));
    this.textures[id].onLoad = [];
  }

  cancel(id: string) {
    this.textures[id].onLoad.forEach(f => this.fnMap.exec(f, false, this.textures[id].index));
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
    if (this.lastUsedProgram !== program.program) {
      this.gl.useProgram(program.program);
      this.lastUsedProgram = program.program;
    }
    return program.locations;
  }

  constructor(
  canvas: HTMLCanvasElement,
  // vertexSource: string,
  // fragmentSource: string,
  // shaderLocations: Array<string>,
  backgroundColor: Array<number>,
) {
    let gl: WebGLRenderingContext | null = canvas.getContext('webgl', {
      antialias: true,
      // premultipliedAlpha: false,
      // alpha: false
    });
    this.fnMap = new FunctionMap();
    this.fontManager = new FontManager();
    this.atlases = {};
    if (gl == null) {
      gl = glMock as any;
    }
    if (gl != null) {
      this.init(gl);
    }
  }

  init(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.textures = {};
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
