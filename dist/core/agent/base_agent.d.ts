import { DeepSeekClient } from '../router/deepseek_client';
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
export declare abstract class BaseAgent {
    protected name: string;
    protected role: string;
    protected deepseek: DeepSeekClient;
    protected systemPrompt: string;
    constructor(name: string, role: string, systemPrompt: string);
    abstract execute(task: AgentTask): Promise<AgentResponse>;
    protected think(prompt: string, context?: string): Promise<string>;
    protected thinkStream(prompt: string, onChunk: (chunk: string) => void, context?: string): Promise<void>;
    getName(): string;
    getRole(): string;
}
//# sourceMappingURL=base_agent.d.ts.map