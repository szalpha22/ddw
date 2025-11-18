"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerceptionLayer = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
class PerceptionLayer {
    async scanProject(projectPath) {
        console.log('🔍 Perception Layer: Scanning project...');
        const structure = await this.buildFileTree(projectPath);
        const languages = await this.detectLanguages(projectPath);
        const frameworks = await this.detectFrameworks(projectPath);
        const dependencies = await this.extractDependencies(projectPath);
        const modules = await this.analyzeModules(projectPath, languages);
        const relationships = await this.mapRelationships(modules);
        const projectMap = {
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
    async buildFileTree(dir, basePath) {
        const base = basePath || dir;
        const stats = await promises_1.default.stat(dir);
        const name = path_1.default.basename(dir);
        if (stats.isFile()) {
            return {
                name,
                path: path_1.default.relative(base, dir),
                type: 'file',
                language: this.detectFileLanguage(name),
                size: stats.size
            };
        }
        const entries = await promises_1.default.readdir(dir, { withFileTypes: true });
        const children = [];
        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'node_modules') {
                continue;
            }
            const fullPath = path_1.default.join(dir, entry.name);
            children.push(await this.buildFileTree(fullPath, base));
        }
        return {
            name,
            path: path_1.default.relative(base, dir) || '.',
            type: 'directory',
            children
        };
    }
    detectFileLanguage(filename) {
        const ext = path_1.default.extname(filename).toLowerCase();
        const languageMap = {
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
    async detectLanguages(projectPath) {
        const languages = new Set();
        const files = await (0, glob_1.glob)('**/*', {
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
    async detectFrameworks(projectPath) {
        const frameworks = [];
        try {
            const packageJsonPath = path_1.default.join(projectPath, 'package.json');
            const packageJson = JSON.parse(await promises_1.default.readFile(packageJsonPath, 'utf-8'));
            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };
            const frameworkMap = {
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
        }
        catch {
        }
        try {
            const requirementsPath = path_1.default.join(projectPath, 'requirements.txt');
            const requirements = await promises_1.default.readFile(requirementsPath, 'utf-8');
            if (requirements.includes('django'))
                frameworks.push('Django');
            if (requirements.includes('flask'))
                frameworks.push('Flask');
            if (requirements.includes('fastapi'))
                frameworks.push('FastAPI');
        }
        catch {
        }
        return frameworks;
    }
    async extractDependencies(projectPath) {
        const dependencies = {};
        try {
            const packageJsonPath = path_1.default.join(projectPath, 'package.json');
            const packageJson = JSON.parse(await promises_1.default.readFile(packageJsonPath, 'utf-8'));
            for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
                dependencies[name] = { version: version, type: 'production' };
            }
            for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
                dependencies[name] = { version: version, type: 'development' };
            }
        }
        catch {
        }
        return dependencies;
    }
    async analyzeModules(projectPath, languages) {
        const modules = [];
        for (const language of languages) {
            if (language.includes('JavaScript') || language.includes('TypeScript')) {
                const jsModules = await this.analyzeJSModules(projectPath);
                modules.push(...jsModules);
            }
        }
        return modules;
    }
    async analyzeJSModules(projectPath) {
        const modules = [];
        const files = await (0, glob_1.glob)('**/*.{js,ts,jsx,tsx}', {
            cwd: projectPath,
            ignore: ['node_modules/**', 'dist/**', 'build/**']
        });
        for (const file of files) {
            const fullPath = path_1.default.join(projectPath, file);
            try {
                const content = await promises_1.default.readFile(fullPath, 'utf-8');
                const imports = this.extractImports(content);
                const exports = this.extractExports(content);
                modules.push({
                    name: path_1.default.basename(file, path_1.default.extname(file)),
                    path: file,
                    language: file.endsWith('.ts') || file.endsWith('.tsx') ? 'TypeScript' : 'JavaScript',
                    exports,
                    imports,
                    types: []
                });
            }
            catch {
            }
        }
        return modules;
    }
    extractImports(content) {
        const imports = [];
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
    extractExports(content) {
        const exports = [];
        const exportRegex = /export\s+(?:(?:default|const|let|var|function|class)\s+)?(\w+)/g;
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            if (match[1] !== 'default') {
                exports.push(match[1]);
            }
        }
        return exports;
    }
    async mapRelationships(modules) {
        const relationships = [];
        for (const module of modules) {
            for (const imp of module.imports) {
                if (!imp.startsWith('.'))
                    continue;
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
exports.PerceptionLayer = PerceptionLayer;
//# sourceMappingURL=perception_layer.js.map