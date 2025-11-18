import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execPromise = promisify(exec);

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  exitCode?: number;
  executionTime: number;
}

export class SandboxExecutor {
  private workspaceDir: string;
  private networkDisabled: boolean;

  constructor() {
    this.workspaceDir = process.env.WORKSPACE_DIR || './workspace';
    this.networkDisabled = process.env.SANDBOX_NETWORK_DISABLED === 'true';
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await fs.mkdir(this.workspaceDir, { recursive: true });
    console.log(`🐳 Sandbox Executor initialized: ${this.workspaceDir}`);
  }

  async executeCode(code: string, language: string, timeout: number = 30000): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      const tempDir = path.join(this.workspaceDir, `exec-${Date.now()}`);
      await fs.mkdir(tempDir, { recursive: true });

      let command: string;
      let filename: string;

      switch (language.toLowerCase()) {
        case 'javascript':
        case 'js':
          filename = 'script.js';
          await fs.writeFile(path.join(tempDir, filename), code);
          command = `docker run --rm -v "${tempDir}:/workspace" -w /workspace ${this.networkDisabled ? '--network=none' : ''} node:20-alpine node ${filename}`;
          break;

        case 'typescript':
        case 'ts':
          filename = 'script.ts';
          await fs.writeFile(path.join(tempDir, filename), code);
          command = `docker run --rm -v "${tempDir}:/workspace" -w /workspace ${this.networkDisabled ? '--network=none' : ''} node:20-alpine sh -c "npm install -g tsx && tsx ${filename}"`;
          break;

        case 'python':
        case 'py':
          filename = 'script.py';
          await fs.writeFile(path.join(tempDir, filename), code);
          command = `docker run --rm -v "${tempDir}:/workspace" -w /workspace ${this.networkDisabled ? '--network=none' : ''} python:3.11-alpine python ${filename}`;
          break;

        case 'go':
          filename = 'main.go';
          await fs.writeFile(path.join(tempDir, filename), code);
          command = `docker run --rm -v "${tempDir}:/workspace" -w /workspace ${this.networkDisabled ? '--network=none' : ''} golang:1.21-alpine go run ${filename}`;
          break;

        case 'rust':
        case 'rs':
          filename = 'main.rs';
          await fs.writeFile(path.join(tempDir, filename), code);
          command = `docker run --rm -v "${tempDir}:/workspace" -w /workspace ${this.networkDisabled ? '--network=none' : ''} rust:1.73-alpine sh -c "rustc ${filename} && ./main"`;
          break;

        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      const { stdout, stderr } = await execPromise(command, { timeout });

      await fs.rm(tempDir, { recursive: true, force: true });

      const executionTime = Date.now() - startTime;

      return {
        success: !stderr,
        output: stdout,
        error: stderr,
        exitCode: 0,
        executionTime
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        error: error.message || 'Execution failed',
        exitCode: error.code || 1,
        executionTime
      };
    }
  }

  async executeInContainer(
    containerName: string,
    command: string,
    files?: { [path: string]: string }
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      const tempDir = path.join(this.workspaceDir, `container-${Date.now()}`);
      await fs.mkdir(tempDir, { recursive: true });

      if (files) {
        for (const [filePath, content] of Object.entries(files)) {
          const fullPath = path.join(tempDir, filePath);
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, content);
        }
      }

      const dockerCommand = `docker run --rm -v "${tempDir}:/workspace" -w /workspace ${this.networkDisabled ? '--network=none' : ''} ${containerName} ${command}`;

      const { stdout, stderr } = await execPromise(dockerCommand, { timeout: 60000 });

      await fs.rm(tempDir, { recursive: true, force: true });

      const executionTime = Date.now() - startTime;

      return {
        success: !stderr,
        output: stdout,
        error: stderr,
        exitCode: 0,
        executionTime
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        error: error.message || 'Container execution failed',
        exitCode: error.code || 1,
        executionTime
      };
    }
  }

  async testCode(code: string, language: string, tests: string): Promise<ExecutionResult> {
    const testRunner = `
${code}

${tests}
    `.trim();

    return this.executeCode(testRunner, language);
  }
}
