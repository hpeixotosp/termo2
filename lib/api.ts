const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://143.110.196.243:3000';

export interface GuessResult {
  letter: string;
  status: 'correct' | 'present' | 'absent';
  position: number;
}

export interface ValidationResponse {
  isValid: boolean;
  error?: string;
  result?: GuessResult[];
  gameStatus?: 'continue' | 'won' | 'lost';
  isCorrect?: boolean;
}

export interface DailyWordResponse {
  word: string;
  timestamp: number;
}

export interface DictionaryStats {
  totalWords: number;
  lastUpdate: number;
  sources: number;
  examples: string[];
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Obter palavra do dia
  async getDailyWord(): Promise<DailyWordResponse> {
    return this.request<DailyWordResponse>('/api/daily-word');
  }

  // Validar tentativa
  async validateGuess(guess: string, solution: string): Promise<ValidationResponse> {
    return this.request<ValidationResponse>('/api/validate-guess', {
      method: 'POST',
      body: JSON.stringify({ guess, solution }),
    });
  }

  // Obter estatísticas do dicionário
  async getDictionaryStats(): Promise<DictionaryStats> {
    return this.request<DictionaryStats>('/api/dictionary-stats');
  }

  // Verificar saúde da API
  async healthCheck(): Promise<{ status: string; timestamp: string; wordCount: number }> {
    return this.request('/health');
  }
}

// Instância global da API
export const apiService = new ApiService(API_BASE_URL);

// Função para configurar a URL da API dinamicamente
export function setApiBaseUrl(url: string) {
  // Esta função pode ser usada para mudar a URL da API em runtime se necessário
  console.log(`API base URL changed to: ${url}`);
}

export default apiService;
