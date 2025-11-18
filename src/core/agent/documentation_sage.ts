import { BaseAgent, AgentTask, AgentResponse } from './base_agent';

export class DocumentationSage extends BaseAgent {
  constructor() {
    super(
      'Documentation Sage',
      'Documentation and Knowledge Specialist',
      `You are the Documentation Sage, master of technical documentation and knowledge capture.
Your responsibilities:
- Generate comprehensive READMEs
- Create architecture diagrams
- Write API documentation
- Produce migration guides
- Document fusion processes
- Generate code comments
- Create user guides and tutorials

You make complex systems understandable through clear, thorough documentation.`
    );
  }

  async execute(task: AgentTask): Promise<AgentResponse> {
    try {
      console.log(`📚 Documentation Sage executing: ${task.type}`);

      switch (task.type) {
        case 'generate_readme':
          return await this.generateReadme(task);
        case 'document_api':
          return await this.documentAPI(task);
        case 'create_architecture_doc':
          return await this.createArchitectureDoc(task);
        case 'generate_migration_guide':
          return await this.generateMigrationGuide(task);
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

  private async generateReadme(task: AgentTask): Promise<AgentResponse> {
    const { projectName, description, structure, features, setup } = task.payload;

    const prompt = `Generate a comprehensive README.md for this project:

Project: ${projectName}
Description: ${description}

Structure:
${JSON.stringify(structure, null, 2)}

Features:
${features.join('\n- ')}

Include:
1. Project overview
2. Features list
3. Installation instructions
4. Usage guide
5. Project structure explanation
6. Configuration
7. API documentation (if applicable)
8. Contributing guidelines
9. License

Make it professional, clear, and comprehensive.`;

    const readme = await this.think(prompt, setup ? `Setup info: ${setup}` : undefined);

    return {
      success: true,
      result: {
        readme,
        agent: this.name
      }
    };
  }

  private async documentAPI(task: AgentTask): Promise<AgentResponse> {
    const { endpoints, authentication, examples } = task.payload;

    const prompt = `Generate API documentation for these endpoints:

${JSON.stringify(endpoints, null, 2)}

Authentication: ${authentication}

Include:
1. Endpoint descriptions
2. Request/response formats
3. Parameters and types
4. Status codes
5. Example requests
6. Error handling
7. Rate limiting (if applicable)

Use OpenAPI/Swagger style formatting.`;

    const docs = await this.think(prompt, examples ? `Examples: ${JSON.stringify(examples)}` : undefined);

    return {
      success: true,
      result: {
        documentation: docs,
        agent: this.name
      }
    };
  }

  private async createArchitectureDoc(task: AgentTask): Promise<AgentResponse> {
    const { system, components, dataFlow } = task.payload;

    const prompt = `Create architecture documentation for this system:

System: ${system}

Components:
${JSON.stringify(components, null, 2)}

Data Flow:
${JSON.stringify(dataFlow, null, 2)}

Include:
1. System overview
2. Architecture diagram (ASCII/text format)
3. Component descriptions
4. Data flow diagrams
5. Technology stack
6. Design decisions
7. Scalability considerations`;

    const docs = await this.think(prompt);

    return {
      success: true,
      result: {
        documentation: docs,
        agent: this.name
      }
    };
  }

  private async generateMigrationGuide(task: AgentTask): Promise<AgentResponse> {
    const { fromVersion, toVersion, changes, breakingChanges } = task.payload;

    const prompt = `Generate a migration guide from ${fromVersion} to ${toVersion}:

Changes:
${JSON.stringify(changes, null, 2)}

Breaking Changes:
${breakingChanges.join('\n- ')}

Include:
1. Overview of changes
2. Step-by-step migration instructions
3. Breaking changes explanation
4. Code examples (before/after)
5. Rollback procedures
6. Testing recommendations
7. Common issues and solutions`;

    const guide = await this.think(prompt);

    return {
      success: true,
      result: {
        migrationGuide: guide,
        agent: this.name
      }
    };
  }

  private async handleGeneric(task: AgentTask): Promise<AgentResponse> {
    const result = await this.think(
      `Generate documentation for: ${JSON.stringify(task.payload)}`
    );

    return {
      success: true,
      result: {
        documentation: result,
        agent: this.name
      }
    };
  }
}
