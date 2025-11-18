"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxExecutor = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const execPromise = (0, util_1.promisify)(child_process_1.exec);
class SandboxExecutor {
    workspaceDir;
    networkDisabled;
    constructor() {
        this.workspaceDir = process.env.WORKSPACE_DIR || './workspace';
        this.networkDisabled = process.env.SANDBOX_NETWORK_DISABLED === 'true';
        this.initialize();
    }
    async initialize() {
        await promises_1.default.mkdir(this.workspaceDir, { recursive: true });
        console.log(`🐳 Sandbox Executor initialized: ${this.workspaceDir}`);
    }
    async executeCode(code, language, timeout = 30000) {
        const startTime = Date.now();
        try {
            const tempDir = path_1.default.join(this.workspaceDir, `exec-${Date.now()}`);
            await promises_1.default.mkdir(tempDir, { recursive: true });
            let command;
            let filename;
            switch (language.toLowerCase()) {
                case 'javascript':
                case 'js':
                    filename = 'script.js';
                    await promises_1.default.writeFile(path_1.default.join(tempDir, filename), code);
                    command = `docker run --rm -v "${tempDir}:/workspace" -w /workspace ${this.networkDisabled ? '--network=none' : ''} node:20-alpine node ${filename}`;
                    break;
                case 'typescript':
                case 'ts':
                    filename = 'script.ts';
                    await promises_1.default.writeFile(path_1.default.join(tempDir, filename), code);
                    command = `docker run --rm -v "${tempDir}:/workspace" -w /workspace ${this.networkDisabled ? '--network=none' : ''} node:20-alpine sh -c "npm install -g tsx && tsx ${filename}"`;
                    break;
                case 'python':
                case 'py':
                    filename = 'script.py';
                    await promises_1.default.writeFile(path_1.default.join(tempDir, filename), code);
                    command = `docker run --rm -v "${tempDir}:/workspace" -w /workspace ${this.networkDisabled ? '--network=none' : ''} python:3.11-alpine python ${filename}`;
                    break;
                case 'go':
                    filename = 'main.go';
                    await promises_1.default.writeFile(path_1.default.join(tempDir, filename), code);
                    command = `docker run --rm -v "${tempDir}:/workspace" -w /workspace ${this.networkDisabled ? '--network=none' : ''} golang:1.21-alpine go run ${filename}`;
                    break;
                case 'rust':
                case 'rs':
                    filename = 'main.rs';
                    await promises_1.default.writeFile(path_1.default.join(tempDir, filename), code);
                    command = `docker run --rm -v "${tempDir}:/workspace" -w /workspace ${this.networkDisabled ? '--network=none' : ''} rust:1.73-alpine sh -c "rustc ${filename} && ./main"`;
                    break;
                default:
                    throw new Error(`Unsupported language: ${language}`);
            }
            const { stdout, stderr } = await execPromise(command, { timeout });
            await promises_1.default.rm(tempDir, { recursive: true, force: true });
            const executionTime = Date.now() - startTime;
            return {
                success: !stderr,
                output: stdout,
                error: stderr,
                exitCode: 0,
                executionTime
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                error: error.message || 'Execution failed',
                exitCode: error.code || 1,
                executionTime
            };
        }
    }
    async executeInContainer(containerName, command, files) {
        const startTime = Date.now();
        try {
            const tempDir = path_1.default.join(this.workspaceDir, `container-${Date.now()}`);
            await promises_1.default.mkdir(tempDir, { recursive: true });
            if (files) {
                for (const [filePath, content] of Object.entries(files)) {
                    const fullPath = path_1.default.join(tempDir, filePath);
                    await promises_1.default.mkdir(path_1.default.dirname(fullPath), { recursive: true });
                    await promises_1.default.writeFile(fullPath, content);
                }
            }
            const dockerCommand = `docker run --rm -v "${tempDir}:/workspace" -w /workspace ${this.networkDisabled ? '--network=none' : ''} ${containerName} ${command}`;
            const { stdout, stderr } = await execPromise(dockerCommand, { timeout: 60000 });
            await promises_1.default.rm(tempDir, { recursive: true, force: true });
            const executionTime = Date.now() - startTime;
            return {
                success: !stderr,
                output: stdout,
                error: stderr,
                exitCode: 0,
                executionTime
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                error: error.message || 'Container execution failed',
                exitCode: error.code || 1,
                executionTime
            };
        }
    }
    async testCode(code, language, tests) {
        const testRunner = `
${code}

${tests}
    `.trim();
        return this.executeCode(testRunner, language);
    }
}
exports.SandboxExecutor = SandboxExecutor;
//# sourceMappingURL=executor.js.map