export interface ProjectMap {
    root: string;
    languages: string[];
    frameworks: string[];
    modules: ModuleInfo[];
    dependencies: DependencyInfo;
    structure: FileNode;
    relationships: Relationship[];
}
export interface ModuleInfo {
    name: string;
    path: string;
    language: string;
    exports: string[];
    imports: string[];
    types: string[];
}
export interface DependencyInfo {
    [key: string]: {
        version: string;
        type: 'production' | 'development';
    };
}
export interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    language?: string;
    size?: number;
}
export interface Relationship {
    from: string;
    to: string;
    type: 'imports' | 'extends' | 'implements' | 'calls' | 'references';
}
export declare class PerceptionLayer {
    scanProject(projectPath: string): Promise<ProjectMap>;
    private buildFileTree;
    private detectFileLanguage;
    private detectLanguages;
    private detectFrameworks;
    private extractDependencies;
    private analyzeModules;
    private analyzeJSModules;
    private extractImports;
    private extractExports;
    private mapRelationships;
}
//# sourceMappingURL=perception_layer.d.ts.map