export type FusionMode = 'direct_merge' | 'full_conversion' | 'bidirectional' | 'neural_semantic' | 'adaptive';
export interface FusionConfig {
    project1Path: string;
    project2Path: string;
    targetLanguage?: string;
    mode: FusionMode;
    outputPath: string;
}
export interface FusionResult {
    success: boolean;
    fusedProjectPath: string;
    report: FusionReport;
    errors?: string[];
}
export interface FusionReport {
    mode: FusionMode;
    filesProcessed: number;
    conflictsResolved: number;
    conversions: ConversionInfo[];
    mergedComponents: string[];
    executionTime: number;
    summary: string;
}
export interface ConversionInfo {
    from: string;
    to: string;
    sourceLanguage: string;
    targetLanguage: string;
    success: boolean;
}
export declare class FusionEngine {
    private deepseek;
    private perception;
    constructor();
    fuseProjects(config: FusionConfig): Promise<FusionResult>;
    private directMerge;
    private fullConversion;
    private bidirectionalFusion;
    private neuralSemanticFusion;
    private adaptiveFusion;
    convertLanguage(code: string, from: string, to: string): Promise<string>;
}
//# sourceMappingURL=fusion_engine.d.ts.map