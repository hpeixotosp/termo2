import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { word } = await request.json();
    
    if (!word) {
      return NextResponse.json({ error: 'Palavra não fornecida' }, { status: 400 });
    }

    // Busca a palavra no Dicio
    const response = await fetch(`https://www.dicio.com.br/${encodeURIComponent(word)}/`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (response.ok) {
      const html = await response.text();
      
      // Verifica se a página contém conteúdo de definição (não é uma página de erro)
      const isValid = !html.includes('Palavra não encontrada') && 
                     !html.includes('404') && 
                     !html.includes('Página não encontrada') &&
                     (html.includes('substantivo') || 
                     html.includes('adjetivo') || 
                     html.includes('verbo') ||
                     html.includes('advérbio') ||
                     html.includes('interjeição') ||
                     html.includes('preposição') ||
                     html.includes('conjunção') ||
                     html.includes('artigo') ||
                     html.includes('numeral') ||
                     html.includes('pronome') ||
                     html.includes('definição') ||
                     html.includes('significado'));
      
      return NextResponse.json({ 
        word, 
        isValid, 
        url: `https://www.dicio.com.br/${word}/` 
      });
    } else {
      return NextResponse.json({ 
        word, 
        isValid: false, 
        error: 'Página não encontrada',
        status: response.status 
      });
    }
  } catch (error) {
    console.error('Erro ao validar palavra:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
