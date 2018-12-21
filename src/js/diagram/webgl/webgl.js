// @flow

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  gl.deleteProgram(program);
  return null;
}


function createShader(gl: WebGLRenderingContext, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  gl.deleteShader(shader);
  return null;
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

function getGLLocations(gl, program, locationsList) {
  let i;
  const newLocations = {};
  let loc;
  for (i = 0; i < locationsList.length; i += 1) {
    loc = locationsList[i];
    if (loc[0] === 'a') {
      newLocations[loc] = gl.getAttribLocation(program, loc);
    }
    if (loc[0] === 'u') {
      newLocations[loc] = gl.getUniformLocation(program, loc);
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
function autoResize(event) {
  // let contRect = document.getElementById('container').getBoundingClientRect();
  // let diagRect = document.getElementById('diagram').getBoundingClientRect();
  // let textRect = document.getElementById('learning_text_container').getBoundingClientRect();
  // let canvRect = this.gl.canvas.getBoundingClientRect();
  // // console.log(contRect)
  // console.log(this.gl.canvas.getBoundingClientRect());
  // // this.gl.canvas.height = 500;
  // // this.gl.canvas.width = 500;
  // // this.gl.canvas.width=500;
  // // this.gl.viewport(diagRect.left, canvRect.height+canvRect.top, textRect.width, textRect.height); 
  // // this.gl.viewport(0,0,100,100);
  // // console.log(document.getElementById('Diagram').left);
}


class WebGLInstance {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  locations: Object;

  constructor(
  canvas: HTMLCanvasElement,
  vertexSource: string,
  fragmentSource: string,
  shaderLocations: Array<string>,
  backgroundColor: Array<number>,
) {
    const gl = canvas.getContext('webgl', { antialias: true });
    if (gl instanceof WebGLRenderingContext) {
      this.gl = gl;
      this.program = createProgramFromScripts(
        this.gl,
        vertexSource,
        fragmentSource,
      );

      this.locations = getGLLocations(this.gl, this.program, shaderLocations);

      // Prep canvas
      // resizeCanvasToDisplaySize(this.gl.canvas);
      this.resize();


      // Tell WebGL how to convert from clip space to pixels
      // this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      // gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

      // this.gl.viewport(0, 500, 500, 500);   // Tell WebGL how to convert from clip space to pixels

      // Clear the canvas
      // const bc = backgroundColor;
      // this.gl.clearColor(bc[0], bc[1], bc[2], bc[3]);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.disable(this.gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.enable(gl.BLEND);
      this.gl.useProgram(this.program);

      // window.addEventListener('resize', autoResize.bind(this, event));
    }
  }

  resize() {
    var realToCSSPixels = window.devicePixelRatio;
    // console.log("asdf");
    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    var displayWidth  =
      Math.floor(this.gl.canvas.clientWidth  * realToCSSPixels);
    var displayHeight =
      Math.floor(this.gl.canvas.clientHeight * realToCSSPixels);

    // Check if the canvas is not the same size.
    if (this.gl.canvas.width  !== displayWidth
        || this.gl.canvas.height !== displayHeight) {

      // Make the canvas the same size
      this.gl.canvas.width  = displayWidth;
      this.gl.canvas.height = displayHeight;
    }

    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
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
