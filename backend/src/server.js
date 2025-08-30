import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Configuração das fontes de dados
const WORD_SOURCES = [
  'https://raw.githubusercontent.com/fserb/pt-br/master/lexico',
  'https://raw.githubusercontent.com/pythonprobr/palavras/master/palavras.txt',
  'https://raw.githubusercontent.com/fserb/pt-br/master/conjugações',
  'https://raw.githubusercontent.com/fserb/pt-br/master/listas/estados-br',
  'https://raw.githubusercontent.com/fserb/pt-br/master/listas/municipios-br',
  'https://raw.githubusercontent.com/fserb/pt-br/master/listas/paises',
  'https://raw.githubusercontent.com/fserb/pt-br/master/listas/verbos',
  'https://raw.githubusercontent.com/dogasantos/ptbr-wordlist/master/wordlist.ptbr.lowercase-acentuado.txt',
  'https://raw.githubusercontent.com/dogasantos/ptbr-wordlist/master/wordlist.ptbr.lowercase-naoacentuado.txt',
];

const NEGATIVE_WORDS_SOURCE = 'https://raw.githubusercontent.com/fserb/pt-br/master/listas/negativas';

// Cache global para as palavras
let wordCache = {
  fiveLetterWords: new Set(),
  negativeWords: new Set(),
  lastUpdate: null,
  updateInterval: 1000 * 60 * 60 // 1 hora
};

// Função para remover acentos
const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// Função para validar palavra no Dicio
async function validateWordInDicio(word) {
  try {
    const response = await fetch(`https://www.dicio.com.br/${word}/`);
    return response.ok;
  } catch (error) {
    console.error(`Erro ao validar "${word}" no Dicio:`, error);
    return false;
  }
}

// Função para buscar e processar listas de palavras
async function fetchWordLists() {
  try {
    console.log('🔄 Atualizando cache de palavras...');
    
    const sourceMap = new Map();
    const allWords = new Set();

    // Buscar palavras das fontes principais
    for (const url of WORD_SOURCES) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const text = await response.text();
          const words = text.toLowerCase().split(/\s+/);
          
          words.forEach(word => {
            const cleanWord = word.trim();
            if (cleanWord.length === 5 && /^[a-zà-úç]+$/.test(cleanWord)) {
              sourceMap.set(cleanWord, url);
              allWords.add(cleanWord);
            }
          });
          
          console.log(`✅ Fonte ${url}: ${words.filter(w => w.length === 5).length} palavras de 5 letras`);
        }
      } catch (error) {
        console.error(`❌ Erro ao buscar ${url}:`, error);
      }
    }

    // Buscar palavras negativas
    try {
      const negativeResponse = await fetch(NEGATIVE_WORDS_SOURCE);
      if (negativeResponse.ok) {
        const negativeText = await negativeResponse.text();
        const negativeWords = new Set(negativeText.toLowerCase().split(/\s+/));
        
        // Adicionar palavras específicas que devem ser excluídas
        negativeWords.add('samão');
        negativeWords.add('rolao');
        negativeWords.add('tatas');
        negativeWords.add('sapat');
        negativeWords.add('áxone');
        negativeWords.add('bilmó');
        negativeWords.add('penny');
        negativeWords.add('mexei');
        negativeWords.add('infer');
        negativeWords.add('bergo');
        negativeWords.add('lanço');
        
        wordCache.negativeWords = negativeWords;
        console.log(`✅ Palavras negativas carregadas: ${negativeWords.size}`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar palavras negativas:', error);
    }

    // Filtrar palavras válidas
    const validWords = new Set();
    for (const word of allWords) {
      const wordWithoutAccents = removeAccents(word);
      if (!wordCache.negativeWords.has(wordWithoutAccents)) {
        validWords.add(word);
      }
    }

    wordCache.fiveLetterWords = validWords;
    wordCache.lastUpdate = Date.now();
    
    console.log(`✅ Cache atualizado: ${validWords.size} palavras válidas de 5 letras`);
    console.log(`📊 Exemplos: ${Array.from(validWords).slice(0, 10).join(', ')}`);
    
    return validWords;
  } catch (error) {
    console.error('❌ Erro ao atualizar cache:', error);
    return wordCache.fiveLetterWords;
  }
}

