import React from 'react';
import { KeyStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Delete } from 'lucide-react';

const keys = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'backspace'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'enter'],
];

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyStatuses: KeyStatus;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, keyStatuses }) => {
  const keyStyles = {
    correct: 'bg-green-500 text-white',
    present: 'bg-yellow-500 text-white',
    absent: 'bg-zinc-800 text-zinc-500 cursor-not-allowed',
    default: 'bg-zinc-600 hover:bg-zinc-500',
  };

  return (
    <div className="flex flex-col items-center space-y-2 w-full max-w-lg mx-auto">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex w-full justify-center space-x-1 sm:space-x-2">
          {row.map((key) => {
            const status = keyStatuses[key] || 'default';
            return (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                disabled={status === 'absent'}
                className={cn(
                  "h-14 rounded-md flex items-center justify-center font-bold uppercase transition-colors",
                  "flex-1 basis-0", // Garante que a base de largura seja igual para todos
                  keyStyles[status],
                  { 'grow-[1.5] text-xs': key.length > 1 } // Permite que teclas maiores cresçam
                )}
              >
                {key === 'backspace' ? <Delete /> : key === 'enter' ? 'Enter' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
