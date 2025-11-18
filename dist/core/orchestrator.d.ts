export declare class TitanOrchestrator {
    private agents;
    private perceptionLayer;
    constructor();
    handleMessage(message: any, progressCallback?: (update: any) => void): Promise<any>;
    private analyzeProject;
    private generateCode;
    private refactorCode;
    private debugCode;
    private fuseProjects;
    private createCheckpoint;
    private generateDocumentation;
    private delegateToAgent;
    getAgents(): string[];
}
//# sourceMappingURL=orchestrator.d.ts.map