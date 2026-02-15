// Minimal stub for unmigrated Element
// Will be replaced when Element is migrated to TypeScript

import type { TypeParsablePoint, TypeParsableTransform } from '../tools/g2';
import type { TypeColor } from '../tools/types';

export type OBJ_Scenario = {
  position?: TypeParsablePoint;
  translation?: TypeParsablePoint;
  rotation?: number;
  scale?: TypeParsablePoint | number;
  transform?: TypeParsableTransform;
  color?: TypeColor;
  isShown?: boolean;
};

export class FigureElement {
  [key: string]: any;
}
