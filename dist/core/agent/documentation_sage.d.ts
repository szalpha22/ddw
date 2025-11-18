import { BaseAgent, AgentTask, AgentResponse } from './base_agent';
export declare class DocumentationSage extends BaseAgent {
    constructor();
    execute(task: AgentTask): Promise<AgentResponse>;
    private generateReadme;
    private documentAPI;
    private createArchitectureDoc;
    private generateMigrationGuide;
    private handleGeneric;
}
//# sourceMappingURL=documentation_sage.d.ts.map