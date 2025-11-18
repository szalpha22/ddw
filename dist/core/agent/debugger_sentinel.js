"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebuggerSentinel = void 0;
const base_agent_1 = require("./base_agent");
class DebuggerSentinel extends base_agent_1.BaseAgent {
    constructor() {
        super('Debugger Sentinel', 'Debugging and Testing Specialist', `You are the Debugger Sentinel, the guardian of code quality and correctness.
Your responsibilities:
- Debug code and find root causes of errors
- Write and execute tests
- Analyze error logs and stack traces
- Identify edge cases and failure points
- Validate code correctness
- Perform security analysis
- Auto-repair broken code

You are meticulous, thorough, and never miss a bug.
Always provide clear explanations and working fixes.`);
    }
    async execute(task) {
        try {
            console.log(`🐛 Debugger Sentinel executing: ${task.type}`);
            switch (task.type) {
                case 'debug':
                    return await this.debug(task);
                case 'analyze_error':
                    return await this.analyzeError(task);
                case 'generate_tests':
                    return await this.generateTests(task);
                case 'fix_code':
                    return await this.fixCode(task);
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
    async debug(task) {
        const { code, language, issue } = task.payload;
        const prompt = `Debug this ${language} code:

Issue: ${issue}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. Root cause analysis
2. Detailed explanation
3. Fixed code
4. Prevention strategies`;
        const result = await this.think(prompt);
        return {
            success: true,
            result: {
                diagnosis: result,
                agent: this.name
            }
        };
    }
    async analyzeError(task) {
        const { error, stackTrace, code } = task.payload;
        const prompt = `Analyze this error:

Error: ${error}

Stack trace:
${stackTrace}

Related code:
${code}

Provide:
1. Error explanation
2. Root cause
3. Step-by-step fix
4. Code correction`;
        const result = await this.think(prompt);
        return {
            success: true,
            result: {
                analysis: result,
                agent: this.name
            }
        };
    }
    async generateTests(task) {
        const { code, language, testFramework } = task.payload;
        const prompt = `Generate comprehensive tests for this ${language} code using ${testFramework}:

\`\`\`${language}
${code}
\`\`\`

Include:
1. Unit tests
2. Edge cases
3. Error scenarios
4. Integration tests (if applicable)
5. Test descriptions

Provide complete, runnable test code.`;
        const result = await this.think(prompt);
        return {
            success: true,
            result: {
                tests: result,
                agent: this.name
            }
        };
    }
    async fixCode(task) {
        const { code, language, errors } = task.payload;
        const prompt = `Fix all errors in this ${language} code:

Errors:
${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. Corrected code
2. Explanation of each fix
3. Validation notes`;
        const result = await this.think(prompt);
        return {
            success: true,
            result: {
                fixed: result,
                agent: this.name
            }
        };
    }
    async handleGeneric(task) {
        const result = await this.think(`Debug/test this: ${JSON.stringify(task.payload)}`);
        return {
            success: true,
            result: {
                debug: result,
                agent: this.name
            }
        };
    }
}
exports.DebuggerSentinel = DebuggerSentinel;
//# sourceMappingURL=debugger_sentinel.js.map