import React, { useState, useRef, useEffect } from 'react';
import KeyboardMonitor from '../services/keyboard-monitor';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Editor.css';

interface EditorState {
  content: string;
  isSaving: boolean;
  saveSuccess: false | string;
  error: string | null;
  charCount: number;
  wordCount: number;
  pasteCount: number;
  keystrokeCount: number;
}

export const Editor: React.FC = () => {
  const { user, logout } = useAuth();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const keyboardMonitorRef = useRef<KeyboardMonitor | null>(null);

  const [state, setState] = useState<EditorState>({
    content: '',
    isSaving: false,
    saveSuccess: false,
    error: null,
    charCount: 0,
    wordCount: 0,
    pasteCount: 0,
    keystrokeCount: 0,
  });

  // Initialize keyboard monitoring (Features #3 and #4)
  useEffect(() => {
    if (editorRef.current && !keyboardMonitorRef.current) {
      keyboardMonitorRef.current = new KeyboardMonitor();
      keyboardMonitorRef.current.startMonitoring(editorRef.current);
    }

    return () => {
      if (keyboardMonitorRef.current) {
        keyboardMonitorRef.current.stopMonitoring();
      }
    };
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    const charCount = content.length;
    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

    setState(prev => ({
      ...prev,
      content,
      charCount,
      wordCount,
      pasteCount: keyboardMonitorRef.current?.getPasteEvents().length || 0,
      keystrokeCount: keyboardMonitorRef.current?.getKeystrokes().length || 0,
    }));
  };

  const handleSaveSession = async () => {
    if (!state.content.trim()) {
      setState(prev => ({ ...prev, error: 'Cannot save empty content' }));
      return;
    }

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const keystrokeData = keyboardMonitorRef.current?.getKeystrokes() || [];
      const pasteEventsData = keyboardMonitorRef.current?.getPasteEvents() || [];

      const response = await api.saveSession({
        content: state.content,
        keystrokes: keystrokeData,
        pasteEvents: pasteEventsData,
        startTime: new Date(),
        endTime: new Date(),
      });

      setState(prev => ({
        ...prev,
        saveSuccess: `Session saved successfully! Confidence Score: ${response.report.confidenceScore.toFixed(1)}%`,
        isSaving: false,
      }));

      // Reset editor
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          content: '',
          charCount: 0,
          wordCount: 0,
          saveSuccess: false,
        }));
        keyboardMonitorRef.current?.reset();
        if (editorRef.current) {
          editorRef.current.value = '';
          editorRef.current.focus();
        }
      }, 3000);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to save session',
        isSaving: false,
      }));
    }
  };

  const handleClearEditor = () => {
    if (window.confirm('Clear editor content?')) {
      setState(prev => ({
        ...prev,
        content: '',
        charCount: 0,
        wordCount: 0,
      }));
      keyboardMonitorRef.current?.reset();
      if (editorRef.current) {
        editorRef.current.value = '';
        editorRef.current.focus();
      }
    }
  };

  return (
    <div className="editor-container">
      <header className="editor-header">
        <div className="header-left">
          <h1>Vi-Notes</h1>
          <p>Distraction-free writing with authenticity verification</p>
        </div>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="editor-content">
        <div className="editor-section">
          {/* Feature #1: Basic Writing Editor */}
          <textarea
            ref={editorRef}
            className="text-editor"
            placeholder="Start typing here... Your keyboard activity is being monitored silently in the background."
            value={state.content}
            onChange={handleContentChange}
          />

          <div className="editor-stats">
            <div className="stat">
              <span className="stat-label">Characters:</span>
              <span className="stat-value">{state.charCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Words:</span>
              <span className="stat-value">{state.wordCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Keystrokes:</span>
              <span className="stat-value">{state.keystrokeCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Pastes Detected:</span>
              <span className="stat-value">{state.pasteCount}</span>
            </div>
          </div>
        </div>

        <div className="editor-sidebar">
          <div className="sidebar-section">
            <h3>Session Monitor</h3>
            <div className="monitor-info">
              <p>
                <strong>Live Monitoring:</strong> Your typing behavior is being recorded in real-time
              </p>
              <p>
                <strong>Paste Detection:</strong> Paste events are automatically detected and logged
              </p>
              <p>
                <strong>Privacy:</strong> Only metadata is stored, not your content
              </p>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Actions</h3>
            {state.error && <div className="error-message">{state.error}</div>}
            {state.saveSuccess && (
              <div className="success-message">{state.saveSuccess}</div>
            )}
            <button
              className="primary-button"
              onClick={handleSaveSession}
              disabled={state.isSaving || !state.content.trim()}
            >
              {state.isSaving ? 'Saving...' : 'Save Session'}
            </button>
            <button
              className="secondary-button"
              onClick={handleClearEditor}
              disabled={!state.content}
            >
              Clear Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
