import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

export interface ProjectMap {
  root: string;
  languages: string[];
  frameworks: string[];
  modules: ModuleInfo[];
  dependencies: DependencyInfo;
  structure: FileNode;
  relationships: Relationship[];
}

export interface ModuleInfo {
  name: string;
  path: string;
  language: string;
  exports: string[];
  imports: string[];
  types: string[];
}

export interface DependencyInfo {
  [key: string]: {
    version: string;
    type: 'production' | 'development';
  };
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  language?: string;
  size?: number;
}

export interface Relationship {
  from: string;
  to: string;
  type: 'imports' | 'extends' | 'implements' | 'calls' | 'references';
}

export class PerceptionLayer {
  async scanProject(projectPath: string): Promise<ProjectMap> {
    console.log('🔍 Perception Layer: Scanning project...');

    const structure = await this.buildFileTree(projectPath);
    const languages = await this.detectLanguages(projectPath);
    const frameworks = await this.detectFrameworks(projectPath);
    const dependencies = await this.extractDependencies(projectPath);
    const modules = await this.analyzeModules(projectPath, languages);
    const relationships = await this.mapRelationships(modules);

    const projectMap: ProjectMap = {
      root: projectPath,
      languages,
      frameworks,
      modules,
      dependencies,
      structure,
      relationships
    };

    console.log(`✅ Perception complete: ${languages.length} languages, ${modules.length} modules`);

    return projectMap;
  }

  private async buildFileTree(dir: string, basePath?: string): Promise<FileNode> {
    const base = basePath || dir;
    const stats = await fs.stat(dir);
    const name = path.basename(dir);

    if (stats.isFile()) {
      return {
        name,
        path: path.relative(base, dir),
        type: 'file',
        language: this.detectFileLanguage(name),
        size: stats.size
      };
    }

    const entries = await fs.readdir(dir, { withFileTypes: true });
    const children: FileNode[] = [];

    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      children.push(await this.buildFileTree(fullPath, base));
    }

    return {
      name,
      path: path.relative(base, dir) || '.',
      type: 'directory',
      children
    };
  }

  private detectFileLanguage(filename: string): string | undefined {
    const ext = path.extname(filename).toLowerCase();
    const languageMap: { [key: string]: string } = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript React',
      '.jsx': 'JavaScript React',
      '.py': 'Python',
      '.go': 'Go',
      '.rs': 'Rust',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.swift': 'Swift',
      '.kt': 'Kotlin'
    };

    return languageMap[ext];
  }

  private async detectLanguages(projectPath: string): Promise<string[]> {
    const languages = new Set<string>();
    
    const files = await glob('**/*', {
      cwd: projectPath,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**']
    });

    for (const file of files) {
      const lang = this.detectFileLanguage(file);
      if (lang) {
        languages.add(lang);
      }
    }

    return Array.from(languages);
  }

  private async detectFrameworks(projectPath: string): Promise<string[]> {
    const frameworks: string[] = [];

    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      const frameworkMap: { [key: string]: string } = {
        'react': 'React',
        'vue': 'Vue',
        'angular': 'Angular',
        'express': 'Express',
        'fastify': 'Fastify',
        'next': 'Next.js',
        'nuxt': 'Nuxt',
        'svelte': 'Svelte'
      };

      for (const [dep, framework] of Object.entries(frameworkMap)) {
        if (allDeps[dep]) {
          frameworks.push(framework);
        }
      }
    } catch {
    }

    try {
      const requirementsPath = path.join(projectPath, 'requirements.txt');
      const requirements = await fs.readFile(requirementsPath, 'utf-8');
      
      if (requirements.includes('django')) frameworks.push('Django');
      if (requirements.includes('flask')) frameworks.push('Flask');
      if (requirements.includes('fastapi')) frameworks.push('FastAPI');
    } catch {
    }

    return frameworks;
  }

  private async extractDependencies(projectPath: string): Promise<DependencyInfo> {
    const dependencies: DependencyInfo = {};

    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
        dependencies[name] = { version: version as string, type: 'production' };
      }
      
      for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
        dependencies[name] = { version: version as string, type: 'development' };
      }
    } catch {
    }

    return dependencies;
  }

  private async analyzeModules(projectPath: string, languages: string[]): Promise<ModuleInfo[]> {
    const modules: ModuleInfo[] = [];

    for (const language of languages) {
      if (language.includes('JavaScript') || language.includes('TypeScript')) {
        const jsModules = await this.analyzeJSModules(projectPath);
        modules.push(...jsModules);
      }
    }

    return modules;
  }

  private async analyzeJSModules(projectPath: string): Promise<ModuleInfo[]> {
    const modules: ModuleInfo[] = [];

    const files = await glob('**/*.{js,ts,jsx,tsx}', {
      cwd: projectPath,
      ignore: ['node_modules/**', 'dist/**', 'build/**']
    });

    for (const file of files) {
      const fullPath = path.join(projectPath, file);
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        const imports = this.extractImports(content);
        const exports = this.extractExports(content);

        modules.push({
          name: path.basename(file, path.extname(file)),
          path: file,
          language: file.endsWith('.ts') || file.endsWith('.tsx') ? 'TypeScript' : 'JavaScript',
          exports,
          imports,
          types: []
        });
      } catch {
      }
    }

    return modules;
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+(?:{[^}]+}|[\w*]+)\s+from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportRegex = /export\s+(?:(?:default|const|let|var|function|class)\s+)?(\w+)/g;

    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      if (match[1] !== 'default') {
        exports.push(match[1]);
      }
    }

    return exports;
  }

  private async mapRelationships(modules: ModuleInfo[]): Promise<Relationship[]> {
    const relationships: Relationship[] = [];

    for (const module of modules) {
      for (const imp of module.imports) {
        if (!imp.startsWith('.')) continue;

        relationships.push({
          from: module.path,
          to: imp,
          type: 'imports'
        });
      }
    }

    return relationships;
  }
}
