"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const dotenv_1 = __importDefault(require("dotenv"));
const orchestrator_1 = require("./core/orchestrator");
const routes_1 = require("./api/routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
const server = app.listen(PORT, () => {
    console.log(`🚀 TITAN++ Ultra System Starting...`);
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🤖 DeepSeek Endpoint: ${process.env.DEEPSEEK_ENDPOINT}`);
    console.log(`💾 Checkpoint Directory: ${process.env.CHECKPOINT_DIR || './checkpoints'}`);
    console.log(`🔧 Workspace Directory: ${process.env.WORKSPACE_DIR || './workspace'}`);
});
const wss = new ws_1.WebSocketServer({ server });
const orchestrator = new orchestrator_1.TitanOrchestrator();
wss.on('connection', (ws) => {
    console.log('🔌 New WebSocket connection established');
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('📨 Received message:', message.type);
            const response = await orchestrator.handleMessage(message, (update) => {
                ws.send(JSON.stringify(update));
            });
            ws.send(JSON.stringify(response));
        }
        catch (error) {
            console.error('❌ WebSocket error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            }));
        }
    });
    ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
    });
});
(0, routes_1.setupRoutes)(app, orchestrator);
app.get('/health', (req, res) => {
    res.json({
        status: 'operational',
        system: 'TITAN++ Ultra',
        timestamp: new Date().toISOString()
    });
});
console.log('✅ TITAN++ Ultra System Ready');
console.log('🎯 Agents: Architect Prime, Master Engineer, Refactor Overlord, Debugger Sentinel, Fusion Warden, CheckPoint Arbiter, Documentation Sage');
console.log('🧠 Cognitive Pipeline: Active');
console.log('🔀 Cross-Language Fusion: Enabled');
console.log('💾 Checkpoint System: Initialized');
console.log('🐳 Sandbox: Docker Ready');
//# sourceMappingURL=index.js.map