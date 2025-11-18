"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterEngineer = void 0;
const base_agent_1 = require("./base_agent");
class MasterEngineer extends base_agent_1.BaseAgent {
    constructor() {
        super('Master Engineer', 'Senior Code Engineer', `You are the Master Engineer, responsible for implementing all code in TITAN++.
Your responsibilities:
- Write high-quality, production-ready code
- Implement features and systems
- Create new modules and components
- Build APIs and services
- Implement algorithms and data structures
- Follow best practices and design patterns
- Write clean, maintainable, well-documented code

You are an expert in all programming languages and frameworks.
Generate complete, working code that follows industry best practices.`);
    }
    async execute(task) {
        try {
            console.log(`⚙️ Master Engineer executing: ${task.type}`);
            switch (task.type) {
                case 'generate_code':
                    return await this.generateCode(task);
                case 'implement_feature':
                    return await this.implementFeature(task);
                case 'create_module':
                    return await this.createModule(task);
                case 'build_api':
                    return await this.buildAPI(task);
                default:
                    return await this.handleGeneric(task);
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async generateCode(task) {
        const { specification, language, context } = task.payload;
        const prompt = `Generate ${language} code based on this specification:

${specification}

Requirements:
- Production-ready quality
- Full error handling
- Type safety (if applicable)
- Comments for complex logic
- Follow ${language} best practices

Output only the code, properly formatted.`;
        const code = await this.think(prompt, context);
        return {
            success: true,
            result: {
                code,
                language,
                agent: this.name
            }
        };
    }
    async implementFeature(task) {
        const { featureDescription, existingCode, language } = task.payload;
        const prompt = `Implement this feature:

${featureDescription}

Existing code context:
\`\`\`${language}
${existingCode}
\`\`\`

Provide the complete implementation with all necessary changes.`;
        const implementation = await this.think(prompt);
        return {
            success: true,
            result: {
                implementation,
                agent: this.name
            }
        };
    }
    async createModule(task) {
        const { moduleName, purpose, language, dependencies } = task.payload;
        const prompt = `Create a complete module named "${moduleName}" in ${language}.

Purpose: ${purpose}
Dependencies: ${dependencies?.join(', ') || 'None'}

Include:
1. Main module code
2. Type definitions (if applicable)
3. Tests
4. Documentation
5. Export statements

Provide complete, production-ready code.`;
        const module = await this.think(prompt);
        return {
            success: true,
            result: {
                module,
                moduleName,
                agent: this.name
            }
        };
    }
    async buildAPI(task) {
        const { endpoints, framework, database } = task.payload;
        const prompt = `Build an API with these endpoints:

${JSON.stringify(endpoints, null, 2)}

Framework: ${framework}
Database: ${database || 'None'}

Include:
1. Route definitions
2. Controllers
3. Validation
4. Error handling
5. Middleware (if needed)

Provide complete, working API code.`;
        const api = await this.think(prompt);
        return {
            success: true,
            result: {
                api,
                agent: this.name
            }
        };
    }
    async handleGeneric(task) {
        const result = await this.think(`Implement this: ${JSON.stringify(task.payload)}`);
        return {
            success: true,
            result: {
                code: result,
                agent: this.name
            }
        };
    }
}
exports.MasterEngineer = MasterEngineer;
//# sourceMappingURL=master_engineer.js.map