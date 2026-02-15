export type TypeGLPrimitive = 'TRIANGLES' | 'POINTS' | 'FAN' | 'STRIP' | 'LINES';

export type OBJ_Touch = {
  onClick?: string | ((p: any, element: any) => void);
  colorSeed?: string;
  enable?: boolean;
};
