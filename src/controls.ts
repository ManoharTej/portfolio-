export const Controls = {
  forward: 'forward',
  backward: 'backward',
  leftward: 'leftward',
  rightward: 'rightward',
  jump: 'jump',
  run: 'run',
} as const;

export type Controls = typeof Controls[keyof typeof Controls];
