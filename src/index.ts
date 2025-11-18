import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { TitanOrchestrator } from './core/orchestrator';
import { setupRoutes } from './api/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const server = app.listen(PORT, () => {
  console.log(`🚀 TITAN++ Ultra System Starting...`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🤖 DeepSeek Endpoint: ${process.env.DEEPSEEK_ENDPOINT}`);
  console.log(`💾 Checkpoint Directory: ${process.env.CHECKPOINT_DIR || './checkpoints'}`);
  console.log(`🔧 Workspace Directory: ${process.env.WORKSPACE_DIR || './workspace'}`);
});

const wss = new WebSocketServer({ server });

const orchestrator = new TitanOrchestrator();

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
    } catch (error) {
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

setupRoutes(app, orchestrator);

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
