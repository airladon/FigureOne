import type { Transform, Point } from '../tools/g2';
import type { Type3DMatrix } from '../tools/m3';
import type { Recorder } from './Recorder/Recorder';
import type TimeKeeper from './TimeKeeper';
import type { NotificationManager } from '../tools/tools';

export type OBJ_SpaceTransforms = {
  glToFigure: Transform;
  figureToGL: Transform;
  pixelToFigure: Transform;
  figureToPixel: Transform;
  pixelToGL: Transform;
  glToPixel: Transform;
  glToPixelMatrix: Type3DMatrix;
  figureToGLMatrix: Type3DMatrix;
  figureToPixelMatrix: Type3DMatrix;
};

export type OBJ_FigureLimits = {
  x: { min: number; max: number };
  y: { min: number; max: number };
  z: { min: number; max: number };
};

export type OBJ_FigureForElement = {
  animateNextFrame: (force?: boolean, from?: string) => void;
  animationFinished: () => void;
  recorder: Recorder;
  timeKeeper: TimeKeeper;
  notifications: NotificationManager;
  pixelToGL: (p: Point) => Point;
  preventDefault: () => void;
};

export default class Figure { [key: string]: any; }
