import * as tools from './tools';
// import { Transform } from './g2';

describe('Test Classify method', () => {
  // CLassify method tests
  test('Empty inputs case', () => {
    expect(tools.classify('', '')).toBe('');
  });

  test('Empty value case', () => {
    expect(tools.classify('btn', '')).toBe('btn');
  });

  test('Empty key case', () => {
    expect(tools.classify('', '-test')).toBe(' -test');
  });

  test('btn, btn -> btn', () => {
    expect(tools.classify('btn', 'btn')).toBe('btn');
  });

  test('btn, -test -> btn btn-test', () => {
    expect(tools.classify('btn', '-test')).toBe('btn btn-test');
  });

  test('Do nothing case: btn, btn-test -> btn btn-test', () => {
    expect(tools.classify('btn', 'btn-test')).toBe('btn btn-test');
  });

  test('btn, btn -test -> btn btn-test', () => {
    expect(tools.classify('btn', 'btn -test')).toBe('btn btn-test');
  });

  test('btn, -test -test2 -> btn btn-test btn-test2', () => {
    expect(tools.classify('btn', '-test -test2')).toBe('btn btn-test btn-test2');
  });
});

describe('Extract From Object', () => {
  let o;
  beforeEach(() => {
    o = {
      a: 1,
      b: {
        b1: 2,
        b2: 3,
        b3: {
          b31: 4,
          b32: (i, j) => i + j, // eslint-disable-next-line camelcase
          b_33: 5,
        },
      },
      c: i => i + 1,
      d: (i, j) => i + j,  // eslint-disable-next-line camelcase
      e_1: 6,
    };
  });
  describe('Object Property Pointer', () => {
    test('string exists', () => {
      const p = new tools.ObjectKeyPointer(o, 'a');
      expect(p.object).toBe(o);
      expect(p.key).toBe('a');
      expect(p.value()).toBe(1);
    });
    test('string does not exist', () => {
      const p = new tools.ObjectKeyPointer(o, 'z');
      expect(p.object).toBe(o);
      expect(p.key).toBe('');
      expect(p.value()).toBe(undefined);
    });
    test('setting value of key that exists', () => {
      const p = new tools.ObjectKeyPointer(o, 'a');
      p.setValue(100);
      expect(o.a).toBe(100);
    });
    test('setting value of key that does not exist', () => {
      const p = new tools.ObjectKeyPointer(o, 'z');
      expect(p.value()).toBe(undefined);
      expect('z' in o).toBe(false);
    });
    test('execute method with one argument', () => {
      const p = new tools.ObjectKeyPointer(o, 'c');
      const r = p.execute(1);
      expect(r).toBe(2);
    });
    test('execute method with two arguments', () => {
      const p = new tools.ObjectKeyPointer(o, 'd');
      const r = p.execute(1, 2);
      expect(r).toBe(3);
    });
    test('execute method don key that does not exist', () => {
      const p = new tools.ObjectKeyPointer(o, 'z');
      const r = p.execute(1);
      expect(r).toBe(undefined);
      expect('z' in o).toBe(false);
    });
  });
  describe('Extract', () => {
    describe('String input', () => {
      test('string exists', () => {
        const q = tools.extractFrom(o, 'a');
        expect(q).toEqual(new tools.ObjectKeyPointer(o, 'a'));
      });
      test('string does not exist', () => {
        const q = tools.extractFrom(o, 'z');
        expect(q).toEqual(undefined);
      });
      test('2 level string that exists', () => {
        const q = tools.extractFrom(o, 'b_b1');
        expect(q.value()).toBe(2);
      });
      test('3 level string that exists', () => {
        const q = tools.extractFrom(o, 'b_b3_b32');
        expect(q.execute(1, 2)).toBe(3);
      });
      test('3 level string that does not exist', () => {
        const q = tools.extractFrom(o, 'b_b3_z');
        expect(q).toEqual(undefined);
      });
      test('1 level string with underscores', () => {
        const q = tools.extractFrom(o, 'e_1');
        expect(q.value()).toBe(6);
      });
      test('3 level string with underscores', () => {
        const q = tools.extractFrom(o, 'b_b3_b_33');
        expect(q.value()).toBe(5);
      });
    });
    describe('Array input', () => {
      test('Array all exists', () => {
        const q = tools.extractFrom(o, ['a', 'b', 'c']);
        expect(q[0]).toEqual(new tools.ObjectKeyPointer(o, 'a'));
        expect(q[1]).toEqual(new tools.ObjectKeyPointer(o, 'b'));
        expect(q[2].execute(100)).toBe(101);
      });
      test('Array - some exist', () => {
        const q = tools.extractFrom(o, ['a', 'b', 'z', 'c']);
        expect(q[0]).toEqual(new tools.ObjectKeyPointer(o, 'a'));
        expect(q[1]).toEqual(new tools.ObjectKeyPointer(o, 'b'));
        expect(q[2].execute(100)).toBe(101);
      });
      test('Array - none exist', () => {
        const q = tools.extractFrom(o, ['z', 'x', 'y']);
        expect(q).toHaveLength(0);
      });
    });
    describe('Object Input', () => {
      test('All object keys exist', () => {
        const q = tools.extractFrom(
          o,
          {
            a: 10,
            b: 20,
            c: 'test',
          },
        );
        expect(q[0].obj.value()).toEqual(1);
        expect(q[0].value).toEqual(10);
        expect(q[2].obj.execute(100)).toBe(101);
        expect(q[2].value).toBe('test');
        expect(q).toHaveLength(3);
      });
      test('Some object keys exist', () => {
        const q = tools.extractFrom(
          o,
          {
            a: 10,
            z: 20,
            c: 'test',
          },
        );
        expect(q[0].obj.value()).toEqual(1);
        expect(q[0].value).toEqual(10);
        expect(q[1].obj.execute(100)).toBe(101);
        expect(q[1].value).toBe('test');
        expect(q).toHaveLength(2);
      });
    });
  });
});
describe('Extract From Collection', () => {
  let o;
  let simple;
  beforeEach(() => {
    o = {
      _a: 1,
      _b: {
        _b1: 2,
        _b2: 3,
        _b3: {
          _b31: 4,
          _b32: (i, j) => i + j,  // eslint-disable-next-line camelcase
          _b_33: 5,
        },
      },
      _c: i => i + 1,
      _d: (i, j) => i + j,  // eslint-disable-next-line camelcase
      _e_1: 6,
    };
    simple = {
      a: 1,
      b: {
        b1: 2,
        b2: 3,
        b3: {
          b31: 4,
          b32: (i, j) => i + j,  // eslint-disable-next-line camelcase
          b_33: 5,
        },
      },
      c: i => i + 1,
      d: (i, j) => i + j,  // eslint-disable-next-line camelcase
      e_1: 6,
    };
  });
  test('string', () => {
    const p = tools.getElement(o, '_a');
    expect(p.value()).toBe(1);
  });
  test('string from simple', () => {
    const p = tools.extractFrom(simple, 'a');
    expect(p.value()).toBe(1);
  });
  test('fail from simple', () => {
    const p = tools.extractFrom(simple, 'x');
    expect(p).toBe(undefined);
  });
  test('string without dunder', () => {
    const p = tools.getElement(o, 'a');
    expect(p.value()).toBe(1);
  });
  test('3 level string', () => {
    const p = tools.getElement(o, '_b_b3_b_33');
    expect(p.value()).toBe(5);
  });
  test('3 level string from simple', () => {
    const p = tools.extractFrom(simple, 'b_b3_b_33');
    expect(p.value()).toBe(5);
  });
  test('3 level string without dunder', () => {
    const p = tools.getElement(o, 'b_b3_b_33');
    expect(p.value()).toBe(5);
  });
  test('list extract', () => {
    const p = tools.getElement(
      o,
      [
        'a',
        '_b',
        'e_1',
        'b_b2',
      ],
    );
    expect(p[0].value()).toBe(1);
    expect(p[1].value()._b1).toBe(2);
    expect(p[2].value()).toBe(6);
    expect(p[3].value()).toBe(3);
  });
  test('list extract from simple', () => {
    const p = tools.extractFrom(
      simple,
      [
        'a',
        'b',
        'e_1',
        'b_b2',
      ],
    );
    expect(p[0].value()).toBe(1);
    expect(p[1].value().b1).toBe(2);
    expect(p[2].value()).toBe(6);
    expect(p[3].value()).toBe(3);
  });
  describe('add to object', () => {
    test('simple from scrach', () => {
      const obj = {};
      tools.addToObject(obj, 'a-b-c', 1, '-');
      expect(obj.a.b.c).toBe(1);
    });
    test('simple adding', () => {
      const obj = { a: { d: 3 } };
      tools.addToObject(obj, 'a-b-c', 1, '-');
      expect(obj.a.b.c).toBe(1);
    });
    test('simple adding 2', () => {
      const obj = { c: { d: 3 } };
      tools.addToObject(obj, 'a-b-c', 1, '-');
      expect(obj.a.b.c).toBe(1);
    });
  });
});
describe('Get Object Value From Path', () => {
  test('Simple', () => {
    const o = { a: 1, b: { c: 2, d: { e: 3, f: 4 } } };
    const v = tools.getFromObject(o, 'a');
    expect(v).toBe(1);
  });
  test('nested - 2 levels', () => {
    const o = { a: 1, b: { c: 2, d: { e: 3, f: 4 } } };
    const v = tools.getFromObject(o, 'b.c');
    expect(v).toBe(2);
  });
  test('nested 3 levels', () => {
    const o = { a: 1, b: { c: 2, d: { e: 3, f: 4 } } };
    const v = tools.getFromObject(o, 'b.d.e');
    expect(v).toBe(3);
  });
});
describe('Generate Unique ID', () => {
  test('With seed', () => {
    const s = tools.generateUniqueId('test');
    expect(s.startsWith('test')).toBe(true);
    expect(s).toHaveLength(13);
    // expect(s.length < 11).toBe(true);
  });
  test('Without seed', () => {
    const s = tools.generateUniqueId();
    // expect(s.startsWith('id_random_')).toBe(true);
    expect(s).toHaveLength(9);
    // expect(s.length > 10).toBe(true);
    // expect(s.length < 17).toBe(true);
  });
});
describe('Is Touch Device', () => {
  test('Simple', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    expect(tools.isTouchDevice()).toBe(false);
  });
});
describe('Duplicate Values', () => {
  test('number', () => {
    const dup = tools.duplicate(3);
    expect(dup).toBe(3);
  });
  test('NaN', () => {
    const dup = tools.duplicate(NaN);
    expect(dup).toBe(NaN);
  });
  test('string', () => {
    const dup = tools.duplicate('test');
    expect(dup).toBe('test');
  });
  test('null', () => {
    const dup = tools.duplicate(null);
    expect(dup).toBe(null);
  });
  test('Array', () => {
    const initial = [1, 2, 3];
    const dup = tools.duplicate(initial);
    expect(dup).not.toBe(initial);
    expect(dup).toEqual(initial);
  });
  test('function', () => {
    const initial = i => i + 10;
    const dup = tools.duplicate(initial);
    expect(dup).toBe(initial);
    expect(dup(10)).toBe(initial(10));
  });
  test('Object with Arrays', () => {
    const initial = {
      a: [1, 2, 3],
      b: {
        c: [4, 5, 6],
      },
    };
    const dup = tools.duplicate(initial);
    expect(dup).not.toBe(initial);
    expect(Object.keys(dup)).toEqual(Object.keys(initial));
    expect(dup.a).not.toBe(initial.a);
    expect(dup.a).toEqual(initial.a);
    expect(dup.b.c).not.toBe(initial.b.c);
    expect(dup.b.c).toEqual(initial.b.c);
  });
  test('Object with _dup function', () => {
    const initial = {
      a: [1, 2, 3],
      b: {
        c: [4, 5, 6],
      },
      _dup: () => 10,
    };
    const dup = tools.duplicate(initial);
    expect(dup).toBe(10);
  });
  test('Object with Arrays with Objects with Arrays', () => {
    const initial = {
      a: [1, 2, 3],
      b: {
        c: [4, 5, 6],
        d: [
          {
            e: [7, 8, 9],
            f: 'hello',
          },
          10,
          11,
        ],
      },
    };
    const dup = tools.duplicate(initial);
    expect(dup).not.toBe(initial);
    expect(Object.keys(dup)).toEqual(Object.keys(initial));
    expect(dup.a).not.toBe(initial.a);
    expect(dup.a).toEqual(initial.a);
    expect(dup.b.c).not.toBe(initial.b.c);
    expect(dup.b.c).toEqual(initial.b.c);

    expect(dup.b.d[0].e).not.toBe(initial.b.d[0].e);
    expect(dup.b.d[0].e).toEqual(initial.b.d[0].e);

    expect(dup.b.d[0].f).toBe('hello');
    expect(dup.b.d).not.toBe(initial.b.d);
    expect(dup.b.d).toEqual(initial.b.d);
  });
});
describe('AssignObjectFromTo', () => {
  test('Simple', () => {
    const to = { a: 1, b: 2 };
    const from = { a: 2, c: 2 };
    tools.assignObjectFromTo(from, to);
    expect(Object.keys(to)).toEqual(['a', 'b', 'c']);
    expect(to.a).toBe(from.a);
    expect(to.b).toBe(2);
    expect(to.c).toBe(from.c);
  });
  test('Simple with exception', () => {
    const to = { a: 1, b: 2 };
    const from = { a: 2, c: 2 };
    tools.assignObjectFromTo(from, to, 'a');
    expect(Object.keys(to)).toEqual(['a', 'b', 'c']);
    expect(to.a).toBe(1);
    expect(to.b).toBe(2);
    expect(to.c).toBe(from.c);
  });
  test('Multi level exception', () => {
    const to = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    };
    const from = {
      a: 10,
      b: {
        c: 20,
        d: {
          e: 30,
          f: 40,
          g: 50,
        },
      },
    };
    tools.assignObjectFromTo(from, to, ['a', 'b.d.e', 'b.d.g']);
    expect(to.a).toBe(1);
    expect(to.b.c).toBe(from.b.c);
    expect(to.b.d.e).toBe(3);
    expect(to.b.d.f).toBe(from.b.d.f);
    expect(to.b.d.g).toBe(undefined);
  });
  test('DuplicateValues True', () => {
    const to = { a: 1 };
    const from = { a: 2, b: [1, 2, 3] };
    tools.assignObjectFromTo(from, to, [], true);
    expect(to.b).not.toBe(from.b);
    expect(to.b).toEqual(from.b);
  });
  test('DuplicateValues False', () => {
    const to = { a: 1 };
    const from = { a: 2, b: [1, 2, 3] };
    tools.assignObjectFromTo(from, to, [], false);
    expect(to.b).toBe(from.b);
  });
});
describe('Join Objects with Options', () => {
  test('With exceptions and no duplication', () => {
    const to = {
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    };
    const from1 = {
      a: 10,
      b: {
        c: 20,
        d: 30,
        e: [1, 2, 3],
      },
    };
    const from2 = {
      a: 100,
      g: 600,
    };
    tools.joinObjectsWithOptions({
      except: 'b.d',
      duplicate: false,
    }, to, from1, from2);
    expect(to.a).toBe(100);
    expect(to.b.c).toBe(20);
    expect(to.b.d).toBe(3);
    expect(to.b.e).toBe(from1.b.e);
    expect(to.g).toBe(600);
  });
  test('With exceptions and duplication', () => {
    const to = {
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    };
    const from1 = {
      a: 10,
      b: {
        c: 20,
        d: 30,
        e: [1, 2, 3],
      },
    };
    const from2 = {
      a: 100,
      g: 600,
    };
    tools.joinObjectsWithOptions({
      except: 'b.d',
      duplicate: true,
    }, to, from1, from2);
    expect(to.a).toBe(100);
    expect(to.b.c).toBe(20);
    expect(to.b.d).toBe(3);
    expect(to.b.e).not.toBe(from1.b.e);
    expect(to.b.e).toEqual(from1.b.e);
    expect(to.g).toBe(600);
  });
});
describe('Join Objects', () => {
  test('Empty object first', () => {
    const result = tools.joinObjects({ a: 1, b: 2 }, {});
    expect(result).toEqual({ a: 1, b: 2 });
  });
  test('Empty object second', () => {
    const result = tools.joinObjects({}, { a: 1, b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });
  test('Overwrite', () => {
    const result = tools.joinObjects({ a: 3, b: 4 }, { a: 1, b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });
  test('Overwrite with levels', () => {
    const result = tools.joinObjects(
      {},
      {
        a: 3, b: 4, c: 5, d: { d1: 1, d2: 2, d3: 3 },
      },
      {
        a: 1, b: 2, d: { d1: 3, d2: 4 },
      },
    );
    expect(result).toEqual({
      a: 1, b: 2, c: 5, d: { d1: 3, d2: 4, d3: 3 },
    });
  });
  test('Single Object', () => {
    const result = tools.joinObjects({ a: 1, b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });
  test('Array Object', () => {
    const result = tools.joinObjects({ a: 1, b: 2 }, { b: [1, 2] });
    expect(result).toEqual({ a: 1, b: [1, 2] });
  });
  test('Three Layers object over number', () => {
    const result = tools.joinObjects(
      {},
      {
        a: 1,
        b: {
          b1: 2,
          b2: 3,
        },
      },
      {
        a: 1,
        b: {
          b1: 2,
          b2: {
            b21: 3,
            b22: 5,
          },
        },
      },
    );
    expect(result).toEqual({
      a: 1,
      b: {
        b1: 2,
        b2: {
          b21: 3,
          b22: 5,
        },
      },
    });
  });
  test('Do not modify existing objects', () => {
    const o1 = { a: 1, b: { x: 1, z: 1 } };
    const o2 = { a: 2, b: { x: 2, y: 2 } };
    const result = tools.joinObjects({}, o1, o2);
    expect(result).toEqual({ a: 2, b: { x: 2, y: 2, z: 1 } });
    expect(o1).toEqual({ a: 1, b: { x: 1, z: 1 } });
    expect(o2).toEqual({ a: 2, b: { x: 2, y: 2 } });
  });
  test('Do not overwrite undefined', () => {
    const o1 = { a: 1, b: { x: 1, z: 1 } };
    const o2 = { a: 2, b: { x: 2, y: undefined, z: undefined } };
    const result = tools.joinObjects({}, o1, o2);
    expect(result).toEqual({ a: 2, b: { x: 2, y: undefined, z: 1 } });
  });
});
describe('Get Object Paths', () => {
  test('Simple', () => {
    const obj = { a: 1, b: 2 };
    const paths = tools.objectToPaths(obj);
    expect(Object.keys(paths)).toEqual(['.a', '.b']);
    expect(Object.values(paths)).toEqual([1, 2]);
  });
  test('different types', () => {
    const obj = {
      a: 1, b: 'h', c: false, d: null, e: undefined, f: () => {}, g: [1, 2],
    };
    const paths = tools.objectToPaths(obj);
    expect(Object.keys(paths)).toEqual([
      '.a', '.b', '.c', '.d', '.f', '.g[0]', '.g[1]',
    ]);
    expect(paths['.a']).toBe(1);
    expect(paths['.b']).toBe('h');
    expect(paths['.c']).toBe(false);
    expect(paths['.d']).toBe(null);
    // expect(paths['.e']).toBe(undefined);
    expect(paths['.g[0]']).toBe(1);
    expect(paths['.g[1]']).toBe(2);
    // expect(Object.values(paths)).toEqual([
    //   1, 'h', false, null, undefined, function f() {}, 1, 2,
    // ]);
  });
  test('Nested', () => {
    const obj = {
      a: 1,
      b: {
        c: 1,
        d: [
          {
            e: 1,
            f: 2,
          },
          2,
          [3, 4],
        ],
      },
    };
    const paths = tools.objectToPaths(obj);
    expect(Object.keys(paths)).toEqual([
      '.a',
      '.b.c',
      '.b.d[0].e',
      '.b.d[0].f',
      '.b.d[1]',
      '.b.d[2][0]',
      '.b.d[2][1]',
    ]);
    expect(paths['.a']).toBe(1);
    expect(paths['.b.c']).toBe(1);
    expect(paths['.b.d[0].e']).toBe(1);
    expect(paths['.b.d[0].f']).toBe(2);
    expect(paths['.b.d[1]']).toBe(2);
    expect(paths['.b.d[2][0]']).toBe(3);
    expect(paths['.b.d[2][1]']).toBe(4);
  });
});
describe('Get Object Diff', () => {
  test('No diff', () => {
    const o1 = { a: 1, b: { c: 1, d: 1 } };
    const o2 = { a: 1, b: { c: 1, d: 1 } };
    const { diff, removed, added } = tools.getObjectDiff(o1, [], o2, 5, true);
    // expect(diff).toEqual();
    // expect(removed).toEqual({});
    // expect(added).toEqual({});
    expect(diff == null).toBe(true);
    expect(removed == null).toBe(true);
    expect(added == null).toBe(true);
  });
  test('Diff', () => {
    const o1 = { a: 1, b: { c: 1, d: 1 } };
    const o2 = { a: 2, b: { c: 1, d: 2 } };
    const { diff, removed, added } = tools.getObjectDiff(o1, [], o2, 5, true);
    expect(diff).toEqual({
      '.a': [1, 2],
      '.b.d': [1, 2],
    });
    expect(removed == null).toBe(true);
    expect(added == null).toBe(true);
    // expect(removed).toEqual({});
    // expect(added).toEqual({});
  });
  test('Added', () => {
    const o1 = { a: 1, b: { c: 1, d: 1 } };
    const o2 = { a: 1, b: { c: 1, d: 1, e: 1 } };
    const { diff, removed, added } = tools.getObjectDiff(o1, [], o2, 5, true);
    expect(added).toEqual({
      '.b.e': 1,
    });
    expect(removed == null).toBe(true);
    expect(diff == null).toBe(true);
    // expect(removed).toEqual({});
    // expect(diff).toEqual({});
  });
  test('Removed', () => {
    const o1 = { a: 1, b: { c: 1, d: 1 } };
    const o2 = { a: 1, b: { c: 1 } };
    const { diff, removed, added } = tools.getObjectDiff(o1, [], o2, 5, true);
    expect(removed).toEqual({
      '.b.d': 1,
    });
    expect(diff == null).toBe(true);
    expect(added == null).toBe(true);
    // expect(added).toEqual({});
    // expect(diff).toEqual({});
  });
  test('Nested', () => {
    const o1 = { a: 1, b: { c: 1, d: 1, e: [{ f: 1 }, 2, [3, 4]] } };
    const o2 = { a: 1, b: { c: 2, d: 1, e: [{ f: 1, g: 2 }, 2, [3, 4, 5]] } };
    const { diff, removed, added } = tools.getObjectDiff(o1, [], o2, 5, true);
    expect(diff).toEqual({
      '.b.c': [1, 2],
    });
    expect(added).toEqual({
      '.b.e[0].g': 2,
      '.b.e[2][2]': 5,
    });
    expect(removed == null).toBe(true);
    // expect(removed).toEqual({});
  });
});
describe('diffToObj', () => {
  test('Simple', () => {
    const diff = { '.a': [1, 2] };
    const obj = tools.pathsToObj(diff);
    expect(Object.keys(obj)).toHaveLength(1);
    expect(obj.a).toBe(2);
  });
  test('Simple Array', () => {
    const diff = {
      '.a[0]': [1, 2],
      '.a[2]': [3, 4],
    };
    const obj = tools.pathsToObj(diff);
    expect(Object.keys(obj)).toHaveLength(1);
    expect(Array.isArray(obj.a)).toBe(true);
    expect(obj.a).toHaveLength(3);
    expect(obj.a[0]).toBe(2);
    expect(obj.a[1]).toBe(undefined);
    expect(obj.a[2]).toBe(4);
  });
  test('Simple Array and values', () => {
    const diff = {
      '.a[0]': [1, 2],
      '.a[1]': [3, 4],
      '.b': [1, 9],
    };
    const obj = tools.pathsToObj(diff);
    expect(Object.keys(obj)).toHaveLength(2);
    expect(Array.isArray(obj.a)).toBe(true);
    expect(obj.a).toHaveLength(2);
    expect(obj.a[0]).toBe(2);
    expect(obj.a[1]).toBe(4);
    expect(obj.b).toBe(9);
  });
  test('Nesting', () => {
    const diff = {
      '.a.b[0][1].c[0].d': [1, 2],
    };
    const obj = tools.pathsToObj(diff);
    expect(Object.keys(obj)).toHaveLength(1);
    expect(obj.a.b[0][1].c[0].d).toBe(2);
    expect(obj.a.b[0][0]).toBe(undefined);
  });
});
describe('addedOrRemovedToObj', () => {
  test('Simple', () => {
    const aOrR = { '.a': 2 };
    const obj = tools.pathsToObj(aOrR);
    expect(Object.keys(obj)).toHaveLength(1);
    expect(obj.a).toBe(2);
  });
  test('Simple Array', () => {
    const aOrR = {
      '.a[0]': 2,
      '.a[2]': 4,
    };
    const obj = tools.pathsToObj(aOrR);
    expect(Object.keys(obj)).toHaveLength(1);
    expect(Array.isArray(obj.a)).toBe(true);
    expect(obj.a).toHaveLength(3);
    expect(obj.a[0]).toBe(2);
    expect(obj.a[1]).toBe(undefined);
    expect(obj.a[2]).toBe(4);
  });
  test('Simple Array and values', () => {
    const aOrR = {
      '.a[0]': 2,
      '.a[1]': 4,
      '.b': 9,
    };
    const obj = tools.pathsToObj(aOrR);
    expect(Object.keys(obj)).toHaveLength(2);
    expect(Array.isArray(obj.a)).toBe(true);
    expect(obj.a).toHaveLength(2);
    expect(obj.a[0]).toBe(2);
    expect(obj.a[1]).toBe(4);
    expect(obj.b).toBe(9);
  });
  test('Nesting', () => {
    const aOrR = {
      '.a.b[0][1].c[0].d': 2,
    };
    const obj = tools.pathsToObj(aOrR);
    expect(Object.keys(obj)).toHaveLength(1);
    expect(obj.a.b[0][1].c[0].d).toBe(2);
    expect(obj.a.b[0][0]).toBe(undefined);
  });
});
describe('UniqueMap', () => {
  let tester;
  beforeEach(() => {
    tester = (map, inStr) => {
      map.add(inStr);
      expect(map.map[inStr]).toBe(inStr);
    };
  });
  test('Simple', () => {
    const map = new tools.UniqueMap();
    tester(map, 'a');
    tester(map, 'b');
    // map.add('hello');
    // map.add('there');
    // expect(map.map['hello']).toBe('a');
    // expect(map.map['there']).toBe('b');
  });
  test('ends', () => {
    const map = new tools.UniqueMap();
    tester(map, 'a');
    tester(map, 'b');
    map.index = 25;
    tester(map, 'z');
    tester(map, 'a0');
    tester(map, 'aa');

    map.index = 675;
    tester(map, 'zz');
    tester(map, 'a00');
    tester(map, 'a0a');

    map.index = 17575;
    tester(map, 'zzz');
    tester(map, 'a000');
    tester(map, 'a00a');
  });
});
describe('compress object', () => {
  test('Simple Compress', () => {
    const o = { key1: 1, key2: 'x' };
    const map = new tools.UniqueMap();
    const c = tools.compressObject(o, map, true, false, null, false);
    expect(c.a).toBe(1);
    expect(c.b).toBe('x');
    expect(map.map.key1).toBe('a');
    expect(map.map.key2).toBe('b');
  });
  test('Simple Decompress', () => {
    const o = { key1: 1, key2: 'x' };
    const map = new tools.UniqueMap();
    const c = tools.compressObject(o, map, true, false, null, false);
    map.makeInverseMap();
    const d = tools.compressObject(c, map, true, false, null, true);
    expect(d.key1).toBe(1);
    expect(d.key2).toBe('x');
    expect(map.inverseMap.a).toBe('key1');
    expect(map.inverseMap.b).toBe('key2');
  });
  test('Compress Strings as well', () => {
    const o = { key1: 1, key2: 'x' };
    const map = new tools.UniqueMap();
    const c = tools.compressObject(o, map, true, true, null, false);
    expect(c.a).toBe(1);
    expect(c.c).toBe('b');
    expect(map.map.key1).toBe('a');
    expect(map.map.key2).toBe('c');
    expect(map.map.x).toBe('b');

    map.makeInverseMap();
    const d = tools.compressObject(c, map, true, true, null, true);
    expect(d.key1).toBe(1);
    expect(d.key2).toBe('x');
    expect(map.inverseMap.a).toBe('key1');
    expect(map.inverseMap.b).toBe('x');
    expect(map.inverseMap.c).toBe('key2');
  });
  test('Array', () => {
    const o = { key1: 1, key2: [1, 2, 'x'] };
    const map = new tools.UniqueMap();
    const c = tools.compressObject(o, map, true, true, null, false);
    expect(c.a).toBe(1);
    expect(c.c).toEqual([1, 2, 'b']);
    expect(map.map.key1).toBe('a');
    expect(map.map.key2).toBe('c');
    expect(map.map.x).toBe('b');

    map.makeInverseMap();
    const d = tools.compressObject(c, map, true, true, null, true);
    expect(d.key1).toBe(1);
    expect(d.key2).toEqual([1, 2, 'x']);
    expect(map.inverseMap.a).toBe('key1');
    expect(map.inverseMap.b).toBe('x');
    expect(map.inverseMap.c).toBe('key2');
  });
  test('Nested', () => {
    const o = {
      key1: 1,
      key2: [
        1,
        'x',
        {
          key21: 1,
          key22: [1, 'x'],
          key23: 'asdf',
        },
      ],
      key3: {
        key31: [
          1,
          [
            1,
            {
              key21: 2,
              key312: [1, 'qwerty'],
              key313: 'x',
            },
            false,
          ],
        ],
      },
    };
    const map = new tools.UniqueMap();
    const c = tools.compressObject(o, map, true, true, null, false);
    expect(c.a).toBe(1);
    expect(map.map.key1).toBe('a');
    expect(map.map.x).toBe('b');
    expect(map.map.key21).toBe('c');
    expect(map.map.key22).toBe('d');
    expect(map.map.asdf).toBe('e');
    expect(map.map.key23).toBe('f');
    expect(map.map.key2).toBe('g');
    expect(map.map.qwerty).toBe('h');
    expect(map.map.key312).toBe('i');
    expect(map.map.key313).toBe('j');
    expect(map.map.key31).toBe('k');
    expect(map.map.key3).toBe('l');

    expect(c.a).toBe(1);
    expect(c.g[0]).toBe(1);
    expect(c.g[1]).toBe('b');
    expect(c.g[2].c).toBe(1);
    expect(c.g[2].d).toEqual([1, 'b']);
    expect(c.g[2].f).toBe('e');

    map.makeInverseMap();
    const d = tools.compressObject(c, map, true, true, null, true);
    expect(d.key1).toBe(1);
    expect(d.key2[0]).toEqual(1);
    expect(d.key2[1]).toEqual('x');
    expect(d.key2[2].key21).toBe(1);
    expect(d.key2[2].key22).toEqual([1, 'x']);
    expect(d.key2[2].key23).toBe('asdf');
    expect(d.key3.key31[1][1].key21).toBe(2);
    expect(d.key3.key31[1][1].key312).toEqual([1, 'qwerty']);
  });
});
describe('Ref and Diff to object', () => {
  test('Simple', () => {
    const o1 = { a: 1, b: 2 };
    const o2 = { a: 1, b: 3 };
    const d = tools.getObjectDiff(o1, [], o2);
    expect(d.diff['.b']).toBe(3);
    const o3 = tools.refAndDiffToObject(o1, d);
    expect(o3.a).toBe(1);
    expect(o3.b).toBe(3);
  });
  test('Simple Array', () => {
    const o1 = { a: [1, 2] };
    const o2 = { a: [1, 3] };
    const d = tools.getObjectDiff(o1, [], o2);
    expect(d.diff['.a[1]']).toBe(3);
    const o3 = tools.refAndDiffToObject(o1, d);
    expect(o3.a[0]).toBe(1);
    expect(o3.a[1]).toBe(3);
  });
  test('Simple Nested Array', () => {
    const o1 = { a: [1, [2, 3]] };
    const o2 = { a: [1, [2, 4]] };
    const d = tools.getObjectDiff(o1, [], o2);
    expect(d.diff['.a[1][1]']).toBe(4);
    const o3 = tools.refAndDiffToObject(o1, d);
    expect(o3.a[0]).toBe(1);
    expect(o3.a[1]).toEqual([2, 4]);
  });
  test('RemoveArray', () => {
    const o1 = { a: [2, 3] };
    const o2 = { a: 1 };
    const d = tools.getObjectDiff(o1, [], o2);
    expect(d.removed['.a[0]']).toBe(2);
    expect(d.removed['.a[1]']).toBe(3);
    expect(d.added['.a']).toBe(1);
    const o3 = tools.refAndDiffToObject(o1, d);
    expect(o3.a).toBe(1);
  });
  test('MultiDiff Simple', () => {
    const o1 = { a: 1 };
    const o2 = { a: 2 };
    const o3 = { a: 3 };
    const d2 = tools.getObjectDiff(o1, [], o2);
    const d3 = tools.getObjectDiff(o1, [d2], o3);
    expect(d3.diff['.a']).toBe(3);
    const o4 = tools.refAndDiffToObject(o1, d2, d3);
    expect(o4.a).toBe(3);
  });
  test('Nested Array', () => {
    const o1 = { a: [1, 2] };
    const o2 = { a: [1, [3, 4]] };
    const d = tools.getObjectDiff(o1, [], o2);
    const o3 = tools.refAndDiffToObject(o1, d);
    expect(o3.a).toEqual([1, [3, 4]]);
  });
  test('MultiDiff Complex', () => {
    const o1 = { a: 1, b: [1, 2], c: { d: 1, e: [1, 2] } };
    const o2 = { a: 1, b: [1, 3], c: { d: 1, e: [1, 2], f: 4 } };
    const o3 = { b: [1, 3], c: { d: 1, e: [1, [3, 4]] } };
    const d2 = tools.getObjectDiff(o1, [], o2);
    const d3 = tools.getObjectDiff(o1, [d2], o3);
    // expect(d3.diff['.a']).toBe(3);
    const o4 = tools.refAndDiffToObject(o1, d2, d3);
    expect(o4.a).toBe(undefined);
    expect(o4.b).toEqual([1, 3]);
    expect(o4.c).toEqual({ d: 1, e: [1, [3, 4]] });
  });
  test('Nested', () => {
    const o1 = {
      a: 1,
      b: [
        {
          c: 1,
          e: 1,
        },
        2,
        [1, 2],
      ],
    };
    const o2 = {
      a: 1,
      b: [
        {
          c: 3,
          d: 1,
        },
        4,
        [1, 5],
      ],
    };
    const d = tools.getObjectDiff(o1, [], o2);
    expect(d.diff['.b[0].c']).toBe(3);
    expect(d.added['.b[0].d']).toBe(1);
    expect(d.diff['.b[1]']).toBe(4);
    expect(d.diff['.b[2][1]']).toBe(5);
    expect(d.removed['.b[0].e']).toBe(1);
    const o3 = tools.refAndDiffToObject(o1, d);
    expect(o3.a).toBe(1);
    expect(o3.b).toEqual([{ c: 3, d: 1 }, 4, [1, 5]]);
  });
});
describe('ObjectTracker', () => {
  test('Add Reference', () => {
    const tracker = new tools.ObjectTracker();
    const obj = { a: 1 };
    tracker.addReference(obj);
    expect(tracker.baseReference).toEqual({ a: 1 });
  });
  test('Add Reference Chain', () => {
    const tracker = new tools.ObjectTracker();
    const obj = { a: 1, b: 2 };
    const obj1 = { a: 1, b: 3 };
    tracker.setBaseReference(obj);
    tracker.addReference(obj1, 'ref1');
    expect(tracker.baseReference).toEqual({ a: 1, b: 2 });
    expect(tracker.references.ref1).toEqual({
      diff: { diff: { '.b': 3 } },
      basedOn: '__base',
    });
    const getRef = tracker.getReference('ref1');
    expect(getRef).toEqual({ a: 1, b: 3 });
  });
  test('Add Reference Chain - 3 Links', () => {
    const tracker = new tools.ObjectTracker();
    const obj = { a: 1, b: 2 };
    const obj1 = { a: 1, b: 3, c: 1 };
    const obj2 = { a: 2, b: 3, c: 1 };
    tracker.setBaseReference(obj);
    tracker.addReference(obj1, 'ref1');
    tracker.addReference(obj2, 'ref2', 'ref1');
    expect(tracker.baseReference).toEqual({ a: 1, b: 2 });
    expect(tracker.references.ref1).toEqual({
      diff: {
        diff: { '.b': 3 },
        added: { '.c': 1 },
      },
      basedOn: '__base',
    });
    expect(tracker.references.ref2).toEqual({
      diff: { diff: { '.a': 2 } },
      basedOn: 'ref1',
    });

    const getRef = tracker.getReference('ref2');
    expect(getRef).toEqual({ a: 2, b: 3, c: 1 });
  });
  test('Add Object', () => {
    const tracker = new tools.ObjectTracker();
    const obj = { a: 1, b: 1 };
    tracker.addReference(obj, 'ref');

    const obj1 = { a: 1, b: 2 };
    tracker.add(1, obj1);
    expect(tracker.diffs[0]).toEqual([1, 'ref', { diff: { '.b': 2 } }, 0]);

    const getObj = tracker.getFromIndex(0);
    expect(getObj).toEqual({ a: 1, b: 2 });
  });
  test('Add Object based on secondary ref', () => {
    const tracker = new tools.ObjectTracker();
    const ref = { a: 1, b: 1 };
    tracker.addReference(ref);

    const ref1 = { a: 1, b: 2, c: 1 };
    tracker.addReference(ref1, 'ref1', '__base');

    const obj1 = { a: 1, b: 3, c: 1 };
    tracker.add(1, obj1, 'ref1');
    expect(tracker.diffs[0]).toEqual([1, 'ref1', { diff: { '.b': 3 } }, 0]);

    const getObj = tracker.getFromIndex(0);
    expect(getObj).toEqual({ a: 1, b: 3, c: 1 });
  });
  test('Removing array end element, and chanigng mid element', () => {
    const tracker = new tools.ObjectTracker();
    const ref = { a: [] };
    tracker.setBaseReference(ref);

    const ref1 = { a: [1, 2, 3] };
    tracker.addReference(ref1, 'ref1', '__base');
    tracker.add(1, { a: [1, 4] }, 'ref1');

    const getObj = tracker.getFromIndex(0);
    expect(getObj).toEqual({ a: [1, 4, undefined] });
  });
  test('Removing array middle element', () => {
    const tracker = new tools.ObjectTracker();
    const ref = { a: [] };
    tracker.setBaseReference(ref);

    const ref1 = { a: [1, 2, 3] };
    tracker.addReference(ref1, 'ref1', '__base');
    tracker.add(1, { a: [1, 3] }, 'ref1');

    const getObj = tracker.getFromIndex(0);
    expect(getObj).toEqual({ a: [1, 3, undefined] });
  });
  test('Removing array first two elements', () => {
    const tracker = new tools.ObjectTracker();
    const ref = { a: [] };
    tracker.setBaseReference(ref);

    const ref1 = { a: [1, 2, 3] };
    tracker.addReference(ref1, 'ref1', '__base');
    tracker.add(1, { a: [3] }, 'ref1');

    const getObj = tracker.getFromIndex(0);
    expect(getObj).toEqual({ a: [3, undefined, undefined] });
  });
  test('Adding array first elements', () => {
    const tracker = new tools.ObjectTracker();
    const ref = { a: [] };
    tracker.setBaseReference(ref);

    const ref1 = { a: [1, 2, 3] };
    tracker.addReference(ref1, 'ref1', '__base');
    tracker.add(1, { a: [0, 1, 2, 3] }, 'ref1');

    const getObj = tracker.getFromIndex(0);
    expect(getObj).toEqual({ a: [0, 1, 2, 3] });
  });
  test('Create Object', () => {
    const tracker = new tools.ObjectTracker();
    const ref = { a: 1, b: 1 };
    tracker.addReference(ref);
    const ref1 = { a: 1, b: 1, c: 2 };
    tracker.addReference(ref1, 'ref1', '__base');
    expect(tracker.references.ref1).toEqual({
      basedOn: '__base',
      diff: { added: { '.c': 2 } },
    });

    const obj1 = { a: 1, b: 2, c: 2 };
    tracker.add(1, obj1, 'ref1');
    expect(tracker.diffs[0]).toEqual([1, 'ref1', { diff: { '.b': 2 } }, 0]);

    const asObj = tracker.toObj();
    expect(asObj.references.ref1).toEqual({
      basedOn: '__base',
      diff: { added: { c: 2 } },
    });
    expect(asObj.diffs[0]).toEqual([1, 'ref1', { diff: { b: 2 } }, 0]);

    const tracker1 = new tools.ObjectTracker();
    tracker1.setFromObj(asObj);
    expect(tracker1.references.ref1).toEqual({
      basedOn: '__base',
      diff: { added: { '.c': 2 } },
    });
    expect(tracker1.diffs[0]).toEqual([1, 'ref1', { diff: { '.b': 2 } }, 0]);
    expect(tracker1).toEqual(tracker);
  });
  describe('Subscriptions', () => {
    describe('Subscriber', () => {
      test('Simple', () => {
        const sub = new tools.Notification();
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        sub.add(callback1);
        sub.add(callback2);
        expect(sub.order).toEqual(['0', '1']);
        expect(callback1.mock.calls.length).toBe(0);
        expect(callback2.mock.calls.length).toBe(0);
        sub.publish();
        expect(callback1.mock.calls.length).toBe(1);
        expect(callback2.mock.calls.length).toBe(1);
      });
      test('Unsubscribe', () => {
        const sub = new tools.Notification();
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        const id1 = sub.add(callback1);
        sub.add(callback2);
        expect(sub.order).toEqual(['0', '1']);
        expect(callback1.mock.calls.length).toBe(0);
        expect(callback2.mock.calls.length).toBe(0);
        sub.publish();
        expect(callback1.mock.calls.length).toBe(1);
        expect(callback2.mock.calls.length).toBe(1);
        sub.remove(id1);
        expect(sub.order).toEqual(['1']);
        sub.publish();
        expect(callback1.mock.calls.length).toBe(1);
        expect(callback2.mock.calls.length).toBe(2);
      });
      test('payload', () => {
        const sub = new tools.Notification();
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        sub.add(callback1);
        sub.add(callback2);
        sub.publish(24);
        expect(callback1.mock.calls.length).toBe(1);
        expect(callback2.mock.calls.length).toBe(1);
        expect(callback1.mock.calls[0][0]).toBe(24);
        expect(callback2.mock.calls[0][0]).toBe(24);
      });
      test('subscribe once', () => {
        const sub = new tools.Notification();
        const callback = jest.fn();
        sub.add(callback, 1);
        expect(callback.mock.calls.length).toBe(0);
        sub.publish(24);
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0]).toBe(24);
        expect(sub.order.length).toBe(0);
        sub.publish(24);
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0]).toBe(24);
      });
      test('subscribe twice', () => {
        const sub = new tools.Notification();
        const callback = jest.fn();
        sub.add(callback, 2);
        expect(callback.mock.calls.length).toBe(0);
        sub.publish(41);
        sub.publish(42);
        sub.publish(43);
        expect(callback.mock.calls.length).toBe(2);
        expect(callback.mock.calls[0][0]).toBe(41);
        expect(callback.mock.calls[1][0]).toBe(42);
        expect(sub.order.length).toBe(0);
      });
    });
    describe('Subscriptions', () => {
      test('Simple', () => {
        const subs = new tools.NotificationManager();
        const mouseCallback = jest.fn();
        const touchCallback = jest.fn();
        subs.add('mouseClick', mouseCallback);
        subs.add('touchClick', touchCallback);
        expect(mouseCallback.mock.calls.length).toBe(0);
        expect(touchCallback.mock.calls.length).toBe(0);
        subs.publish('mouseClick', 21);
        expect(mouseCallback.mock.calls.length).toBe(1);
        expect(mouseCallback.mock.calls[0][0]).toBe(21);
        expect(touchCallback.mock.calls.length).toBe(0);
        subs.publish('touchClick', 42);
        expect(mouseCallback.mock.calls.length).toBe(1);
        expect(touchCallback.mock.calls.length).toBe(1);
        expect(touchCallback.mock.calls[0][0]).toBe(42);
      });
      test('Unsubscribe', () => {
        const subs = new tools.NotificationManager();
        const mouseCallback = jest.fn();
        const touchCallback = jest.fn();
        const id = subs.add('mouseClick', mouseCallback);
        subs.add('touchClick', touchCallback);
        expect(Object.keys(subs.notifications)).toEqual(['mouseClick', 'touchClick']);
        subs.remove('mouseClick', id);
        expect(Object.keys(subs.notifications)).toEqual(['touchClick']);
      });
    });
  });
  describe('Split String', () => {
    test('single letter without escape', () => {
      const s = 'This is |a| test';
      const [split, firstToken] = tools.splitString(s, '|');
      expect(split).toEqual([
        'This is ', 'a', ' test',
      ]);
      expect(firstToken).toEqual(1);
    });
    test('Multi word without escape, start', () => {
      const s = '|This| is |a| test';
      const [split, firstToken] = tools.splitString(s, '|');
      expect(split).toEqual([
        'This', ' is ', 'a', ' test',
      ]);
      expect(firstToken).toEqual(0);
    });
    test('Multi letter without escape, end', () => {
      const s = 'This is a |test|';
      const [split, firstToken] = tools.splitString(s, '|');
      expect(split).toEqual([
        'This is a ', 'test',
      ]);
      expect(firstToken).toEqual(1);
    });
    test('Single letter with escape', () => {
      const s = 'This /|is |a| test';
      const [split, firstToken] = tools.splitString(s, '|', '/');
      expect(split).toEqual([
        'This |is ', 'a', ' test',
      ]);
      expect(firstToken).toEqual(1);
    });
    test('Single letter with 2x escapes', () => {
      const s = 'This /|/|is |a| test';
      const [split, firstToken] = tools.splitString(s, '|', '/');
      expect(split).toEqual([
        'This ||is ', 'a', ' test',
      ]);
      expect(firstToken).toEqual(1);
    });
    test('Print escape sequence', () => {
      const s = 'This ///|is |a| test';
      const [split, firstToken] = tools.splitString(s, '|', '/');
      expect(split).toEqual([
        'This /|is ', 'a', ' test',
      ]);
      expect(firstToken).toEqual(1);
    });
    test('Double', () => {
      const s = 'This is ||a|| test';
      const [split, firstToken] = tools.splitString(s, '||');
      expect(split).toEqual([
        'This is ', 'a', ' test',
      ]);
      expect(firstToken).toEqual(1);
    });
    test('Side by side', () => {
      const s = 'This is |a|| test| for this';
      const [split, firstToken] = tools.splitString(s, '|');
      expect(split).toEqual([
        'This is ', 'a', '', ' test', ' for this',
      ]);
      expect(firstToken).toEqual(1);
    });
    test('Side by side Start', () => {
      const s = '|This ||is ||a|| test| for this';
      const [split, firstToken] = tools.splitString(s, '|');
      expect(split).toEqual([
        'This ', '', 'is ', '', 'a', '', ' test', ' for this',
      ]);
      expect(firstToken).toEqual(0);
    });
    test('Escape escape', () => {
      const s = 'This is //|a test| for this';
      // debugger;
      const [split, firstToken] = tools.splitString(s, '|', '/');
      expect(split).toEqual([
        'This is /', 'a test', ' for this',
      ]);
      expect(firstToken).toEqual(1);
    });
    // 'This is |a| test'
    // 'This \|is |a| test'
    // 'This is ||a|| test'
    // 'This \||is ||a|| test'
    // 'This \||is ||a big|| test'
    // 'This is |a| test'
  });
});

