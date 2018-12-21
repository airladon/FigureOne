// import {
//   DiagramElementPrimative,
//   DiagramElementCollection,
//   // AnimationPhase,
// } from '../Element';
// import Diagram from '../Diagram';
import {
  Point, Rect, Transform,
} from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
// import webgl from '../../__mocks__/WebGLInstanceMock';
// import DrawContext2D from '../../__mocks__/DrawContext2DMock';
// import VertexPolygon from '../DrawingObjects/VertexObject/VertexPolygon';
import * as tools from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';
// import CommonDiagramCollection from './DiagramCollection';

tools.isTouchDevice = jest.fn();

jest.mock('..//Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');
// jest.mock('../../tools/tools');

describe('Diagram Equations From Object', () => {
  let diagram;
  let ways;
  // let collection;
  // let color1;

  beforeEach(() => {
    diagram = makeDiagram();
    // collection = new CommonDiagramCollection(diagram);
    // ways = {
    // }
    ways = {
      simple: () => {
        diagram.addElements(diagram.elements, [
          // Full object definition
          {
            path: '',
            name: 'group1',
            method: 'shapes/collection',
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
          // Can use array form definition for simplicity
          ['', 'group3', 'collection', { transform: new Transform('group') }, { isTouchable: true }],
          // Multiple option objects are allowed where later objects overwrite
          // earlier objects
          ['', 'group4', 'collection', [
            { transform: new Transform('group1') },
            { transform: new Transform('group') },
          ], { isTouchable: true }],
        ]);
      },
      nesting: () => {
        diagram.addElements(diagram.elements, [
          // Start with a group
          {
            name: 'group',
            method: 'shapes/collection',
            options: {
              transform: new Transform('group'),
            },
            // The group can be added to by nesting
            addElements: [
              ['', 'group1', 'collection'],
            ],
          },
          // The group can be added to by providing full path
          {
            path: '_group',
            name: 'group2',
            method: 'shapes/collection',
          },
          // The group can be added to by using array form with path first
          ['_group', 'group3', 'collection'],
        ]);
        // The group can be added to in secondary addElements
        diagram.addElements(diagram.elements, [
          {
            path: '_group',
            name: 'group4',
            method: 'shapes/collection',
          },
        ]);
        // The group can be added with relative path to the root collection
        diagram.addElements(diagram.elements._group, [
          {
            name: 'group5',
            method: 'shapes/collection',
          },
        ]);
      },
      deepNest: () => {
        diagram.addElements(diagram.elements, [
          {
            name: 'group',
            method: 'collection',
            addElements: [
              ['', 'group1', 'collection', {}, {}, [
                ['', 'group2', 'collection'],
              ]],
            ],
          },
        ]);
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
        diagram.addElements(diagram.elements, [
          {
            name: 'testEqn',
            method: 'equation/addEquation',
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
            method: 'shapes/collection',
            options: {
              transform: new Transform('iso').translate(0, 0),
            },
            addElements: [
              ['', 'line', 'polyLine', tri, { isTouchable: true }],
              ['', 'side12', 'line', [sideLength, side12]],
              ['', 'side23', 'line', [sideLength, side23]],
            ],
          },
        ]);
      },
    };
  });
  test('Diagram instantiation', () => {
    expect(diagram.limits).toEqual(new Rect(-1, -1, 2, 2));
  });
  test('Simple', () => {
    ways.simple();
    const { elements } = diagram;
    expect(elements).toHaveProperty('_group1');
    expect(elements).toHaveProperty('_group2');
    expect(elements).toHaveProperty('_group3');
    expect(elements).toHaveProperty('_group4');
    expect(elements._group4.transform.name).toBe('group');
    expect(elements._group1.isTouchable).toBe(true);
    expect(elements._group2.isTouchable).toBe(true);
    expect(elements._group3.isTouchable).toBe(true);
    expect(elements._group4.isTouchable).toBe(true);
  });
  test('Nesting', () => {
    ways.nesting();
    const { elements } = diagram;
    expect(elements).toHaveProperty('_group');
    const group = elements._group;
    expect(group).toHaveProperty('_group1');
    expect(group).toHaveProperty('_group2');
    expect(group).toHaveProperty('_group3');
    expect(group).toHaveProperty('_group4');
    expect(group).toHaveProperty('_group5');
  });
  test('Deep Nest', () => {
    ways.deepNest();
    const { elements } = diagram;
    expect(elements).toHaveProperty('_group');
    expect(elements._group).toHaveProperty('_group1');
    expect(elements._group._group1).toHaveProperty('_group2');
  });
  test('Examples', () => {
    ways.examples();
    const { elements } = diagram;
    expect(elements).toHaveProperty('_testEqn');
    expect(elements).toHaveProperty('_tri');
    const tri = elements._tri;
    expect(tri).toHaveProperty('_line');
    expect(tri).toHaveProperty('_side12');
    expect(tri).toHaveProperty('_side23');
  });
});
