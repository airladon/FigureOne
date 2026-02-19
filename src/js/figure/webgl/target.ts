
import type WebGLInstance from './webgl';

export default class TargetTexture {
  fb!: WebGLFramebuffer | null;
  webgl: WebGLInstance;
  target: WebGLTexture | null;
  depthBuffer: WebGLRenderbuffer | null;

  constructor(webgl: WebGLInstance) {
    this.webgl = webgl;
    const { gl } = webgl;
    // Create a texture to render to
    this.target = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.target);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // create a depth renderbuffer
    this.depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);

    // Create and bind the framebuffer
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.target, level);

    // make a depth buffer and the same size as the this.target
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer,
    );
  }

  setFramebufferAttachmentSizes(width: number, height: number) {
    const { gl } = this.webgl;
    // The target texture is always at texture index 0
    gl.activeTexture(
      gl.TEXTURE0,
    );
    gl.bindTexture(gl.TEXTURE_2D, this.target);
    // define size and format of level 0
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(
      gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data,
    );

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  }
}
