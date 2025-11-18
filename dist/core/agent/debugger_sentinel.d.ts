import { BaseAgent, AgentTask, AgentResponse } from './base_agent';
export declare class DebuggerSentinel extends BaseAgent {
    constructor();
    execute(task: AgentTask): Promise<AgentResponse>;
    private debug;
    private analyzeError;
    private generateTests;
    private fixCode;
    private handleGeneric;
}
//# sourceMappingURL=debugger_sentinel.d.ts.map