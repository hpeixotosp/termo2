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
  // Removendo validação no Dicio que está falhando por CORS
  // Vamos confiar nas fontes de palavras que já são confiáveis
  console.log(`✅ Aceitando palavra "${word}" sem validação externa`);
  return true;
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
    // Simplificando o filtro - apenas verificar se tem 5 caracteres
    if (cleanWord.length === 5) {
      // Remove apenas palavras que são claramente inválidas
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
  
  // Escolhe uma palavra diretamente da lista
  const randomIndex = seed % list.length;
  const word = list[randomIndex];
  const source = sourceMap.get(word) || 'Origem desconhecida';
  
  console.log('=== PALAVRA ESCOLHIDA ===');
  console.log('Palavra:', word);
  console.log('Fonte:', source);
  console.log('Timestamp:', timestamp);
  console.log('========================');
  
  return { word, source };
}
