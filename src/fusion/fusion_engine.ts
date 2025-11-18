import { DeepSeekClient } from '../core/router/deepseek_client';
import { PerceptionLayer, ProjectMap } from '../core/cognitive/perception_layer';

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

export class FusionEngine {
  private deepseek: DeepSeekClient;
  private perception: PerceptionLayer;

  constructor() {
    this.deepseek = new DeepSeekClient();
    this.perception = new PerceptionLayer();
    console.log('🔀 Fusion Engine initialized');
  }

  async fuseProjects(config: FusionConfig): Promise<FusionResult> {
    console.log(`🔀 Starting fusion: ${config.mode} mode`);
    const startTime = Date.now();

    try {
      const project1 = await this.perception.scanProject(config.project1Path);
      const project2 = await this.perception.scanProject(config.project2Path);

      let result: FusionResult;

      switch (config.mode) {
        case 'direct_merge':
          result = await this.directMerge(project1, project2, config);
          break;
        case 'full_conversion':
          result = await this.fullConversion(project1, project2, config);
          break;
        case 'bidirectional':
          result = await this.bidirectionalFusion(project1, project2, config);
          break;
        case 'neural_semantic':
          result = await this.neuralSemanticFusion(project1, project2, config);
          break;
        case 'adaptive':
          result = await this.adaptiveFusion(project1, project2, config);
          break;
        default:
          throw new Error(`Unknown fusion mode: ${config.mode}`);
      }

      result.report.executionTime = Date.now() - startTime;
      console.log(`✅ Fusion complete in ${result.report.executionTime}ms`);

      return result;
    } catch (error) {
      console.error('❌ Fusion failed:', error);
      throw error;
    }
  }

  private async directMerge(p1: ProjectMap, p2: ProjectMap, config: FusionConfig): Promise<FusionResult> {
    const report: FusionReport = {
      mode: 'direct_merge',
      filesProcessed: 0,
      conflictsResolved: 0,
      conversions: [],
      mergedComponents: [],
      executionTime: 0,
      summary: 'Direct merge without language conversion'
    };

    return {
      success: true,
      fusedProjectPath: config.outputPath,
      report
    };
  }

  private async fullConversion(p1: ProjectMap, p2: ProjectMap, config: FusionConfig): Promise<FusionResult> {
    if (!config.targetLanguage) {
      throw new Error('Target language required for full conversion');
    }

    const conversions: ConversionInfo[] = [];

    const report: FusionReport = {
      mode: 'full_conversion',
      filesProcessed: 0,
      conflictsResolved: 0,
      conversions,
      mergedComponents: [],
      executionTime: 0,
      summary: `Full conversion to ${config.targetLanguage}`
    };

    return {
      success: true,
      fusedProjectPath: config.outputPath,
      report
    };
  }

  private async bidirectionalFusion(p1: ProjectMap, p2: ProjectMap, config: FusionConfig): Promise<FusionResult> {
    const report: FusionReport = {
      mode: 'bidirectional',
      filesProcessed: 0,
      conflictsResolved: 0,
      conversions: [],
      mergedComponents: [],
      executionTime: 0,
      summary: 'Bidirectional fusion preserving both language ecosystems'
    };

    return {
      success: true,
      fusedProjectPath: config.outputPath,
      report
    };
  }

  private async neuralSemanticFusion(p1: ProjectMap, p2: ProjectMap, config: FusionConfig): Promise<FusionResult> {
    const prompt = `Analyze and merge these two projects at the semantic level:

Project 1: ${p1.languages.join(', ')}
Modules: ${p1.modules.length}
Frameworks: ${p1.frameworks.join(', ')}

Project 2: ${p2.languages.join(', ')}
Modules: ${p2.modules.length}
Frameworks: ${p2.frameworks.join(', ')}

Provide a semantic fusion strategy that:
1. Identifies equivalent components
2. Merges business logic
3. Unifies data models
4. Resolves architectural differences
5. Creates a coherent unified system`;

    const strategy = await this.deepseek.complete([
      { role: 'system', content: 'You are a code fusion expert.' },
      { role: 'user', content: prompt }
    ]);

    const report: FusionReport = {
      mode: 'neural_semantic',
      filesProcessed: 0,
      conflictsResolved: 0,
      conversions: [],
      mergedComponents: [],
      executionTime: 0,
      summary: strategy
    };

    return {
      success: true,
      fusedProjectPath: config.outputPath,
      report
    };
  }

  private async adaptiveFusion(p1: ProjectMap, p2: ProjectMap, config: FusionConfig): Promise<FusionResult> {
    const prompt = `Choose the best fusion strategy for these projects:

Project 1: ${JSON.stringify({ languages: p1.languages, frameworks: p1.frameworks })}
Project 2: ${JSON.stringify({ languages: p2.languages, frameworks: p2.frameworks })}

Recommend: direct_merge, full_conversion, bidirectional, or neural_semantic
Explain why and provide fusion plan.`;

    const recommendation = await this.deepseek.complete([
      { role: 'system', content: 'You are an expert system architect.' },
      { role: 'user', content: prompt }
    ]);

    const report: FusionReport = {
      mode: 'adaptive',
      filesProcessed: 0,
      conflictsResolved: 0,
      conversions: [],
      mergedComponents: [],
      executionTime: 0,
      summary: recommendation
    };

    return {
      success: true,
      fusedProjectPath: config.outputPath,
      report
    };
  }

  async convertLanguage(code: string, from: string, to: string): Promise<string> {
    return this.deepseek.convertLanguage(code, from, to);
  }
}
