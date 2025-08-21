'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import GameBoard from '@/components/GameBoard';
import Keyboard from '@/components/Keyboard';
import { getRandomWord, getWordData } from '@/lib/words';
import { getLetterStatuses } from '@/lib/utils';
import { KeyStatus } from '@/types';

const removeAccents = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function Home() {
  const [solution, setSolution] = useState<string>('');
  const [guesses, setGuesses] = useState<string[][]>(Array(6).fill(Array(5).fill('')));
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
  const [keyStatuses, setKeyStatuses] = useState<KeyStatus>({});
  const [wordSet, setWordSet] = useState<Set<string>>(new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [gameCount, setGameCount] = useState(0);
  const [previousWords, setPreviousWords] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Adiciona um timestamp único para garantir palavras diferentes
        const timestamp = Date.now();
        console.log('🚀 INICIALIZANDO JOGO - Timestamp:', timestamp);
        console.log('🔄 Número de inicializações detectadas');
        
        // Mostra instruções imediatamente para melhor UX
        setShowInstructions(true);
        
        const { word } = await getRandomWord();
        const { withoutAccents } = await getWordData();
        
        console.log('=== DEBUG INICIALIZAÇÃO ===');
        console.log('Palavra escolhida:', word);
        console.log('Tamanho do wordSet:', withoutAccents.size);
        console.log('Exemplos de palavras no wordSet:', Array.from(withoutAccents).slice(0, 10));
        console.log('Teste com palavra simples "amigo":', withoutAccents.has('amigo'));
        console.log('Teste com palavra simples "casa":', withoutAccents.has('casa'));
        console.log('Teste com palavra simples "festa":', withoutAccents.has('festa'));
        
        // Teste da função removeAccents
        console.log('=== TESTE REMOVE ACCENTS ===');
        console.log('removeAccents("amigo"):', removeAccents('amigo'));
        console.log('removeAccents("casa"):', removeAccents('casa'));
        console.log('removeAccents("festa"):', removeAccents('festa'));
        console.log('removeAccents("água"):', removeAccents('água'));
        console.log('removeAccents("força"):', removeAccents('força'));
        console.log('==========================');
        
        setSolution(word.toLowerCase());
        setWordSet(withoutAccents);
        
        // Debug adicional para verificar se o estado foi definido
        console.log('=== VERIFICAÇÃO DO ESTADO ===');
        console.log('Solution definida:', word.toLowerCase());
        console.log('WordSet definido com tamanho:', withoutAccents.size);
        console.log('==========================');
        
        setGameCount(1); // Primeiro jogo
        setPreviousWords(prev => new Set([...Array.from(prev), word.toLowerCase()]));
        
        console.log('Jogo inicializado com sucesso. Timestamp:', timestamp);
      } catch (error) {
        console.error('Erro ao inicializar jogo:', error);
        // Fallback para palavra garantida
        setSolution('amigo');
        setGameCount(1);
        setPreviousWords(new Set(['amigo']));
        setShowInstructions(true);
      }
    };
    initializeGame();
  }, []);

  const triggerError = () => {
    setHasError(true);
    setTimeout(() => setHasError(false), 600);
  };

  const toggleInstructions = () => {
    if (showInstructions) {
      // Se já está mostrando, apenas esconde
      setShowInstructions(false);
    } else {
      // Se não está mostrando, mostra
      setShowInstructions(true);
    }
  };

  const resetGame = async () => {
    // Limita a 2 jogos
    if (gameCount >= 2) {
      toast.info('Limite de jogos atingido! Recarregue a página para jogar novamente.');
      return;
    }

    try {
      let attempts = 0;
      const maxAttempts = 20;
      let newWord = '';
      let newWordSource = '';

      // Tenta encontrar uma palavra diferente
      while (attempts < maxAttempts) {
        const { word, source } = await getRandomWord();
        attempts++;
        
        // Verifica se a palavra já foi usada
        if (!previousWords.has(word.toLowerCase())) {
          newWord = word;
          newWordSource = source;
          break;
        }
        
        console.log(`Tentativa ${attempts}: Palavra "${word}" já foi usada, tentando outra...`);
      }

      // Se não conseguiu encontrar palavra diferente, usa uma de fallback
      if (!newWord) {
        const fallbackWords = ['amigo', 'canto', 'dente', 'festa', 'gente', 'hotel', 'idade', 'junto', 'livro', 'mundo', 'noite', 'ontem', 'paz', 'quem', 'rua', 'sol', 'tempo', 'vida', 'xadrez', 'zona'];
        
        for (const fallback of fallbackWords) {
          if (!previousWords.has(fallback)) {
            newWord = fallback;
            newWordSource = 'Fallback - Palavras comuns';
            break;
          }
        }
      }

      if (newWord) {
        // Reseta todos os estados do jogo
        setGuesses(Array(6).fill(Array(5).fill('')));
        setCurrentGuessIndex(0);
        setKeyStatuses({});
        setIsGameOver(false);
        setCursorPosition(0);
        setHasError(false);
        
        // Define a nova palavra e incrementa o contador
        setSolution(newWord.toLowerCase());
        setPreviousWords(prev => new Set([...Array.from(prev), newWord.toLowerCase()]));
        setGameCount(prev => prev + 1);
        
        console.log('Novo jogo iniciado com sucesso. Fonte:', newWordSource);
        toast.success('Novo jogo iniciado!', {
          position: 'top-center',
          duration: 3000,
        });
      } else {
                        toast.error('Erro ao gerar nova palavra. Tente novamente.', {
                  position: 'top-center',
                  duration: 3000,
                });
        console.error('Falha ao encontrar palavra diferente após', maxAttempts, 'tentativas');
      }
    } catch (error) {
      console.error('Erro ao resetar jogo:', error);
                    toast.error('Erro ao iniciar novo jogo. Tente novamente.', {
                position: 'top-center',
                duration: 3000,
              });
    }
  };

  const handleKeyPress = useCallback(async (key: string) => {
    if (isGameOver || currentGuessIndex >= 6) return;

    let currentGuessArray = guesses[currentGuessIndex]; // Agora é um array de caracteres

    if (key === 'enter') {
      const currentGuessString = currentGuessArray.join(''); // Junta para validação
      if (currentGuessString.length < 5) {
        toast.error('Palavra muito curta', {
          position: 'top-center',
          duration: 3000,
        });
        triggerError();
        return;
      }
      
             // Debug da validação (apenas se necessário)
       if (process.env.NODE_ENV === 'development' && currentGuessString === 'meiao') {
         console.log('=== VALIDAÇÃO DE PALAVRA ===');
         console.log('Palavra digitada:', currentGuessString);
         console.log('Palavra sem acentos:', removeAccents(currentGuessString));
         console.log('Está no wordSet?', wordSet.has(removeAccents(currentGuessString)));
         console.log('Tamanho do wordSet:', wordSet.size);
       }
      
      // Debug sempre ativo para validação
      console.log('=== VALIDAÇÃO DE PALAVRA ===');
      console.log('Palavra digitada:', currentGuessString);
      console.log('Palavra sem acentos:', removeAccents(currentGuessString));
      console.log('Tamanho do wordSet:', wordSet.size);
      console.log('Está no wordSet?', wordSet.has(removeAccents(currentGuessString)));
      console.log('Primeiras 20 palavras do wordSet:', Array.from(wordSet).slice(0, 20));
      console.log('Solution atual:', solution);
      console.log('==========================');
      
      // Verifica se o wordSet está vazio (problema crítico)
      if (wordSet.size === 0) {
        console.error('❌ CRÍTICO: wordSet está vazio!');
        toast.error('Erro interno do jogo. Recarregue a página.', {
          position: 'top-center',
          duration: 5000,
        });
        return;
      }
      
      if (!wordSet.has(removeAccents(currentGuessString))) {
                        toast.error('Palavra não encontrada', {
                  position: 'top-center',
                  duration: 3000,
                });
        triggerError();
        return;
      }

      const statuses = getLetterStatuses(currentGuessString, solution);
      const newKeyStatuses = { ...keyStatuses };
      
      // Atualiza status das teclas baseado na resposta
      statuses.forEach((status, i) => {
        const letter = removeAccents(currentGuessString[i]);
        const currentStatus = newKeyStatuses[letter];
        
        // Só atualiza se o novo status for melhor que o atual
        if (status === 'correct' || 
            (status === 'present' && currentStatus !== 'correct') ||
            (status === 'absent' && currentStatus !== 'correct' && currentStatus !== 'present')) {
          newKeyStatuses[letter] = status;
        }
      });
      
      // Debug temporário para verificar status das teclas
      console.log('=== STATUS DAS TECLAS ===');
      console.log('Palavra:', currentGuessString);
      console.log('Statuses:', statuses);
      console.log('KeyStatuses atualizados:', newKeyStatuses);
      
      setKeyStatuses(newKeyStatuses);

      setCurrentGuessIndex(currentGuessIndex + 1);
      setCursorPosition(0);

      if (removeAccents(currentGuessString) === removeAccents(solution)) {
        setIsGameOver(true);
        toast.success('Parabéns, você venceu!', {
          position: 'top-center',
          duration: 5000,
        });
      } else if (currentGuessIndex === 5) {
        setIsGameOver(true);
        toast.info(`Fim de jogo! A palavra era: ${solution.toUpperCase()}`, {
          position: 'top-center',
          duration: 5000,
        });
      }
      return;
    }

    if (key === 'backspace') {
      if (cursorPosition > 0) {
        const newGuessArray = [...currentGuessArray]; // Cria uma cópia para modificar
        
        // Se a posição atual tem letra, apaga ela
        // Se não tem, apaga a anterior
        if (newGuessArray[cursorPosition] && newGuessArray[cursorPosition] !== '') {
          newGuessArray[cursorPosition] = '';
        } else {
          newGuessArray[cursorPosition - 1] = '';
          setCursorPosition(cursorPosition - 1);
        }
        
        setGuesses(prev => {
          const newGuesses = [...prev];
          newGuesses[currentGuessIndex] = newGuessArray;
          return newGuesses;
        });
      }
      return;
    }

    if (/^[a-zç]$/.test(key)) {
      if (cursorPosition >= 5) return;

      const newGuessArray = [...currentGuessArray]; // Cria uma cópia para modificar
      newGuessArray[cursorPosition] = key;

      setGuesses(prev => {
        const newGuesses = [...prev];
        newGuesses[currentGuessIndex] = newGuessArray;
        return newGuesses;
      });

      // Se preencheu o último box, volta para o primeiro automaticamente
      if (cursorPosition === 4) {
        setCursorPosition(0);
      } else {
        setCursorPosition(cursorPosition + 1);
      }
    }
  }, [guesses, currentGuessIndex, isGameOver, solution, cursorPosition, wordSet, keyStatuses]);
  
  // Monitora mudanças no wordSet para debug
  useEffect(() => {
    console.log('🔍 wordSet mudou - Novo tamanho:', wordSet.size);
    if (wordSet.size > 0) {
      console.log('✅ wordSet carregado com sucesso');
      console.log('Primeiras 10 palavras:', Array.from(wordSet).slice(0, 10));
    } else {
      console.log('❌ wordSet ainda está vazio');
    }
  }, [wordSet]);
  
  const handleTileClick = (position: number) => {
    setCursorPosition(position);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'backspace' || key === 'enter' || /^[a-zç]$/.test(key)) {
        handleKeyPress(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  // Mostra instruções quando showInstructions mudar
  useEffect(() => {
    if (showInstructions) {
      // Remove qualquer toast existente antes de mostrar um novo
      toast.dismiss();
      
      // Pequeno delay para garantir que a UI esteja pronta
      const timer = setTimeout(() => {
        toast.info(
          <div className="space-y-4 text-left bg-white text-gray-900 p-4 rounded-lg">
            <p className="font-semibold text-base text-blue-600">
              Descubra as palavras certas. Depois de cada tentativa, as peças mostram o quão perto você está da solução.
            </p>
            
            <div className="space-y-3">
              {/* Primeira linha - TURMA com T verde */}
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold text-lg">T</div>
                  <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center text-white font-bold text-lg">U</div>
                  <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center text-white font-bold text-lg">R</div>
                  <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center text-white font-bold text-lg">M</div>
                  <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center text-white font-bold text-lg">A</div>
                </div>
                <span className="text-sm text-gray-700">
                  A letra T faz parte da palavra e está na posição correta.
                </span>
              </div>
              
              {/* Segunda linha - VIOLA com O amarelo */}
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center text-white font-bold text-lg">V</div>
                  <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center text-white font-bold text-lg">I</div>
                  <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white font-bold text-lg">O</div>
                  <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center text-white font-bold text-lg">L</div>
                  <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center text-white font-bold text-lg">A</div>
                </div>
                <span className="text-sm text-gray-700">
                  A letra O faz parte da palavra mas em outra posição.
                </span>
              </div>
              
              {/* Terceira linha - PULGA com G cinza escuro */}
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center text-white font-bold text-lg">P</div>
                  <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center text-white font-bold text-lg">U</div>
                  <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center text-white font-bold text-lg">L</div>
                  <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center text-white font-bold text-lg">G</div>
                  <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center text-white font-bold text-lg">A</div>
                </div>
                <span className="text-sm text-gray-700">
                  A letra G não faz parte da palavra.
                </span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 pt-2">
              Os acentos são preenchidos automaticamente, e não são considerados nas dicas.
            </p>
          </div>,
          {
            duration: 5000, // Reduzido de 10s para 5s
            position: 'top-center',
            closeButton: true,
            dismissible: true,
            id: 'instructions', // ID único para evitar duplicação
          }
        );
      }, 100); // Delay de apenas 100ms para melhor responsividade
      
      // Cleanup do timer
      return () => clearTimeout(timer);
    } else {
      // Se showInstructions for false, remove o toast
      toast.dismiss('instructions');
    }
  }, [showInstructions]);

  return (
    <div className="min-h-screen w-full bg-black">
      {/* Header fixo no topo - SEMPRE VISÍVEL */}
      <div className="sticky top-0 z-50 bg-black border-b border-zinc-800 py-4">
        <div className="max-w-lg mx-auto relative">
          {/* Título centralizado */}
          <h1 className="text-4xl font-bold tracking-wider text-center text-white">TERMO</h1>
          
          {/* Contador de jogos - posicionado à esquerda */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
            <span className="text-sm text-zinc-400">Jogo {gameCount}/2</span>
          </div>
          
          {/* Botão de instruções - posicionado à direita */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <button
              onClick={toggleInstructions}
              className="w-8 h-8 rounded-full bg-zinc-600 hover:bg-zinc-500 text-white font-bold text-lg flex items-center justify-center transition-colors"
            >
              ?
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal do jogo */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 sm:p-8 space-y-4">
        
        
        {/* GameBoard e Keyboard - SEMPRE VISÍVEIS */}
        <GameBoard
          guesses={guesses}
          solution={solution}
          currentGuessIndex={currentGuessIndex}
          cursorPosition={cursorPosition}
          onTileClick={handleTileClick}
          hasError={hasError}
        />
        <Keyboard onKeyPress={handleKeyPress} keyStatuses={keyStatuses} />
        
        {/* Botões de ação - condicionais */}
        {isGameOver && gameCount < 2 && (
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Jogar Novamente
          </button>
        )}
        
        {isGameOver && gameCount >= 2 && (
          <div className="text-center">
            <p className="text-zinc-400 mb-2">Limite de jogos atingido!</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-zinc-600 hover:bg-zinc-500 text-white font-semibold rounded-lg transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
