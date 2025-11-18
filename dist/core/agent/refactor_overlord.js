"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefactorOverlord = void 0;
const base_agent_1 = require("./base_agent");
class RefactorOverlord extends base_agent_1.BaseAgent {
    constructor() {
        super('Refactor Overlord', 'Code Refactoring Specialist', `You are the Refactor Overlord, the master of code transformation and optimization.
Your responsibilities:
- Perform deep code refactoring
- Modernize legacy code
- Optimize algorithms and performance
- Clean up code smells and anti-patterns
- Unify coding styles and patterns
- Improve code maintainability
- Apply design patterns where appropriate

You transform messy code into clean, efficient, maintainable masterpieces.
Always preserve functionality while improving code quality.`);
    }
    async execute(task) {
        try {
            console.log(`🔧 Refactor Overlord executing: ${task.type}`);
            switch (task.type) {
                case 'refactor_code':
                    return await this.refactorCode(task);
                case 'modernize':
                    return await this.modernize(task);
                case 'optimize':
                    return await this.optimize(task);
                case 'cleanup':
                    return await this.cleanup(task);
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
    async refactorCode(task) {
        const { code, language, goals } = task.payload;
        const prompt = `Refactor this ${language} code to achieve these goals: ${goals}

Original code:
\`\`\`${language}
${code}
\`\`\`

Refactoring goals:
- ${goals.split(',').join('\n- ')}

Provide:
1. Refactored code
2. List of changes made
3. Improvement rationale`;
        const result = await this.think(prompt);
        return {
            success: true,
            result: {
                refactored: result,
                agent: this.name
            }
        };
    }
    async modernize(task) {
        const { code, language, currentVersion, targetVersion } = task.payload;
        const prompt = `Modernize this ${language} code from ${currentVersion} to ${targetVersion}:

\`\`\`${language}
${code}
\`\`\`

Update to:
- Latest syntax features
- Modern best practices
- Improved patterns
- Better performance
- Enhanced type safety

Provide the modernized code with explanations.`;
        const result = await this.think(prompt);
        return {
            success: true,
            result: {
                modernized: result,
                agent: this.name
            }
        };
    }
    async optimize(task) {
        const { code, language, optimizationType } = task.payload;
        const prompt = `Optimize this ${language} code for ${optimizationType}:

\`\`\`${language}
${code}
\`\`\`

Focus on:
- Performance improvements
- Memory efficiency
- Algorithm optimization
- Resource usage

Provide optimized code with performance analysis.`;
        const result = await this.think(prompt);
        return {
            success: true,
            result: {
                optimized: result,
                agent: this.name
            }
        };
    }
    async cleanup(task) {
        const { code, language } = task.payload;
        const prompt = `Clean up this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Remove:
- Code smells
- Duplicate code
- Dead code
- Unnecessary complexity
- Poor naming

Improve:
- Readability
- Maintainability
- Consistency

Provide cleaned code.`;
        const result = await this.think(prompt);
        return {
            success: true,
            result: {
                cleaned: result,
                agent: this.name
            }
        };
    }
    async handleGeneric(task) {
        const result = await this.think(`Refactor this: ${JSON.stringify(task.payload)}`);
        return {
            success: true,
            result: {
                refactored: result,
                agent: this.name
            }
        };
    }
}
exports.RefactorOverlord = RefactorOverlord;
//# sourceMappingURL=refactor_overlord.js.map