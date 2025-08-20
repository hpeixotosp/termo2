import React from 'react';
import { getLetterStatuses } from '@/lib/utils';
import Tile from './Tile';

interface GameBoardProps {
  guesses: string[][];
  solution: string;
  currentGuessIndex: number;
  cursorPosition: number;
  onTileClick: (position: number) => void;
  hasError: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ guesses, solution, currentGuessIndex, cursorPosition, onTileClick, hasError }) => {
  return (
    <div className="grid grid-rows-6 gap-1.5">
      {guesses.map((guess, rowIndex) => {
        const isCurrentRow = rowIndex === currentGuessIndex;
        const isRevealed = rowIndex < currentGuessIndex;
        const guessString = guess.join(''); // Junta para obter statuses
        const statuses = isRevealed ? getLetterStatuses(guessString, solution) : [];

        return (
          <div key={rowIndex} className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 5 }).map((_, colIndex) => (
              <Tile
                key={colIndex}
                letter={guess[colIndex] || ''}
                status={isRevealed ? statuses[colIndex] : 'default'}
                isRevealed={isRevealed}
                isCursor={isCurrentRow && colIndex === cursorPosition}
                onClick={() => isCurrentRow && onTileClick(colIndex)}
                animationDelay={isRevealed ? colIndex * 100 : 0}
                hasError={isCurrentRow && hasError}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
