/* global __title __duration __timeStep __frames __startSteps */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */
__title = 'Test Title';
__duration = 0;
__timeStep = 1;
__frames = [[0]];
__startSteps = 1000;

// Replace Math.random with something deterministic
// ********************************
// From: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
/* eslint-disable */
function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i += 1)
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
    h = h << 13 | h >>> 19;
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

var seed = xmur3("figureone");
Math.random = mulberry32(seed());
// ********************************