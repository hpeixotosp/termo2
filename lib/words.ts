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

const removeAccents = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

async function validateWordInDicio(word: string): Promise<boolean> {
  const maxRetries = 2;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Adiciona delay entre tentativas para evitar rate limiting
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Busca a palavra no Dicio
      const response = await fetch(`https://www.dicio.com.br/${word}/`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.ok) {
        const html = await response.text();
        // Verifica se a página contém conteúdo de definição (não é uma página de erro)
        const isValid = !html.includes('Palavra não encontrada') && 
                       !html.includes('404') && 
                       (html.includes('substantivo') || 
                       html.includes('adjetivo') || 
                       html.includes('verbo') ||
                       html.includes('advérbio') ||
                       html.includes('interjeição') ||
                       html.includes('preposição') ||
                       html.includes('conjunção') ||
                       html.includes('artigo') ||
                       html.includes('numeral') ||
                       html.includes('pronome'));
        
        console.log(`✅ Dicio validação sucesso para "${word}": ${isValid}`);
        return isValid;
      }
      
      attempt++;
      console.log(`⚠️ Tentativa ${attempt} falhou para "${word}"`);
    } catch (error) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ Erro na tentativa ${attempt} para "${word}":`, errorMessage);
      
      // Se é erro de CORS/network, tenta novamente ou rejeita a palavra
      if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch')) {
        console.log(`🔄 CORS/Network error - tentando novamente para: "${word}"`);
        continue; // Continua tentando em vez de assumir válida
      }
    }
  }

  // Após esgotar tentativas, rejeita a palavra para garantir qualidade
  console.log(`❌ Esgotou tentativas - rejeitando palavra: "${word}"`);
  return false;
}

async function fetchWordList(): Promise<{ withAccents: Set<string>, withoutAccents: Set<string>, sourceMap: Map<string, string> }> {
  const sourceMap = new Map<string, string>();
  const sourceStats = new Map<string, number>();

  for (const url of WORD_SOURCES) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const words = text.toLowerCase().split(/\s+/);
      let count = 0;
      let sampleWords: string[] = [];
      words.forEach(word => {
        if (!sourceMap.has(word)) {
          sourceMap.set(word, url);
          count++;
          if (sampleWords.length < 5) {
            sampleWords.push(word);
          }
        }
      });
      sourceStats.set(url, count);
      console.log(`Fonte ${url}: ${count} palavras únicas`);
      console.log(`Exemplos de ${url}:`, sampleWords);
    } catch (error) {
      console.error(`Erro ao buscar ${url}:`, error);
    }
  }

  const allWords = Array.from(sourceMap.keys());
  console.log('Total de palavras únicas:', allWords.length);

  const negativeResponse = await fetch(NEGATIVE_WORDS_SOURCE);
  const negativeText = await negativeResponse.text();
  const negativeWords = new Set(negativeText.toLowerCase().split(/\s+/));
  negativeWords.delete('peste');
  negativeWords.add('samão'); // Remove 'samão' da lista de palavras válidas

  const fiveLetterWords = new Set<string>();
  allWords.forEach(word => {
    const cleanWord = word.trim();
    // Apenas verificar se tem 5 caracteres, sem regex complexo
    if (cleanWord.length === 5 && /^[a-zà-úç]+$/.test(cleanWord)) {
      if (!negativeWords.has(removeAccents(cleanWord))) {
        fiveLetterWords.add(cleanWord);
      }
    }
  });

  console.log('Palavras de 5 letras após filtros:', fiveLetterWords.size);
  console.log('Exemplos de palavras de 5 letras:', Array.from(fiveLetterWords).slice(0, 20));
  
  // Debug adicional para entender o problema
  console.log('=== DEBUG FILTRAGEM ===');
  console.log('Total de palavras antes do filtro:', allWords.length);
  console.log('Primeiras 20 palavras antes do filtro:', allWords.slice(0, 20));
  console.log('Regex test para "amigo":', /^[a-zà-úç]+$/.test('amigo'));
  console.log('Regex test para "casa":', /^[a-zà-úç]+$/.test('casa'));
  console.log('Regex test para "festa":', /^[a-zà-úç]+$/.test('festa'));
  console.log('Tamanho do negativeWords:', negativeWords.size);
  console.log('Exemplos de negativeWords:', Array.from(negativeWords).slice(0, 10));
  console.log('========================');

  const withAccents = new Set(fiveLetterWords);
  const withoutAccents = new Set(Array.from(fiveLetterWords).map(removeAccents));
  
  // Debug adicional para o resultado final
  console.log('=== DEBUG RESULTADO FINAL ===');
  console.log('withAccents size:', withAccents.size);
  console.log('withoutAccents size:', withoutAccents.size);
  console.log('Exemplos de withoutAccents:', Array.from(withoutAccents).slice(0, 20));
  console.log('Teste "amigo" em withoutAccents:', withoutAccents.has('amigo'));
  console.log('Teste "casa" em withoutAccents:', withoutAccents.has('casa'));
  console.log('Teste "festa" em withoutAccents:', withoutAccents.has('festa'));
  console.log('=============================');

  return { withAccents, withoutAccents, sourceMap };
}

let wordCache: { withAccents: Set<string>, withoutAccents: Set<string>, sourceMap: Map<string, string> } | null = null;

export async function getWordData() {
  if (!wordCache) {
    wordCache = await fetchWordList();
  }
  return wordCache;
}

export async function getRandomWord(): Promise<{word: string, source: string}> {
  const { withAccents, sourceMap } = await getWordData();
  const list = Array.from(withAccents);
  
  // Usa timestamp atual como seed para garantir variedade
  const timestamp = Date.now();
  const seed = timestamp % 1000000; // Módulo para manter número gerenciável
  
  let validWord = false;
  let word = '';
  let source = '';
  let attempts = 0;
  const maxAttempts = 20;

  console.log('=== BUSCANDO PALAVRA VÁLIDA ===');
  console.log('Timestamp:', timestamp, 'Seed:', seed);
  
  while (!validWord && attempts < maxAttempts) {
    // Usa seed + attempts para gerar índice pseudo-aleatório
    const randomIndex = (seed + attempts * 7) % list.length;
    word = list[randomIndex];
    attempts++;
    
    console.log(`Tentativa ${attempts}: "${word}" (índice: ${randomIndex})`);
    
    // Valida a palavra no Dicio
    validWord = await validateWordInDicio(word);
    
    if (validWord) {
      console.log(`✅ Palavra válida encontrada: "${word}"`);
    } else {
      console.log(`❌ Palavra inválida: "${word}"`);
    }
  }

  if (!validWord) {
    console.log('⚠️ Não foi possível encontrar uma palavra válida após', maxAttempts, 'tentativas');
    // Lista de palavras garantidamente válidas em português como fallback
    const fallbackWords = [
      'amigo', 'canto', 'dente', 'festa', 'gente', 'hotel', 'idade', 'junto', 'livro', 'mundo',
      'noite', 'ontem', 'papel', 'quero', 'rosto', 'santo', 'tempo', 'verde', 'zebra', 'zumbi',
      'barro', 'carro', 'ferro', 'morro', 'torre', 'terra', 'guerra', 'serra', 'garra',
      'casa', 'mesa', 'rosa', 'pesa', 'lisa', 'fase', 'base', 'dose', 'pose', 'vida',
      'porta', 'força', 'morte', 'sonho', 'risco', 'pista', 'canto', 'vento', 'fogo', 'água'
    ];
    const fallbackIndex = seed % fallbackWords.length;
    word = fallbackWords[fallbackIndex];
    source = 'Fallback - Palavras Confiáveis';
    console.log(`🔄 Usando palavra de fallback: "${word}"`);
  } else {
    source = sourceMap.get(word) || 'Origem desconhecida';
  }
  
  console.log('=== PALAVRA FINAL ===');
  console.log('Fonte:', source);
  console.log('Timestamp:', timestamp);
  console.log('========================');
  
  return { word, source };
}
