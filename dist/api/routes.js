"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
function setupRoutes(app, orchestrator) {
    app.post('/api/analyze', async (req, res) => {
        try {
            const result = await orchestrator.handleMessage({
                type: 'analyze_project',
                payload: req.body
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    app.post('/api/generate', async (req, res) => {
        try {
            const result = await orchestrator.handleMessage({
                type: 'generate_code',
                payload: req.body
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    app.post('/api/refactor', async (req, res) => {
        try {
            const result = await orchestrator.handleMessage({
                type: 'refactor_code',
                payload: req.body
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    app.post('/api/debug', async (req, res) => {
        try {
            const result = await orchestrator.handleMessage({
                type: 'debug_code',
                payload: req.body
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    app.post('/api/fuse', async (req, res) => {
        try {
            const result = await orchestrator.handleMessage({
                type: 'fuse_projects',
                payload: req.body
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    app.post('/api/checkpoint', async (req, res) => {
        try {
            const result = await orchestrator.handleMessage({
                type: 'create_checkpoint',
                payload: req.body
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    app.post('/api/documentation', async (req, res) => {
        try {
            const result = await orchestrator.handleMessage({
                type: 'generate_documentation',
                payload: req.body
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    app.get('/api/agents', (req, res) => {
        res.json({
            agents: orchestrator.getAgents(),
            system: 'TITAN++ Ultra'
        });
    });
}
//# sourceMappingURL=routes.js.map