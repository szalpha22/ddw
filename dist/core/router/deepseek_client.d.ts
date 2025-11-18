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
export declare class DeepSeekClient {
    private client;
    private endpoint;
    private apiKey;
    private model;
    constructor();
    complete(messages: DeepSeekMessage[], options?: {
        temperature?: number;
        max_tokens?: number;
        stream?: boolean;
    }): Promise<string>;
    streamComplete(messages: DeepSeekMessage[], onChunk: (chunk: string) => void, options?: {
        temperature?: number;
        max_tokens?: number;
    }): Promise<void>;
    generateCode(prompt: string, language: string, context?: string): Promise<string>;
    analyzeCode(code: string, language: string, analysisType: 'bugs' | 'performance' | 'security' | 'refactor'): Promise<string>;
    convertLanguage(code: string, sourceLanguage: string, targetLanguage: string): Promise<string>;
}
//# sourceMappingURL=deepseek_client.d.ts.map