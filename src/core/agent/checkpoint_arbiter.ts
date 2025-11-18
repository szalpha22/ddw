import { BaseAgent, AgentTask, AgentResponse } from './base_agent';
import { CheckpointManager } from '../checkpoints/checkpoint_manager';

export class CheckpointArbiter extends BaseAgent {
  private checkpointManager: CheckpointManager;

  constructor() {
    super(
      'CheckPoint Arbiter',
      'Version Control and Checkpoint Specialist',
      `You are the CheckPoint Arbiter, guardian of project history and versioning.
Your responsibilities:
- Create and manage checkpoints
- Track project versions
- Generate semantic summaries of changes
- Enable time-travel debugging
- Manage rollbacks and restores
- Compare versions and generate diffs
- Maintain project history

You ensure that no work is ever lost and any state can be recovered.`
    );
    this.checkpointManager = new CheckpointManager();
  }

  async execute(task: AgentTask): Promise<AgentResponse> {
    try {
      console.log(`💾 CheckPoint Arbiter executing: ${task.type}`);

      switch (task.type) {
        case 'create_checkpoint':
          return await this.createCheckpoint(task);
        case 'restore_checkpoint':
          return await this.restoreCheckpoint(task);
        case 'list_checkpoints':
          return await this.listCheckpoints(task);
        case 'compare_checkpoints':
          return await this.compareCheckpoints(task);
        case 'analyze_changes':
          return await this.analyzeChanges(task);
        default:
          return await this.handleGeneric(task);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async createCheckpoint(task: AgentTask): Promise<AgentResponse> {
    const { workspacePath, message, metadata } = task.payload;

    const checkpoint = await this.checkpointManager.createCheckpoint(
      workspacePath,
      message,
      metadata
    );

    const summary = await this.think(
      `Analyze these changes and provide a semantic summary:\n${JSON.stringify(checkpoint.changes, null, 2)}`
    );

    checkpoint.semanticSummary = summary;
    await this.checkpointManager.updateCheckpoint(checkpoint.id, { semanticSummary: summary });

    return {
      success: true,
      result: {
        checkpoint,
        agent: this.name
      }
    };
  }

  private async restoreCheckpoint(task: AgentTask): Promise<AgentResponse> {
    const { checkpointId, targetPath } = task.payload;

    const result = await this.checkpointManager.restoreCheckpoint(checkpointId, targetPath);

    return {
      success: true,
      result: {
        restored: result,
        agent: this.name
      }
    };
  }

  private async listCheckpoints(task: AgentTask): Promise<AgentResponse> {
    const { workspacePath, limit } = task.payload;

    const checkpoints = await this.checkpointManager.listCheckpoints(workspacePath, limit);

    return {
      success: true,
      result: {
        checkpoints,
        agent: this.name
      }
    };
  }

  private async compareCheckpoints(task: AgentTask): Promise<AgentResponse> {
    const { checkpoint1Id, checkpoint2Id } = task.payload;

    const diff = await this.checkpointManager.compareCheckpoints(checkpoint1Id, checkpoint2Id);

    const analysis = await this.think(
      `Analyze the differences between these checkpoints:\n${JSON.stringify(diff, null, 2)}`
    );

    return {
      success: true,
      result: {
        diff,
        analysis,
        agent: this.name
      }
    };
  }

  private async analyzeChanges(task: AgentTask): Promise<AgentResponse> {
    const { changes } = task.payload;

    const prompt = `Analyze these code changes and provide insights:

${JSON.stringify(changes, null, 2)}

Provide:
1. Summary of changes
2. Impact analysis
3. Potential risks
4. Recommendations`;

    const analysis = await this.think(prompt);

    return {
      success: true,
      result: {
        analysis,
        agent: this.name
      }
    };
  }

  private async handleGeneric(task: AgentTask): Promise<AgentResponse> {
    const result = await this.think(
      `Handle checkpoint task: ${JSON.stringify(task.payload)}`
    );

    return {
      success: true,
      result: {
        response: result,
        agent: this.name
      }
    };
  }
}
