import axios, { AxiosInstance } from 'axios';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class DeepSeekClient {
  private client: AxiosInstance;
  private endpoint: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.endpoint = process.env.DEEPSEEK_ENDPOINT || 'http://localhost:8000/v1/chat/completions';
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek-coder';

    this.client = axios.create({
      baseURL: this.endpoint,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      timeout: 300000
    });

    console.log(`✅ DeepSeek Router initialized: ${this.endpoint}`);
  }

  async complete(
    messages: DeepSeekMessage[],
    options: {
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const request: DeepSeekRequest = {
        model: this.model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 4096,
        stream: false
      };

      console.log(`🤖 Sending request to DeepSeek: ${messages[messages.length - 1].content.substring(0, 100)}...`);

      const response = await this.client.post<DeepSeekResponse>('', request);

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No response from DeepSeek');
      }

      const content = response.data.choices[0].message.content;
      console.log(`✅ DeepSeek response received (${response.data.usage.total_tokens} tokens)`);

      return content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ DeepSeek API Error:', error.response?.data || error.message);
        throw new Error(`DeepSeek API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  async streamComplete(
    messages: DeepSeekMessage[],
    onChunk: (chunk: string) => void,
    options: {
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<void> {
    try {
      const request: DeepSeekRequest = {
        model: this.model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 4096,
        stream: true
      };

      const response = await this.client.post('', request, {
        responseType: 'stream'
      });

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                resolve();
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0]?.delta?.content) {
                  onChunk(parsed.choices[0].delta.content);
                }
              } catch (e) {
              }
            }
          }
        });

        response.data.on('end', () => resolve());
        response.data.on('error', (error: Error) => reject(error));
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`DeepSeek Stream Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  async generateCode(
    prompt: string,
    language: string,
    context?: string
  ): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `You are an expert ${language} developer. Generate high-quality, production-ready code based on the requirements. Only output code, no explanations unless requested.`
      }
    ];

    if (context) {
      messages.push({
        role: 'user',
        content: `Context:\n${context}`
      });
    }

    messages.push({
      role: 'user',
      content: prompt
    });

    return this.complete(messages);
  }

  async analyzeCode(
    code: string,
    language: string,
    analysisType: 'bugs' | 'performance' | 'security' | 'refactor'
  ): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `You are an expert code analyzer. Analyze ${language} code for ${analysisType} issues and provide detailed insights.`
      },
      {
        role: 'user',
        content: `Analyze this code:\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.complete(messages);
  }

  async convertLanguage(
    code: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `You are an expert in converting code between programming languages. Convert ${sourceLanguage} code to ${targetLanguage} while preserving logic and functionality. Output only the converted code.`
      },
      {
        role: 'user',
        content: `Convert this ${sourceLanguage} code to ${targetLanguage}:\n\`\`\`${sourceLanguage}\n${code}\n\`\`\``
      }
    ];

    return this.complete(messages);
  }
}
