import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3000';

function App() {
  const [connected, setConnected] = useState(false);
  const [agents, setAgents] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('generate');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
    loadAgents();
  }, []);

  const checkConnection = async () => {
    try {
      await axios.get(`${API_URL}/health`);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/agents`);
      setAgents(response.data.agents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const handleGenerate = async (requirements: string, language: string) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post(`${API_URL}/api/generate`, {
        requirements,
        language
      });
      setResult(response.data);
    } catch (error: any) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const handleRefactor = async (code: string, language: string, goals: string) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post(`${API_URL}/api/refactor`, {
        code,
        language,
        goals
      });
      setResult(response.data);
    } catch (error: any) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🚀 TITAN++ Ultra</h1>
        <p className="subtitle">Autonomous AI Development System powered by DeepSeek Coder</p>
        <div className="status">
          Status: <span className={connected ? 'connected' : 'disconnected'}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      </header>

      <div className="agents-bar">
        <h3>Active Agents:</h3>
        <div className="agents-list">
          {agents.map(agent => (
            <span key={agent} className="agent-badge">{agent}</span>
          ))}
        </div>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'generate' ? 'active' : ''} 
          onClick={() => setActiveTab('generate')}
        >
          Generate Code
        </button>
        <button 
          className={activeTab === 'refactor' ? 'active' : ''} 
          onClick={() => setActiveTab('refactor')}
        >
          Refactor
        </button>
        <button 
          className={activeTab === 'fuse' ? 'active' : ''} 
          onClick={() => setActiveTab('fuse')}
        >
          Fusion
        </button>
        <button 
          className={activeTab === 'checkpoint' ? 'active' : ''} 
          onClick={() => setActiveTab('checkpoint')}
        >
          Checkpoints
        </button>
      </div>

      <div className="content">
        {activeTab === 'generate' && (
          <GeneratePanel onGenerate={handleGenerate} loading={loading} />
        )}
        {activeTab === 'refactor' && (
          <RefactorPanel onRefactor={handleRefactor} loading={loading} />
        )}
        {activeTab === 'fuse' && (
          <div className="panel">
            <h2>Project Fusion</h2>
            <p>Cross-language project fusion coming soon...</p>
          </div>
        )}
        {activeTab === 'checkpoint' && (
          <div className="panel">
            <h2>Checkpoint System</h2>
            <p>Version control and time travel coming soon...</p>
          </div>
        )}

        {result && (
          <div className="result">
            <h3>Result:</h3>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

function GeneratePanel({ onGenerate, loading }: any) {
  const [requirements, setRequirements] = useState('');
  const [language, setLanguage] = useState('TypeScript');

  return (
    <div className="panel">
      <h2>Generate Code</h2>
      <textarea
        placeholder="Describe what you want to build..."
        value={requirements}
        onChange={(e) => setRequirements(e.target.value)}
        rows={8}
      />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option>TypeScript</option>
        <option>JavaScript</option>
        <option>Python</option>
        <option>Go</option>
        <option>Rust</option>
        <option>Java</option>
      </select>
      <button 
        onClick={() => onGenerate(requirements, language)} 
        disabled={loading || !requirements}
      >
        {loading ? 'Generating...' : 'Generate Code'}
      </button>
    </div>
  );
}

function RefactorPanel({ onRefactor, loading }: any) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [goals, setGoals] = useState('');

  return (
    <div className="panel">
      <h2>Refactor Code</h2>
      <textarea
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={10}
      />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option>TypeScript</option>
        <option>JavaScript</option>
        <option>Python</option>
        <option>Go</option>
        <option>Rust</option>
      </select>
      <input
        type="text"
        placeholder="Refactoring goals (e.g., improve performance, reduce complexity)"
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
      />
      <button 
        onClick={() => onRefactor(code, language, goals)} 
        disabled={loading || !code || !goals}
      >
        {loading ? 'Refactoring...' : 'Refactor Code'}
      </button>
    </div>
  );
}

export default App;
