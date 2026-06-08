// Renders the api-doc image for the gl mask-recolor (textureMap) example by
// replicating the fragment shader on the CPU:
//   col = mix(base.rgb, tint_i.rgb, mask.channel_i * tint_i.a)  for i in 0..3
// Bilinear sampling (2x supersample) mimics the GPU's LINEAR texture filtering,
// so the recolored region edges are anti-aliased like the real render.
//
// Tints match the @example's FINAL state: it adds the element with
// tints [[1,0,0,1],[0,0,1,1]] and then calls setTint(0, [0,1,0,1]), so region 0
// ends up green, region 1 blue, region 2/3 untouched (base colour shows).

const fs = require('fs');
const zlib = require('zlib');

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i += 1) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}
function decode(path) {
  const buf = fs.readFileSync(path);
  let off = 8; let width; let height; const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.slice(off + 8, off + 8 + len);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); }
    if (type === 'IDAT') idat.push(data);
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  return { width, height, raw, stride };
}

// Bilinear sample, returns [r,g,b,a] in 0..1.
function sample(img, u, v) {
  const x = Math.min(Math.max(u * img.width - 0.5, 0), img.width - 1);
  const y = Math.min(Math.max(v * img.height - 0.5, 0), img.height - 1);
  const x0 = Math.floor(x); const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, img.width - 1); const y1 = Math.min(y0 + 1, img.height - 1);
  const fx = x - x0; const fy = y - y0;
  const at = (px, py, c) => img.raw[py * (img.stride + 1) + 1 + px * 4 + c] / 255;
  const out = [];
  for (let c = 0; c < 4; c += 1) {
    const top = at(x0, y0, c) * (1 - fx) + at(x1, y0, c) * fx;
    const bot = at(x0, y1, c) * (1 - fx) + at(x1, y1, c) * fx;
    out.push(top * (1 - fy) + bot * fy);
  }
  return out;
}

const base = decode(`${__dirname}/base.png`);
const mask = decode(`${__dirname}/mask.png`);

// Final tint state of the example (see header comment).
const tints = [
  [0, 1, 0, 1], // region 0 (mask red)   -> green (setTint override)
  [0, 0, 1, 1], // region 1 (mask green)  -> blue
  [0, 0, 0, 0], // region 2 (mask blue)   -> none (base shows)
  [0, 0, 0, 0], // region 3 (mask alpha)  -> none
];

const SCALE = 2;
const W = base.width * SCALE;
const H = base.height * SCALE;
const out = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y += 1) {
  for (let x = 0; x < W; x += 1) {
    const u = (x + 0.5) / W;
    const v = (y + 0.5) / H;
    const b = sample(base, u, v);
    const m = sample(mask, u, v);
    const col = [b[0], b[1], b[2]];
    for (let i = 0; i < 4; i += 1) {
      const w = m[i] * tints[i][3];
      for (let c = 0; c < 3; c += 1) col[c] = col[c] * (1 - w) + tints[i][c] * w;
    }
    const o = (y * W + x) * 4;
    out[o] = Math.round(col[0] * 255);
    out[o + 1] = Math.round(col[1] * 255);
    out[o + 2] = Math.round(col[2] * 255);
    out[o + 3] = 255;
  }
}
const dest = process.argv[2] || `${__dirname}/gl_mask.png`;
fs.writeFileSync(dest, encodePNG(W, H, out));
// eslint-disable-next-line no-console
console.log('wrote', dest, `${W}x${H}`);
