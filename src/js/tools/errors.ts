const errors = {
  // Atlas errors (1xxx)
  1000: 'Either `src` or `font` must be defined to create an atlas',
  1001: 'Must define a scene to create an atlas from a font',
  1002: 'Failed to get 2D canvas context for atlas',
} as const;

export type FigureOneErrorCode = keyof typeof errors;

export function figureOneError(code: FigureOneErrorCode, detail?: string): Error {
  const message = errors[code];
  const full = detail ? `${message} (${detail})` : message;
  return new Error(`F1-${code}: ${full}`);
}

export default errors;