// Função para obter palavra aleatória
function getRandomWord() {
  if (wordCache.fiveLetterWords.size === 0) {
    throw new Error('Nenhuma palavra disponível');
  }
  
  const words = Array.from(wordCache.fiveLetterWords);
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

// Função para validar tentativa
function validateGuess(guess, solution) {
  if (guess.length !== 5) {
    return {
      isValid: false,
      error: 'Palavra deve ter exatamente 5 letras'
    };
  }

  if (!wordCache.fiveLetterWords.has(guess.toLowerCase())) {
    return {
      isValid: false,
      error: 'Palavra não encontrada no dicionário'
    };
  }

  return { isValid: true };
}

// Função para calcular resultado da tentativa
function calculateResult(guess, solution) {
  const result = [];
  const solutionArray = solution.toLowerCase().split('');
  const guessArray = guess.toLowerCase().split('');
  const usedPositions = new Set();

  // Primeiro passo: marcar letras corretas (verde)
  for (let i = 0; i < 5; i++) {
    if (guessArray[i] === solutionArray[i]) {
      result.push({ letter: guessArray[i], status: 'correct', position: i });
      usedPositions.add(i);
    }
  }

  // Segundo passo: marcar letras presentes mas em posição errada (amarelo)
  for (let i = 0; i < 5; i++) {
    if (!usedPositions.has(i)) {
      const letter = guessArray[i];
      const letterCountInSolution = solutionArray.filter(l => l === letter).length;
      const letterCountUsed = result.filter(r => r.letter === letter).length;
      
      if (solutionArray.includes(letter) && letterCountUsed < letterCountInSolution) {
        result.push({ letter, status: 'present', position: i });
        usedPositions.add(i);
      }
    }
  }

  // Terceiro passo: marcar letras ausentes (cinza)
  for (let i = 0; i < 5; i++) {
    if (!usedPositions.has(i)) {
      result.push({ letter: guessArray[i], status: 'absent', position: i });
    }
  }

  // Ordenar por posição
  result.sort((a, b) => a.position - b.position);

  return result;
}

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    wordCount: wordCache.fiveLetterWords.size,
    lastUpdate: wordCache.lastUpdate
  });
});

// Rota para obter palavra do dia
app.get('/api/daily-word', (req, res) => {
  try {
    const word = getRandomWord();
    res.json({ 
      word,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter palavra do dia' });
  }
});

// Rota para validar tentativa
app.post('/api/validate-guess', (req, res) => {
  try {
    const { guess, solution } = req.body;
    
    if (!guess || !solution) {
      return res.status(400).json({ error: 'Palavra e solução são obrigatórias' });
    }

    // Validar tentativa
    const validation = validateGuess(guess, solution);
    if (!validation.isValid) {
      return res.json({
        isValid: false,
        error: validation.error
      });
    }

    // Calcular resultado
    const result = calculateResult(guess, solution);
    
    // Verificar se ganhou
    const isCorrect = guess.toLowerCase() === solution.toLowerCase();
    const gameStatus = isCorrect ? 'won' : 'continue';

    res.json({
      isValid: true,
      result,
      gameStatus,
      isCorrect
    });
  } catch (error) {
    console.error('Erro ao validar tentativa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter estatísticas do dicionário
app.get('/api/dictionary-stats', (req, res) => {
  res.json({
    totalWords: wordCache.fiveLetterWords.size,
    lastUpdate: wordCache.lastUpdate,
    sources: WORD_SOURCES.length,
    examples: Array.from(wordCache.fiveLetterWords).slice(0, 20)
  });
});

// Inicializar cache na primeira execução
app.listen(PORT, async () => {
  console.log(`🚀 Servidor Termo2 rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
  
  // Carregar palavras na inicialização
  await fetchWordLists();
  
  // Atualizar cache periodicamente
  setInterval(fetchWordLists, wordCache.updateInterval);
});

export default app;
