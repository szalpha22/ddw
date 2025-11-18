import { BaseAgent, AgentTask, AgentResponse } from './base_agent';
export declare class CheckpointArbiter extends BaseAgent {
    private checkpointManager;
    constructor();
    execute(task: AgentTask): Promise<AgentResponse>;
    private createCheckpoint;
    private restoreCheckpoint;
    private listCheckpoints;
    private compareCheckpoints;
    private analyzeChanges;
    private handleGeneric;
}
//# sourceMappingURL=checkpoint_arbiter.d.ts.map