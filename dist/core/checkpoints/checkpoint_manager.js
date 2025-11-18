"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckpointManager = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const diff_1 = require("diff");
class CheckpointManager {
    checkpointDir;
    checkpointsFile;
    constructor() {
        this.checkpointDir = process.env.CHECKPOINT_DIR || './checkpoints';
        this.checkpointsFile = path_1.default.join(this.checkpointDir, 'checkpoints.json');
        this.initialize();
    }
    async initialize() {
        try {
            await promises_1.default.mkdir(this.checkpointDir, { recursive: true });
            try {
                await promises_1.default.access(this.checkpointsFile);
            }
            catch {
                await promises_1.default.writeFile(this.checkpointsFile, JSON.stringify([], null, 2));
            }
        }
        catch (error) {
            console.error('Failed to initialize checkpoint system:', error);
        }
    }
    async createCheckpoint(workspacePath, message, metadata) {
        const id = (0, uuid_1.v4)();
        const timestamp = new Date();
        const changes = await this.scanChanges(workspacePath);
        const versionHash = this.generateHash(changes);
        const reverseDiff = this.generateReverseDiff(changes);
        const checkpoint = {
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
    async scanChanges(workspacePath) {
        const changes = [];
        const scanDir = async (dir, baseDir) => {
            try {
                const entries = await promises_1.default.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path_1.default.join(dir, entry.name);
                    const relativePath = path_1.default.relative(baseDir, fullPath);
                    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
                        continue;
                    }
                    if (entry.isDirectory()) {
                        await scanDir(fullPath, baseDir);
                    }
                    else {
                        const content = await promises_1.default.readFile(fullPath, 'utf-8');
                        changes.push({
                            path: relativePath,
                            type: 'modified',
                            diff: '',
                            after: content
                        });
                    }
                }
            }
            catch (error) {
            }
        };
        await scanDir(workspacePath, workspacePath);
        return changes;
    }
    generateHash(changes) {
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
    generateReverseDiff(changes) {
        return changes.map(change => {
            if (change.type === 'added') {
                return `DELETE ${change.path}`;
            }
            else if (change.type === 'deleted') {
                return `RESTORE ${change.path}\n${change.before}`;
            }
            else {
                return `REVERT ${change.path}\n${change.before}`;
            }
        }).join('\n---\n');
    }
    async saveCheckpoint(checkpoint, workspacePath) {
        const checkpointPath = path_1.default.join(this.checkpointDir, checkpoint.id);
        await promises_1.default.mkdir(checkpointPath, { recursive: true });
        for (const change of checkpoint.changes) {
            const filePath = path_1.default.join(checkpointPath, change.path);
            await promises_1.default.mkdir(path_1.default.dirname(filePath), { recursive: true });
            if (change.after) {
                await promises_1.default.writeFile(filePath, change.after);
            }
        }
        await promises_1.default.writeFile(path_1.default.join(checkpointPath, 'metadata.json'), JSON.stringify(checkpoint, null, 2));
        const checkpoints = await this.loadAllCheckpoints();
        checkpoints.push({
            ...checkpoint,
            changes: checkpoint.changes.map(c => ({ ...c, after: undefined, before: undefined }))
        });
        await promises_1.default.writeFile(this.checkpointsFile, JSON.stringify(checkpoints, null, 2));
    }
    async restoreCheckpoint(checkpointId, targetPath) {
        const checkpointPath = path_1.default.join(this.checkpointDir, checkpointId);
        try {
            const metadataPath = path_1.default.join(checkpointPath, 'metadata.json');
            const metadata = JSON.parse(await promises_1.default.readFile(metadataPath, 'utf-8'));
            for (const change of metadata.changes) {
                const sourcePath = path_1.default.join(checkpointPath, change.path);
                const destPath = path_1.default.join(targetPath, change.path);
                await promises_1.default.mkdir(path_1.default.dirname(destPath), { recursive: true });
                await promises_1.default.copyFile(sourcePath, destPath);
            }
            console.log(`✅ Checkpoint ${checkpointId} restored`);
            return true;
        }
        catch (error) {
            console.error('Failed to restore checkpoint:', error);
            return false;
        }
    }
    async listCheckpoints(workspacePath, limit) {
        const checkpoints = await this.loadAllCheckpoints();
        const sorted = checkpoints.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return limit ? sorted.slice(0, limit) : sorted;
    }
    async compareCheckpoints(id1, id2) {
        const checkpoint1 = await this.loadCheckpoint(id1);
        const checkpoint2 = await this.loadCheckpoint(id2);
        if (!checkpoint1 || !checkpoint2) {
            throw new Error('Checkpoint not found');
        }
        const diffs = [];
        const allPaths = new Set([
            ...checkpoint1.changes.map(c => c.path),
            ...checkpoint2.changes.map(c => c.path)
        ]);
        for (const filePath of allPaths) {
            const file1 = checkpoint1.changes.find(c => c.path === filePath);
            const file2 = checkpoint2.changes.find(c => c.path === filePath);
            if (!file1) {
                diffs.push({ path: filePath, type: 'added_in_checkpoint2' });
            }
            else if (!file2) {
                diffs.push({ path: filePath, type: 'removed_in_checkpoint2' });
            }
            else if (file1.after !== file2.after) {
                const patch = (0, diff_1.createPatch)(filePath, file1.after || '', file2.after || '');
                diffs.push({ path: filePath, type: 'modified', diff: patch });
            }
        }
        return {
            checkpoint1: { id: id1, timestamp: checkpoint1.timestamp },
            checkpoint2: { id: id2, timestamp: checkpoint2.timestamp },
            differences: diffs
        };
    }
    async updateCheckpoint(id, updates) {
        const checkpoints = await this.loadAllCheckpoints();
        const index = checkpoints.findIndex(c => c.id === id);
        if (index !== -1) {
            checkpoints[index] = { ...checkpoints[index], ...updates };
            await promises_1.default.writeFile(this.checkpointsFile, JSON.stringify(checkpoints, null, 2));
        }
    }
    async loadAllCheckpoints() {
        try {
            const data = await promises_1.default.readFile(this.checkpointsFile, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return [];
        }
    }
    async loadCheckpoint(id) {
        try {
            const metadataPath = path_1.default.join(this.checkpointDir, id, 'metadata.json');
            const data = await promises_1.default.readFile(metadataPath, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
}
exports.CheckpointManager = CheckpointManager;
//# sourceMappingURL=checkpoint_manager.js.map