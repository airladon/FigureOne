// @flow

import FontManager from '../FontManager';
import { FigureFont } from '../DrawingObjects/TextObject/TextObject';
import { joinObjects, NotificationManager } from '../../tools/tools';
import type { TypeColor } from '../../tools/types';
import type Scene from '../../tools/geometry/scene';
import type WebGLInstance from './webgl';


/* eslint-disable max-len */
/*
 GLText asks for atlas from webgl

 Atlas monitors font if font doesn't exist, and recreates itself when loaded

 When atlas is recreated, GLText get's notification and will recreate its borders and alignment

 Collections that hold GLText should get notification when atlas changes so they can relayout text
    - Collections have a dictionary of child id <> textureID
    - When they get a notification a textureID changes, then they relayout themselves (the GLText should get the notifiation before hand and relayout itself)
    - For built in collections, a change in font results in GLText getting a new textureID which then gets updated in the collection dictionary

    OR
    - Collections have a list of textures their primitives use
    - Collections subscribe to WebGL Atlas change notifcations
    - When an atlas changes, if the TextureID is in the list, then the colleciton will relayout itself

  If the window resizes beyond a certain threshold, then automatically generated textures are recreated.

  IF GLText changes font, then it requests a new atlas from webgl
    - removes it's notification request from the current atlas
    - requests new atlas
    - adds notification request to new atlas

  Old atlases are not garbage collected
*/
/*
This is probably overly complicated.

An atlas is an image of glyphs with a corresponding map defining the location and size of each glyph.

The image is created from a font definition (family, weight, style, size) and a list of the glyphs.

Fonts may be system fonts (available immediately), cached or synchronous web fonts (also available immediately?) or web fonts loaded asynchronously (available after some period of time). Therefore, when creating an atlas, if the fonts are not immediately available, the atlas needs to be recreated when the fonts are available.

- Figure - on creation define which fonts are external and may be asynchronous. This will initiate FontManager to start watching for them. A notification will be send out when all fonts are loaded

- FontManager - determines if a font is available, and if not, will send out notifications when it is

- WebGLInstance - manages all atlases
                - GLText will request an atlas for some font, and WebGLInstance will create one, or return an existing one

- Atlas - Class that holds an atlas including. An atlas is unique by:
    - Font family
    - Font style
    - Font weight
    - Font size
    - Glyphs
    or is unique by a given id, custom image and map.
  If an atlas is created and the font is not yet available, then it will subscribe to FontManager and when the font is available will recreate the atlas, and send out a notification. Atlases contain the id of the texture representing the atlas loaded into webgl that GLObjects can use to draw

- GLText - On creation, it will request an atlas. It will subscribe to the atlas for any recreation notifications, and when they happen, it will update its measurements, alignment and borders. An atlas can only be created if a scene is known. That way, the font-size in figure space can be translated to pixel space so crisp text is seen.

- 2DText - On creation, it will create its bounds and subscribe to FontManager for any changes to the font. If there are changes, it will recreate its borders.

- OBJ_Font - defines a figure font either with family/weight/style/testString or src/map. The size, width, descent, midDescent, maxDescent, midAscent, maxAscent properties are then used to size the glyphs.

              WebGL -----------> FontManager
              A   |                    A       A
              |   | Atlas              |       |
              |   V                    |       |
             GLText                2DText     Figure
*/
/* eslint-enable max-len */

export type OBJ_AtlasMap = {
  [char: string]: {
    width: number,
    ascent: number,
    descent: number,
    offsetX: number,
    offsetY: number,
  }
};

export type OBJ_Atlas = {
  font?: FigureFont,
  loadColor?: TypeColor,
  scene?: Scene,
  maxCount?: number,
  timeout?: number,
  map?: OBJ_AtlasMap,
};

export default class Atlas {
  webgl: WebGLInstance;
  font: FigureFont;             // font definition
  fontSize: number;             // calculated pixel size
  src: Image | string;          // external image of atlas
  fontID: string;               // FontManager font id
  dimension: number;            // side length of atlas in pixels
  loaded: boolean;              // true once FontManager says font is loaded
  scene: Scene;
  canvas: HTMLCanvasElement;
  fontManager: FontManager;
  notifications: NotificationManager;
  map: OBJ_AtlasMap


