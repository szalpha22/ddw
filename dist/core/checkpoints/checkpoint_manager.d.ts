export interface Checkpoint {
    id: string;
    timestamp: Date;
    message: string;
    semanticSummary?: string;
    versionHash: string;
    changes: FileChange[];
    reverseDiff: string;
    metadata: any;
    dependencyState?: any;
    testResults?: any;
}
export interface FileChange {
    path: string;
    type: 'added' | 'modified' | 'deleted';
    diff: string;
    before?: string;
    after?: string;
}
export declare class CheckpointManager {
    private checkpointDir;
    private checkpointsFile;
    constructor();
    private initialize;
    createCheckpoint(workspacePath: string, message: string, metadata?: any): Promise<Checkpoint>;
    private scanChanges;
    private generateHash;
    private generateReverseDiff;
    private saveCheckpoint;
    restoreCheckpoint(checkpointId: string, targetPath: string): Promise<boolean>;
    listCheckpoints(workspacePath?: string, limit?: number): Promise<Checkpoint[]>;
    compareCheckpoints(id1: string, id2: string): Promise<any>;
    updateCheckpoint(id: string, updates: Partial<Checkpoint>): Promise<void>;
    private loadAllCheckpoints;
    private loadCheckpoint;
}
//# sourceMappingURL=checkpoint_manager.d.ts.map