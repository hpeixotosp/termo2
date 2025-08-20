import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LetterStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const removeAccents = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const getLetterStatuses = (guess: string, solution: string): LetterStatus[] => {
  const guessNormalized = removeAccents(guess);
  const solutionNormalized = removeAccents(solution);
  
  const statuses: LetterStatus[] = Array(solution.length).fill('absent');
  const solutionLettersCount: { [key: string]: number } = {};
  
  for (const letter of solutionNormalized) {
    solutionLettersCount[letter] = (solutionLettersCount[letter] || 0) + 1;
  }

  // First pass for correct letters
  for (let i = 0; i < solution.length; i++) {
    if (guessNormalized[i] === solutionNormalized[i]) {
      statuses[i] = 'correct';
      solutionLettersCount[guessNormalized[i]]--;
    }
  }

  // Second pass for present letters
  for (let i = 0; i < solution.length; i++) {
    if (statuses[i] !== 'correct' && solutionLettersCount[guessNormalized[i]] > 0) {
      statuses[i] = 'present';
      solutionLettersCount[guessNormalized[i]]--;
    }
  }

  return statuses;
};
