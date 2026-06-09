// Renders the api-doc images for the gl mask-recolor (textureMap) examples by
// replicating the fragment shader on the CPU, for one or more masks:
//   col = mix(col, tint_t.rgb, mask{m}.channel * tint_t.a)   t = 4*m + channel
// Bilinear sampling (2x supersample) mimics the GPU's LINEAR texture filtering,
// so the recolored region edges are anti-aliased like the real render.
//
// Each scenario below mirrors the FINAL tint state of one @example and writes
// its apiasset (gl_mask.png for one mask, gl_mask2.png for two).

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
const channels = [0, 1, 2, 3]; // mask rgba channel indices

// Each scenario mirrors the FINAL tint state of one @example. Tint t applies to
// mask floor(t/4), channel t%4 - the same mapping as the shader.
const scenarios = [
  {
    // Single mask (gl_mask.png). The example ends with setTint(0, green), so
    // region 0 is green, region 1 blue, region 2 untouched (base shows).
    out: 'gl_mask.png',
    masks: ['mask.png'],
    tints: [
      [0, 1, 0, 1], [0, 0, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0],
    ],
  },
  {
    // Two masks (gl_mask2.png). mask.png recolors the three circles (tints
    // 0..2), mask1.png recolors the bar (tint 4).
    out: 'gl_mask2.png',
    masks: ['mask.png', 'mask1.png'],
    tints: [
      [1, 0, 0, 1], [0, 0.6, 0, 1], [0, 0, 1, 1], [0, 0, 0, 0],
      [0.6, 0, 0.8, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
    ],
  },
];

const SCALE = 2;
const W = base.width * SCALE;
const H = base.height * SCALE;

scenarios.forEach((scenario) => {
  const masks = scenario.masks.map(name => decode(`${__dirname}/${name}`));
  const tint = i => scenario.tints[i] || [0, 0, 0, 0];
  const out = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const u = (x + 0.5) / W;
      const v = (y + 0.5) / H;
      const b = sample(base, u, v);
      const col = [b[0], b[1], b[2]];
      masks.forEach((maskImg, mi) => {
        const m = sample(maskImg, u, v);
        channels.forEach((c) => {
          const t = tint(mi * 4 + c);
          const w = m[c] * t[3];
          for (let k = 0; k < 3; k += 1) col[k] = col[k] * (1 - w) + t[k] * w;
        });
      });
      const o = (y * W + x) * 4;
      out[o] = Math.round(col[0] * 255);
      out[o + 1] = Math.round(col[1] * 255);
      out[o + 2] = Math.round(col[2] * 255);
      out[o + 3] = 255;
    }
  }
  fs.writeFileSync(`${__dirname}/${scenario.out}`, encodePNG(W, H, out));
  // eslint-disable-next-line no-console
  console.log('wrote', scenario.out, `${W}x${H}`);
});
