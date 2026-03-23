import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { Editor } from './components/Editor';
import { SessionHistory } from './components/SessionHistory';
import './App.css';

type AppTab = 'editor' | 'history';

function App() {
  const { isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<AppTab>('editor');

  if (!isAuthenticated) {
    return (
      <Auth
        mode={authMode}
        onSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="app-tabs">
        <button
          className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          ✍️ Editor
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📚 Session History
        </button>
      </div>
      
      <div className="app-content">
        {activeTab === 'editor' && <Editor />}
        {activeTab === 'history' && <SessionHistory />}
      </div>
    </div>
  );
}

export default App;
