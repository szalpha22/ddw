export interface ExecutionResult {
    success: boolean;
    output?: string;
    error?: string;
    exitCode?: number;
    executionTime: number;
}
export declare class SandboxExecutor {
    private workspaceDir;
    private networkDisabled;
    constructor();
    private initialize;
    executeCode(code: string, language: string, timeout?: number): Promise<ExecutionResult>;
    executeInContainer(containerName: string, command: string, files?: {
        [path: string]: string;
    }): Promise<ExecutionResult>;
    testCode(code: string, language: string, tests: string): Promise<ExecutionResult>;
}
//# sourceMappingURL=executor.d.ts.map