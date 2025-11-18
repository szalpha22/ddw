import { BaseAgent, AgentTask, AgentResponse } from './base_agent';
export declare class MasterEngineer extends BaseAgent {
    constructor();
    execute(task: AgentTask): Promise<AgentResponse>;
    private generateCode;
    private implementFeature;
    private createModule;
    private buildAPI;
    private handleGeneric;
}
//# sourceMappingURL=master_engineer.d.ts.map