  constructor(webgl: WebGLInstance, options: OBJ_Atlas) {
    this.webgl = webgl;
    const o = joinObjects({}, {
      // src: null,
      // alphabet: 'latin',
      loadColor: [0, 0, 0, 0],
      font: {},
      timeout: 5,
      maxCount: 1,
    }, options);

    this.font = new FigureFont(o.font);
    // console.log(this.font.getTextureID())
    // this.src = o.src;
    // this.textureId = o.id;
    this.loaded = false;
    this.notifications = new NotificationManager();
    // If src is defined, then an actual image is the atlas
    // console.log(this.font.getTextureID(), '<', this.font.src, '>')
    if (this.font.src != null && this.font.src !== '') {
      this.map = this.font.map;
      this.fontSize = this.font.map.fontSize;
      this.dimension = this.font.map.dimension;
      this.webgl.addTexture(
        this.font.getTextureID(),
        this.font.src,
        this.font.loadColor,
        false,
        this.srcLoaded.bind(this),
      );
      return;
    }

    // Otherwise generate the atlas automatically
    if (options.font == null) {
      throw new Error('FigureOne Atlas Error: Either `src` or `font` must be defined to create an atlas');
    }
    if (options.scene == null) {
      throw new Error('FigureOne Atlas Error: Must define a scene to create an atlas from a font');
    }
    this.scene = o.scene;
    this.font = new FigureFont(o.font);
    this.fontManager = new FontManager();
    this.canvas = document.createElement('canvas');

    const [fontID, isAvailable] = this.fontManager.watch(this.font, {
      timeout: o.timeout,
      maxCount: o.maxCount,
      callback: this.fontLoaded.bind(this),
      atlas: true,
    });
    this.fontID = fontID;
    // this.textureId = this.font.getTextureId();
    this.createAtlas(options.scene);
    if (isAvailable) {
      this.loaded = true;
      this.notifications.publish('updated');
      this.notifications.publish('updated2');
    }
  }

  srcLoaded() {
    this.loaded = true;
    this.notifications.publish('updated');
    this.notifications.publish('updated2');
  }

  fontLoaded() {
    // console.log('loaded', this.loaded)
    if (this.loaded) {
      return;
    }
    if (this.scene == null) {
      return;
    }
    this.recreate();
  }

  recreate() {
    this.createAtlas(this.scene);
    this.notifications.publish('updated');
    this.notifications.publish('updated2');
  }


  createAtlas(scene: Scene = this.scene) {
    const { font } = this;
    let fontSizePX;
    if (font.atlasSize != null) {
      fontSizePX = this.webgl.gl.canvas.height * font.atlasSize;
    } else {
      fontSizePX = font.size / scene.heightNear * this.webgl.gl.canvas.height * 2;
    }

    this.fontSize = fontSizePX;

    const glyphs = this.font.getGlyphs();
    this.map = {};
    let dimension = Math.floor(Math.ceil(Math.sqrt(glyphs.length) + 2) * fontSizePX * 1.5);
    const maxDimension = this.webgl.gl.getParameter(this.webgl.gl.MAX_TEXTURE_SIZE);

    if (dimension > maxDimension) {
      fontSizePX *= maxDimension / dimension * 0.95;
      this.fontSize = fontSizePX;
      dimension = Math.floor(Math.ceil(Math.sqrt(glyphs.length) + 2) * fontSizePX * 1.5);
    }

    const canvas = document.createElement('canvas');
    canvas.width = dimension;
    canvas.height = dimension;

    const ctx = canvas.getContext('2d');
    ctx.font = `${font.style} ${font.weight} ${fontSizePX}px ${font.family}`;

    let x = fontSizePX;
    let y = fontSizePX;

    // const aWidth = ctx.measureText('a').width;
    const aWidth = this.fontSize / 2;

    font.setColorInContext(ctx, font.color);
    if (font.outline.color) { // $FlowFixMe
      font.setStrokeColorInContext(ctx, font.outline.color);
    } else {
      font.setStrokeColorInContext(ctx, font.color);
    }
    if (font.outline.width !== 0) { // $FlowFixMe
      ctx.lineWidth = font.outline.width * fontSizePX / font.size;
    }
    for (let i = 0; i < glyphs.length; i += 1) {
      if (font.outline.fill) {
        ctx.fillText(glyphs[i], x, y);
      }
      if (font.outline.width !== 0) {
        ctx.strokeText(glyphs[i], x, y);
      }
      let w = 1;
      if (font.mods[glyphs[i]]) {
        w = font.mods[glyphs[i]].w;
      }
      const width = ctx.measureText(glyphs[i]).width * w + font.letterSpacing * fontSizePX;
      const { ascent, descent } = font.measureText(glyphs[i], aWidth);

      const offsetX = x;
      const offsetY = dimension - y;
      this.map[glyphs[i]] = {
        width, ascent, descent, offsetX, offsetY,
      };
      x += width * 2.5;
      if (x >= dimension - fontSizePX) {
        x = fontSizePX;
        y += fontSizePX * 1.2;
      }
    }
    this.dimension = dimension;

    // Create a small square to draw color from when drawing the underline
    ctx.beginPath();
    let underlineColor = font.color;
    if (font.underline != null && font.underline.color != null) {
      underlineColor = font.underline.color;
    }
    // $FlowFixMe
    font.setColorInContext(ctx, underlineColor);
    ctx.fillRect(0, dimension - 5, 5, 5);

    // Create a debug rectangle
    ctx.rect(0, 0, dimension, dimension);
    ctx.beginPath();
    ctx.stroke();

    // // Uncommnet this to debug atlas
    // document.body.appendChild(canvas);

    // // Uncomment this to save atlas as image file
    // canvas.id = 'qwerty';
    // const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    // window.location.href=image;
    this.webgl.addTexture(this.font.getTextureID(), ctx.canvas, [0, 0, 0, 0], false, null, true);
    // canvas.remove();
  }
}
