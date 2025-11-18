import { DeepSeekClient, DeepSeekMessage } from '../router/deepseek_client';

export interface AgentTask {
  id: string;
  type: string;
  payload: any;
  context?: any;
}

export interface AgentResponse {
  success: boolean;
  result?: any;
  error?: string;
  metadata?: any;
}

export abstract class BaseAgent {
  protected name: string;
  protected role: string;
  protected deepseek: DeepSeekClient;
  protected systemPrompt: string;

  constructor(name: string, role: string, systemPrompt: string) {
    this.name = name;
    this.role = role;
    this.systemPrompt = systemPrompt;
    this.deepseek = new DeepSeekClient();
    console.log(`🤖 Agent ${name} initialized`);
  }

  abstract execute(task: AgentTask): Promise<AgentResponse>;

  protected async think(prompt: string, context?: string): Promise<string> {
    const messages: DeepSeekMessage[] = [
      { role: 'system', content: this.systemPrompt }
    ];

    if (context) {
      messages.push({ role: 'user', content: `Context:\n${context}` });
    }

    messages.push({ role: 'user', content: prompt });

    return this.deepseek.complete(messages);
  }

  protected async thinkStream(
    prompt: string,
    onChunk: (chunk: string) => void,
    context?: string
  ): Promise<void> {
    const messages: DeepSeekMessage[] = [
      { role: 'system', content: this.systemPrompt }
    ];

    if (context) {
      messages.push({ role: 'user', content: `Context:\n${context}` });
    }

    messages.push({ role: 'user', content: prompt });

    await this.deepseek.streamComplete(messages, onChunk);
  }

  getName(): string {
    return this.name;
  }

  getRole(): string {
    return this.role;
  }
}
