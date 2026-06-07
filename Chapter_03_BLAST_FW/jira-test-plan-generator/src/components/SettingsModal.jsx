import { useState, useEffect } from 'react'

const defaults = {
  jiraEmail:   '',
  jiraToken:   '',
  jiraBaseUrl: '',
  groqApiKey:  '',
  groqModel:   'openai/gpt-oss-120b',
}

export default function SettingsModal({ configKey, onClose }) {
  const [config, setConfig] = useState(defaults)
  const [saved,  setSaved]  = useState(false)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(configKey) || '{}')
    setConfig({ ...defaults, ...stored })
  }, [configKey])

  const set = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem(configKey, JSON.stringify(config))
    setSaved(true)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">

        {/* ── Header ── */}
        <div className="modal-header">
          <div className="modal-header-icon">⚙</div>
          <div className="modal-title-group">
            <div className="modal-title">Configuration</div>
            <div className="modal-subtitle">Credentials are stored locally in your browser</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">

          {/* Jira section */}
          <div className="settings-section">
            <div className="section-header">
              <div className="section-icon jira">🔵</div>
              <span className="section-name">Jira Connection</span>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@company.com"
                value={config.jiraEmail}
                onChange={(e) => set('jiraEmail', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">API Token</label>
              <input
                className="form-input"
                type="password"
                placeholder="ATATT3x..."
                value={config.jiraToken}
                onChange={(e) => set('jiraToken', e.target.value)}
              />
              <div className="form-hint">
                Generate at: id.atlassian.com → Security → API Tokens
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Jira Base URL</label>
              <input
                className="form-input"
                type="url"
                placeholder="https://yourname.atlassian.net"
                value={config.jiraBaseUrl}
                onChange={(e) => set('jiraBaseUrl', e.target.value)}
              />
              <div className="form-hint">
                Domain only — no trailing slash or <code style={{background:'#F1F5F9',padding:'1px 4px',borderRadius:'3px',fontSize:'11px'}}>/browse/...</code> path
              </div>
            </div>
          </div>

          {/* GROQ section */}
          <div className="settings-section">
            <div className="section-header">
              <div className="section-icon groq">🟣</div>
              <span className="section-name">GROQ AI</span>
            </div>

            <div className="form-group">
              <label className="form-label">API Key</label>
              <input
                className="form-input"
                type="password"
                placeholder="gsk_..."
                value={config.groqApiKey}
                onChange={(e) => set('groqApiKey', e.target.value)}
              />
              <div className="form-hint">Free key at: console.groq.com/keys</div>
            </div>

            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                className="form-input"
                type="text"
                placeholder="openai/gpt-oss-120b"
                value={config.groqModel}
                onChange={(e) => set('groqModel', e.target.value)}
              />
              <div className="form-hint">
                Default: <strong>openai/gpt-oss-120b</strong> (free tier). Fallback: llama-3.3-70b-versatile
              </div>
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          {saved && (
            <span className="save-success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              Settings saved
            </span>
          )}
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save Settings</button>
        </div>

      </div>
    </div>
  )
}
