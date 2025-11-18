"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekClient = void 0;
const axios_1 = __importDefault(require("axios"));
class DeepSeekClient {
    client;
    endpoint;
    apiKey;
    model;
    constructor() {
        this.endpoint = process.env.DEEPSEEK_ENDPOINT || 'http://localhost:8000/v1/chat/completions';
        this.apiKey = process.env.DEEPSEEK_API_KEY || '';
        this.model = process.env.DEEPSEEK_MODEL || 'deepseek-coder';
        this.client = axios_1.default.create({
            baseURL: this.endpoint,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            timeout: 300000
        });
        console.log(`✅ DeepSeek Router initialized: ${this.endpoint}`);
    }
    async complete(messages, options = {}) {
        try {
            const request = {
                model: this.model,
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 4096,
                stream: false
            };
            console.log(`🤖 Sending request to DeepSeek: ${messages[messages.length - 1].content.substring(0, 100)}...`);
            const response = await this.client.post('', request);
            if (!response.data.choices || response.data.choices.length === 0) {
                throw new Error('No response from DeepSeek');
            }
            const content = response.data.choices[0].message.content;
            console.log(`✅ DeepSeek response received (${response.data.usage.total_tokens} tokens)`);
            return content;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('❌ DeepSeek API Error:', error.response?.data || error.message);
                throw new Error(`DeepSeek API Error: ${error.response?.data?.error?.message || error.message}`);
            }
            throw error;
        }
    }
    async streamComplete(messages, onChunk, options = {}) {
        try {
            const request = {
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
                response.data.on('data', (chunk) => {
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
                            }
                            catch (e) {
                            }
                        }
                    }
                });
                response.data.on('end', () => resolve());
                response.data.on('error', (error) => reject(error));
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`DeepSeek Stream Error: ${error.response?.data?.error?.message || error.message}`);
            }
            throw error;
        }
    }
    async generateCode(prompt, language, context) {
        const messages = [
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
    async analyzeCode(code, language, analysisType) {
        const messages = [
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
    async convertLanguage(code, sourceLanguage, targetLanguage) {
        const messages = [
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
exports.DeepSeekClient = DeepSeekClient;
//# sourceMappingURL=deepseek_client.js.map