import React from 'react';
import { LetterStatus } from '@/types';
import { cn } from '@/lib/utils';

interface TileProps {
  letter: string;
  status: LetterStatus;
  isRevealed: boolean;
  isCursor: boolean;
  onClick: () => void;
  animationDelay: number;
  hasError: boolean;
}

const Tile: React.FC<TileProps> = ({ letter, status, isRevealed, isCursor, onClick, animationDelay, hasError }) => {
  const tileStyles = {
    correct: 'bg-green-500 border-green-500 text-white',
    present: 'bg-yellow-500 border-yellow-500 text-white',
    absent: 'bg-zinc-700 border-zinc-700 text-white',
    default: 'border-zinc-600 bg-zinc-900',
  };

  return (
    <div
      className={cn("relative w-16 h-16", { "animate-shake": hasError })}
      style={{ perspective: '1000px' }}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
          { '[transform:rotateX(180deg)]': isRevealed }
        )}
        style={{ transitionDelay: `${animationDelay}ms` }}
      >
        {/* Front face */}
        <div className={cn(
          "absolute w-full h-full [backface-visibility:hidden] border-2 rounded-md flex items-center justify-center text-2xl font-bold uppercase",
          letter && !isRevealed ? 'border-zinc-500' : 'border-zinc-700',
          isCursor ? '!border-blue-500 !border-4' : ''
        )}>
          {letter}
        </div>
        {/* Back face */}
        <div
          className={cn(
            "absolute w-full h-full [backface-visibility:hidden] [transform:rotateX(180deg)] rounded-md flex items-center justify-center text-2xl font-bold uppercase",
            tileStyles[status]
          )}
        >
          {letter}
        </div>
      </div>
    </div>
  );
};

export default Tile;
