// import {
//   FigureElementPrimitive,
//   FigureElementCollection,
//   // AnimationPhase,
// } from '../Element';
// import Figure from '../Figure';
import {
  Point, Rect, Transform,
} from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
// import webgl from '../../__mocks__/WebGLInstanceMock';
// import DrawContext2D from '../../__mocks__/DrawContext2DMock';
import * as tools from '../../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';
// import CommonFigureCollection from './FigureCollection';

tools.isTouchDevice = jest.fn();

jest.mock('..//Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');
// jest.mock('../../tools/tools');

describe('Figure Equations From Object', () => {
  let figure;
  let ways;
  // let collection;
  // let color1;

  beforeEach(() => {
    figure = makeFigure();
    // collection = new CommonFigureCollection(figure);
    // ways = {
    // }
    ways = {
      simple: () => {
        figure.addElements([
          // Full object definition
          {
            path: '',
            name: 'group1',
            method: 'shapes.collection',
            options: {
              transform: new Transform('group'),
            },
            mods: {
              isTouchable: true,
            },
          },
          // 1. Don't need path if adding to root collection
          // 2. Method can be simplified if shortcut is defined in addElements
          {
            name: 'group2',
            method: 'collection',
            options: {
              transform: new Transform('group'),
            },
            mods: {
              isTouchable: true,
            },
          },
        ], figure.elements);
      },
      nesting: () => {
        figure.addElements([
          // Start with a collection
          {
            name: 'group',
            method: 'shapes.collection',
            options: {
              transform: new Transform('group'),
            },
            // The collection can be added to by nesting
            addElements: [
              {
                name: 'group1',
                method: 'collection',
              },
            ],
          },
          // The collection can be added to by providing full path
          {
            path: '_group',
            name: 'group2',
            method: 'shapes.collection',
          },
        ], figure.elements);
        // The collection can be added to in secondary addElements
        figure.addElements([
          {
            path: '_group',
            name: 'group3',
            method: 'shapes.collection',
          },
        ], figure.elements);
        // The collection can be added with relative path to the root collection
        figure.addElements([
          {
            name: 'group4',
            method: 'shapes.collection',
          },
        ], figure.elements._group);

        // A sub collection can be added with path
        figure.addElements([
          {
            path: 'group.group1',
            name: 'group11',
            method: 'shapes.collection',
          },
        ], figure.elements);
      },
      deepNest: () => {
        figure.addElements([
          {
            name: 'group',
            method: 'collection',
            addElements: [
              {
                name: 'group1',
                method: 'collection',
                addElements: [
                  {
                    name: 'group2',
                    method: 'collection',
                  },
                ],
              },
            ],
          },
        ], figure.elements);
      },
      examples: () => {
        const triPoints = [
          new Point(-0.8, -1),
          new Point(0.8, -1),
          new Point(0, 1),
        ];
        const tri = {
          points: triPoints,
          width: 0.015,
          close: true,
          borderToPoint: 'alwaysOn',
          position: new Point(0, 0),
          color: [1, 0, 0, 1],
        };
        const sideLength = {
          color: [0, 0, 1, 1],
          offset: 0.2,
          label: {
            text: 'A',
            location: 'outside',
            orientation: 'horizontal',
          },
          showLine: false,
        };
        const side12 = {
          p1: triPoints[1],
          p2: triPoints[0],
          label: { text: 'B' },
        };
        const side23 = {
          p1: triPoints[2],
          p2: triPoints[1],
        };
        figure.addElements([
          {
            name: 'testEqn',
            method: 'addEquation',
            options: {
              elements: {
                a: 'a',
                b: 'b',
                c: 'c',
              },
              forms: {
                0: ['a', 'b', 'c'],
              },
            },
          },
          {
            name: 'tri',
            method: 'shapes.collection',
            options: {
              transform: new Transform('iso').translate(0, 0),
            },
            addElements: [
              {
                name: 'line',
                method: 'opolyline',
                options: tri,
                mods: { isTouchable: true },
              },
              {
                name: 'side12',
                method: 'oline',
                options: tools.joinObjects({}, sideLength, side12),
                mods: { isTouchable: true },
              },
              {
                name: 'side23',
                method: 'oline',
                options: tools.joinObjects({}, sideLength, side23),
              },
            ],
          },
        ], figure.elements);
      },
    };
  });
  test('Figure instantiation', () => {
    expect(figure.limits).toEqual(new Rect(-1, -1, 2, 2));
  });
  test('Simple', () => {
    ways.simple();
    const { elements } = figure;
    expect(elements).toHaveProperty('_group1');
    expect(elements).toHaveProperty('_group2');
    // expect(elements).toHaveProperty('_group3');
    // expect(elements).toHaveProperty('_group4');
    // expect(elements._group4.transform.name).toBe('group');
    expect(elements._group1.isTouchable).toBe(true);
    expect(elements._group2.isTouchable).toBe(true);
    // expect(elements._group3.isTouchable).toBe(true);
    // expect(elements._group4.isTouchable).toBe(true);
  });
  test('Nesting', () => {
    ways.nesting();
    const { elements } = figure;
    expect(elements).toHaveProperty('_group');
    const group = elements._group;
    expect(group).toHaveProperty('_group1');
    expect(group).toHaveProperty('_group2');
    expect(group).toHaveProperty('_group3');
    expect(group).toHaveProperty('_group4');
    expect(group._group1).toHaveProperty('_group11');
    // expect(group).toHaveProperty('_group5');
  });
  test('Deep Nest', () => {
    ways.deepNest();
    const { elements } = figure;
    expect(elements).toHaveProperty('_group');
    expect(elements._group).toHaveProperty('_group1');
    expect(elements._group._group1).toHaveProperty('_group2');
  });
  test('Examples', () => {
    ways.examples();
    const { elements } = figure;
    expect(elements).toHaveProperty('_testEqn');
    expect(elements).toHaveProperty('_tri');
    const tri = elements._tri;
    expect(tri).toHaveProperty('_line');
    expect(tri).toHaveProperty('_side12');
    expect(tri).toHaveProperty('_side23');
  });
});
