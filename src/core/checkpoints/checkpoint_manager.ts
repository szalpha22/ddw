import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createPatch } from 'diff';
import * as diff from 'diff';

export interface Checkpoint {
  id: string;
  timestamp: Date;
  message: string;
  semanticSummary?: string;
  versionHash: string;
  changes: FileChange[];
  reverseDiff: string;
  metadata: any;
  dependencyState?: any;
  testResults?: any;
}

export interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  diff: string;
  before?: string;
  after?: string;
}

export class CheckpointManager {
  private checkpointDir: string;
  private checkpointsFile: string;

  constructor() {
    this.checkpointDir = process.env.CHECKPOINT_DIR || './checkpoints';
    this.checkpointsFile = path.join(this.checkpointDir, 'checkpoints.json');
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.checkpointDir, { recursive: true });
      try {
        await fs.access(this.checkpointsFile);
      } catch {
        await fs.writeFile(this.checkpointsFile, JSON.stringify([], null, 2));
      }
    } catch (error) {
      console.error('Failed to initialize checkpoint system:', error);
    }
  }

  async createCheckpoint(
    workspacePath: string,
    message: string,
    metadata?: any
  ): Promise<Checkpoint> {
    const id = uuidv4();
    const timestamp = new Date();
    const changes = await this.scanChanges(workspacePath);
    const versionHash = this.generateHash(changes);
    const reverseDiff = this.generateReverseDiff(changes);

    const checkpoint: Checkpoint = {
      id,
      timestamp,
      message,
      versionHash,
      changes,
      reverseDiff,
      metadata: metadata || {}
    };

    await this.saveCheckpoint(checkpoint, workspacePath);

    console.log(`✅ Checkpoint created: ${id} - ${message}`);

    return checkpoint;
  }

  private async scanChanges(workspacePath: string): Promise<FileChange[]> {
    const changes: FileChange[] = [];

    const scanDir = async (dir: string, baseDir: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(baseDir, fullPath);

          if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            continue;
          }

          if (entry.isDirectory()) {
            await scanDir(fullPath, baseDir);
          } else {
            const content = await fs.readFile(fullPath, 'utf-8');
            changes.push({
              path: relativePath,
              type: 'modified',
              diff: '',
              after: content
            });
          }
        }
      } catch (error) {
      }
    };

    await scanDir(workspacePath, workspacePath);
    return changes;
  }

  private generateHash(changes: FileChange[]): string {
    const content = JSON.stringify(changes.map(c => ({
      path: c.path,
      type: c.type,
      content: c.after
    })));

    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private generateReverseDiff(changes: FileChange[]): string {
    return changes.map(change => {
      if (change.type === 'added') {
        return `DELETE ${change.path}`;
      } else if (change.type === 'deleted') {
        return `RESTORE ${change.path}\n${change.before}`;
      } else {
        return `REVERT ${change.path}\n${change.before}`;
      }
    }).join('\n---\n');
  }

  private async saveCheckpoint(checkpoint: Checkpoint, workspacePath: string): Promise<void> {
    const checkpointPath = path.join(this.checkpointDir, checkpoint.id);
    await fs.mkdir(checkpointPath, { recursive: true });

    for (const change of checkpoint.changes) {
      const filePath = path.join(checkpointPath, change.path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      if (change.after) {
        await fs.writeFile(filePath, change.after);
      }
    }

    await fs.writeFile(
      path.join(checkpointPath, 'metadata.json'),
      JSON.stringify(checkpoint, null, 2)
    );

    const checkpoints = await this.loadAllCheckpoints();
    checkpoints.push({
      ...checkpoint,
      changes: checkpoint.changes.map(c => ({ ...c, after: undefined, before: undefined }))
    });
    await fs.writeFile(this.checkpointsFile, JSON.stringify(checkpoints, null, 2));
  }

  async restoreCheckpoint(checkpointId: string, targetPath: string): Promise<boolean> {
    const checkpointPath = path.join(this.checkpointDir, checkpointId);
    
    try {
      const metadataPath = path.join(checkpointPath, 'metadata.json');
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

      for (const change of metadata.changes) {
        const sourcePath = path.join(checkpointPath, change.path);
        const destPath = path.join(targetPath, change.path);

        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.copyFile(sourcePath, destPath);
      }

      console.log(`✅ Checkpoint ${checkpointId} restored`);
      return true;
    } catch (error) {
      console.error('Failed to restore checkpoint:', error);
      return false;
    }
  }

  async listCheckpoints(workspacePath?: string, limit?: number): Promise<Checkpoint[]> {
    const checkpoints = await this.loadAllCheckpoints();
    const sorted = checkpoints.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return limit ? sorted.slice(0, limit) : sorted;
  }

  async compareCheckpoints(id1: string, id2: string): Promise<any> {
    const checkpoint1 = await this.loadCheckpoint(id1);
    const checkpoint2 = await this.loadCheckpoint(id2);

    if (!checkpoint1 || !checkpoint2) {
      throw new Error('Checkpoint not found');
    }

    const diffs: any[] = [];

    const allPaths = new Set([
      ...checkpoint1.changes.map(c => c.path),
      ...checkpoint2.changes.map(c => c.path)
    ]);

    for (const filePath of allPaths) {
      const file1 = checkpoint1.changes.find(c => c.path === filePath);
      const file2 = checkpoint2.changes.find(c => c.path === filePath);

      if (!file1) {
        diffs.push({ path: filePath, type: 'added_in_checkpoint2' });
      } else if (!file2) {
        diffs.push({ path: filePath, type: 'removed_in_checkpoint2' });
      } else if (file1.after !== file2.after) {
        const patch = createPatch(filePath, file1.after || '', file2.after || '');
        diffs.push({ path: filePath, type: 'modified', diff: patch });
      }
    }

    return {
      checkpoint1: { id: id1, timestamp: checkpoint1.timestamp },
      checkpoint2: { id: id2, timestamp: checkpoint2.timestamp },
      differences: diffs
    };
  }

  async updateCheckpoint(id: string, updates: Partial<Checkpoint>): Promise<void> {
    const checkpoints = await this.loadAllCheckpoints();
    const index = checkpoints.findIndex(c => c.id === id);
    
    if (index !== -1) {
      checkpoints[index] = { ...checkpoints[index], ...updates };
      await fs.writeFile(this.checkpointsFile, JSON.stringify(checkpoints, null, 2));
    }
  }

  private async loadAllCheckpoints(): Promise<Checkpoint[]> {
    try {
      const data = await fs.readFile(this.checkpointsFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async loadCheckpoint(id: string): Promise<Checkpoint | null> {
    try {
      const metadataPath = path.join(this.checkpointDir, id, 'metadata.json');
      const data = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}
