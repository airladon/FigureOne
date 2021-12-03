// @flow
import { joinObjects } from '../../../tools/tools';

function familyStyleMeasures(family: string, style: string, a, ma, d) {
  const f = family.toLowerCase().split(',')[0];
  const measures = {
    times: {
      italic: {
        f: { a, d, w: 1.5 },
      },
    },
    'times new roman': {
      italic: {
        f: { a, d, w: 1.3 },
      },
    },
    'open sans': {
      italic: {
        f: { a: 1.6, d, w: 1.3 },
      },
    },
  };
  if (measures[f] != null) {
    if (measures[f][style] != null) {
      return measures[f][style];
    }
  }
  return {};
}

function glyphMeasures(
  family: string,
  style: string,
  a: number,          // max ascent
  ma: number,         // mid ascent
  d: number,          // max descent
  md: number,         // mid descent
  d0: number,         // min descent
  modifiers: Object,
) {
  const w = 1;
  const defaults = {
    a: { a: ma, d: d0, w },
    c: { a: ma, d: d0, w },
    e: { a: ma, d: d0, w },
    g: { a: ma, d, w },
    j: { a, d, w },
    m: { a: ma, d: d0, w },
    n: { a: ma, d: d0, w },
    o: { a: ma, d: d0, w },
    p: { a: ma, d, w },
    q: { a: ma, d, w },
    r: { a: ma, d: d0, w },
    s: { a: ma, d: d0, w },
    u: { a: ma, d: d0, w },
    v: { a: ma, d: d0, w },
    w: { a: ma, d: d0, w },
    x: { a: ma, d: d0, w },
    y: { a: ma, d, w },
    z: { a: ma, d: d0, w },
    ':': { a: ma, d: d0, w },
    '*': { a: ma, d: d0, w },
    ' ': { a: ma, d: d0, w },
    ';': { a: ma, d: md, w },
    ',': { a: ma, d: md, w },
    $: { a, d: md, w },
    Q: { a, d, w },
    '@': { a, d, w },
    '(': { a, d, w },
    ')': { a, d, w },
    '{': { a, d, w },
    '}': { a, d, w },
    '[': { a, d, w },
    ']': { a, d, w },
    '|': { a, d, w },
    '-': { a: ma, d: d0, w },
  };
  const mods = {};
  Object.keys(modifiers).forEach((key) => {
    mods[key] = joinObjects({}, { a, d: d0, w }, defaults[key], modifiers[key]);
  });
  const m = joinObjects(
    {}, defaults, familyStyleMeasures(family, style, a, ma, d, md, d0), mods,
  );
  return m;
}

export default glyphMeasures;
