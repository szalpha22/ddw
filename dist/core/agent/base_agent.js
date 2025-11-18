"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const deepseek_client_1 = require("../router/deepseek_client");
class BaseAgent {
    name;
    role;
    deepseek;
    systemPrompt;
    constructor(name, role, systemPrompt) {
        this.name = name;
        this.role = role;
        this.systemPrompt = systemPrompt;
        this.deepseek = new deepseek_client_1.DeepSeekClient();
        console.log(`🤖 Agent ${name} initialized`);
    }
    async think(prompt, context) {
        const messages = [
            { role: 'system', content: this.systemPrompt }
        ];
        if (context) {
            messages.push({ role: 'user', content: `Context:\n${context}` });
        }
        messages.push({ role: 'user', content: prompt });
        return this.deepseek.complete(messages);
    }
    async thinkStream(prompt, onChunk, context) {
        const messages = [
            { role: 'system', content: this.systemPrompt }
        ];
        if (context) {
            messages.push({ role: 'user', content: `Context:\n${context}` });
        }
        messages.push({ role: 'user', content: prompt });
        await this.deepseek.streamComplete(messages, onChunk);
    }
    getName() {
        return this.name;
    }
    getRole() {
        return this.role;
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=base_agent.js.map