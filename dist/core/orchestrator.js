"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitanOrchestrator = void 0;
const agent_1 = require("./agent");
const perception_layer_1 = require("./cognitive/perception_layer");
class TitanOrchestrator {
    agents;
    perceptionLayer;
    constructor() {
        console.log('🚀 Initializing TITAN++ Orchestrator...');
        this.perceptionLayer = new perception_layer_1.PerceptionLayer();
        this.agents = new Map();
        this.agents.set('architect', new agent_1.ArchitectPrime());
        this.agents.set('engineer', new agent_1.MasterEngineer());
        this.agents.set('refactor', new agent_1.RefactorOverlord());
        this.agents.set('debugger', new agent_1.DebuggerSentinel());
        this.agents.set('fusion', new agent_1.FusionWarden());
        this.agents.set('checkpoint', new agent_1.CheckpointArbiter());
        this.agents.set('documentation', new agent_1.DocumentationSage());
        console.log('✅ All agents initialized');
    }
    async handleMessage(message, progressCallback) {
        try {
            const { type, payload } = message;
            console.log(`📬 Orchestrator handling: ${type}`);
            switch (type) {
                case 'analyze_project':
                    return await this.analyzeProject(payload, progressCallback);
                case 'generate_code':
                    return await this.generateCode(payload, progressCallback);
                case 'refactor_code':
                    return await this.refactorCode(payload, progressCallback);
                case 'debug_code':
                    return await this.debugCode(payload, progressCallback);
                case 'fuse_projects':
                    return await this.fuseProjects(payload, progressCallback);
                case 'create_checkpoint':
                    return await this.createCheckpoint(payload, progressCallback);
                case 'generate_documentation':
                    return await this.generateDocumentation(payload, progressCallback);
                default:
                    return await this.delegateToAgent(message, progressCallback);
            }
        }
        catch (error) {
            console.error('❌ Orchestrator error:', error);
            return {
                type: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async analyzeProject(payload, progressCallback) {
        progressCallback?.({ type: 'progress', message: 'Scanning project structure...' });
        const projectMap = await this.perceptionLayer.scanProject(payload.projectPath);
        progressCallback?.({ type: 'progress', message: 'Analyzing architecture...' });
        const architectTask = {
            id: 'analyze-' + Date.now(),
            type: 'review_structure',
            payload: { structure: projectMap }
        };
        const analysis = await this.agents.get('architect').execute(architectTask);
        return {
            type: 'analysis_complete',
            projectMap,
            architectureReview: analysis.result,
            timestamp: new Date().toISOString()
        };
    }
    async generateCode(payload, progressCallback) {
        progressCallback?.({ type: 'progress', message: 'Planning implementation...' });
        const architectTask = {
            id: 'design-' + Date.now(),
            type: 'design_architecture',
            payload: {
                requirements: payload.requirements,
                constraints: payload.constraints
            }
        };
        const design = await this.agents.get('architect').execute(architectTask);
        progressCallback?.({ type: 'progress', message: 'Generating code...' });
        const engineerTask = {
            id: 'generate-' + Date.now(),
            type: 'generate_code',
            payload: {
                specification: payload.requirements,
                language: payload.language || 'TypeScript',
                context: design.result?.architecture
            }
        };
        const code = await this.agents.get('engineer').execute(engineerTask);
        return {
            type: 'code_generated',
            design: design.result,
            code: code.result,
            timestamp: new Date().toISOString()
        };
    }
    async refactorCode(payload, progressCallback) {
        progressCallback?.({ type: 'progress', message: 'Analyzing code for refactoring...' });
        const refactorTask = {
            id: 'refactor-' + Date.now(),
            type: 'refactor_code',
            payload
        };
        const result = await this.agents.get('refactor').execute(refactorTask);
        progressCallback?.({ type: 'progress', message: 'Refactoring complete' });
        return {
            type: 'refactor_complete',
            result: result.result,
            timestamp: new Date().toISOString()
        };
    }
    async debugCode(payload, progressCallback) {
        progressCallback?.({ type: 'progress', message: 'Debugging code...' });
        const debugTask = {
            id: 'debug-' + Date.now(),
            type: 'debug',
            payload
        };
        const result = await this.agents.get('debugger').execute(debugTask);
        return {
            type: 'debug_complete',
            result: result.result,
            timestamp: new Date().toISOString()
        };
    }
    async fuseProjects(payload, progressCallback) {
        progressCallback?.({ type: 'progress', message: 'Planning fusion strategy...' });
        const strategyTask = {
            id: 'fusion-strategy-' + Date.now(),
            type: 'design_fusion',
            payload: {
                project1: payload.project1,
                project2: payload.project2,
                targetLanguage: payload.targetLanguage
            }
        };
        const strategy = await this.agents.get('architect').execute(strategyTask);
        progressCallback?.({ type: 'progress', message: 'Executing fusion...' });
        const fusionTask = {
            id: 'fusion-' + Date.now(),
            type: 'fuse_projects',
            payload: {
                ...payload,
                strategy: strategy.result
            }
        };
        const result = await this.agents.get('fusion').execute(fusionTask);
        return {
            type: 'fusion_complete',
            strategy: strategy.result,
            result: result.result,
            timestamp: new Date().toISOString()
        };
    }
    async createCheckpoint(payload, progressCallback) {
        progressCallback?.({ type: 'progress', message: 'Creating checkpoint...' });
        const checkpointTask = {
            id: 'checkpoint-' + Date.now(),
            type: 'create_checkpoint',
            payload
        };
        const result = await this.agents.get('checkpoint').execute(checkpointTask);
        return {
            type: 'checkpoint_created',
            result: result.result,
            timestamp: new Date().toISOString()
        };
    }
    async generateDocumentation(payload, progressCallback) {
        progressCallback?.({ type: 'progress', message: 'Generating documentation...' });
        const docTask = {
            id: 'doc-' + Date.now(),
            type: payload.docType || 'generate_readme',
            payload
        };
        const result = await this.agents.get('documentation').execute(docTask);
        return {
            type: 'documentation_generated',
            result: result.result,
            timestamp: new Date().toISOString()
        };
    }
    async delegateToAgent(message, progressCallback) {
        const { agent, task } = message;
        if (!this.agents.has(agent)) {
            throw new Error(`Unknown agent: ${agent}`);
        }
        progressCallback?.({ type: 'progress', message: `Delegating to ${agent}...` });
        const result = await this.agents.get(agent).execute(task);
        return {
            type: 'task_complete',
            agent,
            result: result.result,
            timestamp: new Date().toISOString()
        };
    }
    getAgents() {
        return Array.from(this.agents.keys());
    }
}
exports.TitanOrchestrator = TitanOrchestrator;
//# sourceMappingURL=orchestrator.js.map