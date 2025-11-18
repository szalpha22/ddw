import { BaseAgent, AgentTask, AgentResponse } from './base_agent';
export declare class FusionWarden extends BaseAgent {
    constructor();
    execute(task: AgentTask): Promise<AgentResponse>;
    private fuseProjects;
    private convertLanguage;
    private mergeAPIs;
    private unifyArchitecture;
    private handleGeneric;
}
//# sourceMappingURL=fusion_warden.d.ts.map