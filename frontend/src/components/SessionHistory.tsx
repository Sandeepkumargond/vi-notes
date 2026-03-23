import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './SessionHistory.css';

interface SessionData {
  _id: string;
  wordCount: number;
  characterCount: number;
  createdAt: string;
  totalDuration: number;
}

interface SessionDetail {
  _id: string;
  content: string;
  wordCount: number;
  characterCount: number;
  keystrokeCount: number;
  pasteCount: number;
  totalDuration: number;
  startTime: string;
  endTime: string;
  createdAt: string;
}

interface SessionReportData {
  _id?: string;
  confidenceScore: number;
  suspiciousPatterns: string[];
  averageTypingSpeed: number;
  suspiciousPasteRatio: number;
  keystrokeCount: number;
  pasteCount: number;
}

export const SessionHistory: React.FC = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [sessionReport, setSessionReport] = useState<SessionReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'length'>('date');
  const [filterMinWC, setFilterMinWC] = useState<number>(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUserSessions();
      // Filter out sessions without IDs and map to SessionData
      const sessionsList = (data || [])
        .filter(session => session._id)
        .map(session => ({
          _id: session._id as string,
          wordCount: session.wordCount,
          characterCount: session.characterCount,
          createdAt: session.createdAt ? new Date(session.createdAt).toISOString() : new Date().toISOString(),
          totalDuration: session.totalDuration || 0,
        }));
      setSessions(sessionsList);
    } catch (error: any) {
      setError(error.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetail = async (sessionId: string) => {
    try {
      const session = await api.getSession(sessionId);
      
      // Map WritingSession to SessionDetail
      const detail: SessionDetail = {
        _id: session._id || sessionId,
        content: session.content,
        wordCount: session.wordCount,
        characterCount: session.characterCount,
        keystrokeCount: session.keystrokes?.length || 0,
        pasteCount: session.pasteEvents?.length || 0,
        totalDuration: session.totalDuration || 0,
        startTime: session.startTime ? new Date(session.startTime).toISOString() : new Date().toISOString(),
        endTime: session.endTime ? new Date(session.endTime).toISOString() : new Date().toISOString(),
        createdAt: session.createdAt ? new Date(session.createdAt).toISOString() : new Date().toISOString(),
      };
      setSelectedSession(detail);
      
      // Load associated report
      const report = await api.getSessionReport(sessionId);
      setSessionReport({
        _id: report._id,
        confidenceScore: report.confidenceScore,
        suspiciousPatterns: report.suspiciousPatterns,
        averageTypingSpeed: report.averageTypingSpeed,
        suspiciousPasteRatio: report.suspiciousPasteRatio,
        keystrokeCount: report.keystrokeCount,
        pasteCount: report.pasteCount,
      });
    } catch (error: any) {
      setError(error.message || 'Failed to load session details');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      setSessions(sessions.filter(s => s._id !== sessionId));
      setSelectedSession(null);
      setSessionReport(null);
      setDeleteConfirm(null);
    } catch (error: any) {
      setError(error.message || 'Failed to delete session');
    }
  };

  const handleCopyContent = () => {
    if (selectedSession?.content) {
      navigator.clipboard.writeText(selectedSession.content);
      alert('Content copied to clipboard!');
    }
  };

  const handleExportSession = () => {
    if (!selectedSession || !sessionReport) return;

    const exportData = {
      session: selectedSession,
      report: sessionReport,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${selectedSession._id}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Sort and filter sessions
  const filteredSessions = sessions
    .filter(s => s.wordCount >= filterMinWC)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.characterCount - a.characterCount;
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#FFC107';
    if (score >= 50) return '#FF9800';
    return '#f44336';
  };

  return (
    <div className="session-history-container">
      <div className="history-header">
        <h2>Session History</h2>
        <button className="refresh-button" onClick={loadSessions} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="history-controls">
        <div className="control-group">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'date' | 'length')}
          >
            <option value="date">Most Recent</option>
            <option value="length">Longest First</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="min-wc">Minimum words:</label>
          <input
            id="min-wc"
            type="number"
            min="0"
            value={filterMinWC}
            onChange={e => setFilterMinWC(Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>

        <div className="session-count">
          Found: <strong>{filteredSessions.length}</strong> sessions
        </div>
      </div>

      <div className="history-content">
        <div className="sessions-list">
          {filteredSessions.length === 0 ? (
            <div className="empty-state">
              <p>No sessions found. Start writing to create a new session!</p>
            </div>
          ) : (
            filteredSessions.map(session => (
              <div
                key={session._id}
                className={`session-item ${selectedSession?._id === session._id ? 'active' : ''}`}
                onClick={() => loadSessionDetail(session._id)}
              >
                <div className="session-item-header">
                  <span className="session-date">{formatDate(session.createdAt)}</span>
                  <span className="session-id">#{session._id.substring(0, 8)}</span>
                </div>
                <div className="session-item-stats">
                  <span className="stat">📝 {session.wordCount} words</span>
                  <span className="stat">⌨️ {session.characterCount} chars</span>
                  <span className="stat">⏱️ {formatDuration(session.totalDuration || 0)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="session-detail">
          {selectedSession && sessionReport ? (
            <>
              <div className="detail-header">
                <h3>Session Details</h3>
                <div className="detail-actions">
                  <button className="action-button" onClick={handleCopyContent} title="Copy content">
                    📋 Copy
                  </button>
                  <button className="action-button" onClick={handleExportSession} title="Export as JSON">
                    📥 Export
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => setDeleteConfirm(selectedSession._id)}
                    title="Delete session"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {deleteConfirm === selectedSession._id && (
                <div className="delete-confirm">
                  <p>Are you sure you want to delete this session?</p>
                  <div className="confirm-actions">
                    <button
                      className="confirm-btn yes"
                      onClick={() => handleDeleteSession(selectedSession._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="confirm-btn no"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="detail-section metadata">
                <h4>📊 Metadata</h4>
                <div className="metadata-grid">
                  <div className="metadata-item">
                    <span className="label">Date Created:</span>
                    <span className="value">{formatDate(selectedSession.createdAt)}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Duration:</span>
                    <span className="value">{formatDuration(selectedSession.totalDuration || 0)}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Word Count:</span>
                    <span className="value">{selectedSession.wordCount}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Character Count:</span>
                    <span className="value">{selectedSession.characterCount}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Keystrokes:</span>
                    <span className="value">{selectedSession.keystrokeCount || 0}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Paste Events:</span>
                    <span className="value">{selectedSession.pasteCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section analysis">
                <h4>🔍 Authenticity Analysis</h4>
                <div className="confidence-score">
                  <div className="score-circle" style={{ borderColor: getConfidenceColor(sessionReport.confidenceScore) }}>
                    <span className="score-value">{Math.round(sessionReport.confidenceScore)}%</span>
                  </div>
                  <span className="score-label">Confidence Score</span>
                </div>

                <div className="analysis-metrics">
                  <div className="metric">
                    <span className="metric-label">Average Typing Speed:</span>
                    <span className="metric-value">{sessionReport.averageTypingSpeed.toFixed(0)} ms/char</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Suspicious Paste Ratio:</span>
                    <span className="metric-value">{(sessionReport.suspiciousPasteRatio * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {sessionReport.suspiciousPatterns.length > 0 && (
                  <div className="patterns">
                    <span className="patterns-label">Suspicious Patterns Detected:</span>
                    <ul>
                      {sessionReport.suspiciousPatterns.map((pattern, idx) => (
                        <li key={idx}>⚠️ {pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="detail-section content">
                <h4>📄 Content Preview</h4>
                <div className="content-preview">
                  {selectedSession.content.substring(0, 500)}
                  {selectedSession.content.length > 500 && '...'}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-detail">
              <p>Select a session to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
