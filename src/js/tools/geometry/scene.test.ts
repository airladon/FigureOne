import Scene from './scene';
// import { round } from './math';

describe('Scene', () => {
  test('copy', () => {
    const s = new Scene(0, 0, 4, 2);
    const c = s.dup();
    expect(s).toEqual(c);
    expect(s).not.toBe(c);
  });
});
