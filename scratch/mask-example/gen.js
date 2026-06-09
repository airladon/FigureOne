// Generates base.png and mask.png for the `gl` mask-recolor (textureMap) example.
//
// base.png: light background, a fixed orange bar (never recolored) and three
//   neutral-grey circles that the mask marks as recolorable.
// mask.png: opaque image whose red/green/blue channels mark circle 1/2/3 as
//   recolor regions for tint0/tint1/tint2. Everything else is black (no recolor).
//   This example uses three regions for clarity; the mask's alpha channel is a
//   valid 4th region (texture upload does not premultiply, so it is preserved),
//   it is simply left unused here.

const fs = require('fs');
const zlib = require('zlib');

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i += 1) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const SIZE = 256;

function newImage(fill) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let i = 0; i < SIZE * SIZE; i += 1) {
    buf[i * 4] = fill[0];
    buf[i * 4 + 1] = fill[1];
    buf[i * 4 + 2] = fill[2];
    buf[i * 4 + 3] = fill[3];
  }
  return buf;
}

function setPx(buf, x, y, color) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const i = (y * SIZE + x) * 4;
  buf[i] = color[0];
  buf[i + 1] = color[1];
  buf[i + 2] = color[2];
  buf[i + 3] = color[3];
}

function fillRect(buf, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y += 1) {
    for (let x = x0; x < x0 + w; x += 1) setPx(buf, x, y, color);
  }
}

function fillCircle(buf, cx, cy, r, color) {
  for (let y = cy - r; y <= cy + r; y += 1) {
    for (let x = cx - r; x <= cx + r; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) setPx(buf, x, y, color);
    }
  }
}

function border(buf, t, color) {
  fillRect(buf, 0, 0, SIZE, t, color);
  fillRect(buf, 0, SIZE - t, SIZE, t, color);
  fillRect(buf, 0, 0, t, SIZE, color);
  fillRect(buf, SIZE - t, 0, t, SIZE, color);
}

const circles = [
  { cx: 64, cy: 150, r: 30 },
  { cx: 128, cy: 150, r: 30 },
  { cx: 192, cy: 150, r: 30 },
];

// --- base.png ---
const base = newImage([225, 226, 232, 255]);          // light grey background
fillRect(base, 24, 40, SIZE - 48, 36, [240, 140, 40, 255]); // fixed orange bar
circles.forEach(c => fillCircle(base, c.cx, c.cy, c.r, [196, 198, 206, 255])); // grey discs
border(base, 4, [60, 64, 72, 255]);                   // dark frame
const basePath = process.argv[2] || `${__dirname}/base.png`;
fs.writeFileSync(basePath, encodePNG(SIZE, SIZE, base));

// --- mask.png (opaque; r/g/b select regions) ---
const mask = newImage([0, 0, 0, 255]);
fillCircle(mask, circles[0].cx, circles[0].cy, circles[0].r, [255, 0, 0, 255]); // tint0
fillCircle(mask, circles[1].cx, circles[1].cy, circles[1].r, [0, 255, 0, 255]); // tint1
fillCircle(mask, circles[2].cx, circles[2].cy, circles[2].r, [0, 0, 255, 255]); // tint2
const maskPath = process.argv[3] || `${__dirname}/mask.png`;
fs.writeFileSync(maskPath, encodePNG(SIZE, SIZE, mask));

// --- mask1.png (second mask; r channel selects the orange bar region) ---
// Used by the two-mask example: mask.png recolors the circles (tints 0..3),
// mask1.png recolors the bar (tint 4).
const mask1 = newImage([0, 0, 0, 255]);
fillRect(mask1, 24, 40, SIZE - 48, 36, [255, 0, 0, 255]); // tint4 (mask1 red channel)
const mask1Path = process.argv[4] || `${__dirname}/mask1.png`;
fs.writeFileSync(mask1Path, encodePNG(SIZE, SIZE, mask1));

// eslint-disable-next-line no-console
console.log('wrote', basePath, maskPath, 'and', mask1Path);
