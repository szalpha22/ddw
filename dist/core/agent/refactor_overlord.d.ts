import { BaseAgent, AgentTask, AgentResponse } from './base_agent';
export declare class RefactorOverlord extends BaseAgent {
    constructor();
    execute(task: AgentTask): Promise<AgentResponse>;
    private refactorCode;
    private modernize;
    private optimize;
    private cleanup;
    private handleGeneric;
}
//# sourceMappingURL=refactor_overlord.d.ts.map