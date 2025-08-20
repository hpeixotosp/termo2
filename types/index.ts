export type LetterStatus = 'correct' | 'present' | 'absent' | 'default';

export type KeyStatus = {
  [key: string]: LetterStatus;
};
