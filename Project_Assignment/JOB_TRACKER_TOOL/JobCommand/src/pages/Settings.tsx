import { useState, useEffect } from 'react';
import { Save, Download, Upload, Trash2, KeyRound, Eye, EyeOff, Bell, BellOff, Mail, Send } from 'lucide-react';
import { useStore, useProfile } from '../store/useStore';
import { AI_PROVIDERS, CURRENCIES } from '../lib/constants';
import { dbGetSetting, dbSetSetting } from '../lib/db';
import { requestBrowserPermission, sendTestNotification, DEFAULT_NOTIF } from '../lib/notifications';
import type { NotifSettings } from '../lib/notifications';
import type { AIProvider, Currency } from '../types';

export function Settings() {
  const profile         = useProfile();
  const updateProfile   = useStore((s) => s.updateProfile);
  const exportData      = useStore((s) => s.exportData);
  const exportCSV       = useStore((s) => s.exportCSV);
  const importData      = useStore((s) => s.importData);
  const importCSV       = useStore((s) => s.importCSV);
  const clearAll        = useStore((s) => s.clearAllData);
  const saveProvider    = useStore((s) => s.saveProvider);
  const activeProviders = useStore((s) => s.activeProviders);
  const addToast        = useStore((s) => s.addToast);

  const [csvPreview, setCsvPreview] = useState<{ text: string; rows: { company: string; role: string; status: string }[] } | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);

  const [goal, setGoal]         = useState(String(profile.monthlyGoal));
  const [currency, setCurrency] = useState<Currency>(profile.defaultCurrency);
  const [apiKeys, setApiKeys]   = useState<Record<string, string>>(
    Object.fromEntries(AI_PROVIDERS.map((p) => [p.id, activeProviders[p.id]?.apiKey || '']))
  );
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>(
    Object.fromEntries(AI_PROVIDERS.map((p) => [p.id, activeProviders[p.id]?.model || p.model]))
  );
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Notification state
  const [notif, setNotif]           = useState<NotifSettings>(DEFAULT_NOTIF);
  const [ejsOpen, setEjsOpen]       = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [browserPerm, setBrowserPerm] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );

  useEffect(() => {
    dbGetSetting('notif-settings').then((raw) => {
      if (raw) setNotif(JSON.parse(raw));
    });
  }, []);

  const saveNotif = async (updated: NotifSettings) => {
    setNotif(updated);
    await dbSetSetting('notif-settings', JSON.stringify(updated));
    addToast('Notification settings saved', 'success');
  };

  const setN = (field: keyof NotifSettings, value: unknown) =>
    setNotif((n) => ({ ...n, [field]: value }));

  const enableBrowser = async () => {
    const granted = await requestBrowserPermission();
    setBrowserPerm(Notification.permission);
    if (granted) {
      const updated = { ...notif, browserEnabled: true };
      await saveNotif(updated);
    } else {
      addToast('Browser notification permission denied', 'error');
    }
  };

  const handleTest = async () => {
    setTestSending(true);
    try {
      await sendTestNotification(notif);
      addToast('Test notification sent!', 'success');
    } catch {
      addToast('Test failed — check your EmailJS config', 'error');
    } finally {
      setTestSending(false);
    }
  };

  const saveSettings = async () => {
    await updateProfile({ monthlyGoal: Number(goal) || 10, defaultCurrency: currency });
    addToast('Settings saved', 'success');
  };

  const connectProvider = async (providerId: string) => {
    const pDef = AI_PROVIDERS.find((p) => p.id === providerId);
    if (!pDef || !apiKeys[providerId]?.trim()) { addToast('Enter an API key first', 'error'); return; }
    const provider: AIProvider = {
      id: providerId as AIProvider['id'],
      label: pDef.label,
      apiKey: apiKeys[providerId].trim(),
      model: selectedModels[providerId] || pDef.model,
      free: pDef.free,
    };
    await saveProvider(provider);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => importData(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleCSVPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const headers = lines[0]?.split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '')) || [];
      const col = (keys: string[]) => { for (const k of keys) { const i = headers.findIndex((h) => h.includes(k)); if (i >= 0) return i; } return -1; };
      const ci = col(['company']), ri = col(['role','title','position']), si = col(['status']);
      const rows = lines.slice(1, 6).map((line) => {
        const cells = line.split(',');
        return {
          company: (cells[ci] || '').replace(/"/g, '').trim(),
          role:    (cells[ri] || '').replace(/"/g, '').trim(),
          status:  (cells[si] || '').replace(/"/g, '').trim() || 'Saved',
        };
      }).filter((r) => r.company && r.role);
      setCsvPreview({ text, rows });
    };
    reader.readAsText(file);
  };

  const confirmCSVImport = async () => {
    if (!csvPreview) return;
    setCsvImporting(true);
    try {
      await importCSV(csvPreview.text);
    } finally {
      setCsvImporting(false);
      setCsvPreview(null);
    }
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--color-text-dim)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 };
  const rowStyle:   React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 };

  return (
    <div style={{ padding: 24, flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>

        {/* Tracker Parameters */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>Tracker Parameters</h3>
          <div className="form-group">
            <label>Monthly Application Goal</label>
            <input type="number" min={1} max={100} value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Default Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={saveSettings}>
            <Save size={13} /> Save Settings
          </button>
        </div>

        {/* Data & Backup */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>Data & Backup</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary" onClick={exportCSV}>
              <Download size={13} /> Export as CSV (Excel / Sheets)
            </button>
            <button className="btn btn-ghost" onClick={exportData}>
              <Download size={13} /> Export Full Backup (.json)
            </button>
            <label style={{ cursor: 'pointer', textTransform: 'none', fontSize: 13, marginBottom: 0 }}>
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              <div className="btn btn-ghost" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                <Upload size={13} /> Restore JSON Backup
              </div>
            </label>
            <label style={{ cursor: 'pointer', textTransform: 'none', fontSize: 13, marginBottom: 0 }}>
              <input type="file" accept=".csv" onChange={handleCSVPreview} style={{ display: 'none' }} />
              <div className="btn btn-ghost" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                <Upload size={13} /> Import from CSV
              </div>
            </label>
            {csvPreview && (
              <div style={{ marginTop: 4, padding: '12px 14px', background: 'var(--color-surface-2)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>
                  Preview (first {csvPreview.rows.length} rows):
                </div>
                <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', marginBottom: 10 }}>
                  <thead>
                    <tr>
                      {['Company','Role','Status'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '2px 6px', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: 9 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.rows.map((r, i) => (
                      <tr key={i}>
                        <td style={{ padding: '3px 6px', color: 'var(--color-text)' }}>{r.company}</td>
                        <td style={{ padding: '3px 6px', color: 'var(--color-text-dim)' }}>{r.role}</td>
                        <td style={{ padding: '3px 6px', color: 'var(--color-muted)' }}>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" style={{ fontSize: 12, padding: '5px 12px' }} onClick={confirmCSVImport} disabled={csvImporting}>
                    {csvImporting ? 'Importing…' : 'Confirm Import'}
                  </button>
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setCsvPreview(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <button
              className="btn"
              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.3)' }}
              onClick={() => { if (window.confirm('Delete ALL applications? This cannot be undone.')) clearAll(); }}
            >
              <Trash2 size={13} /> Clear All Data
            </button>
          </div>
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 6, fontSize: 11, color: 'var(--color-success)', border: '1px solid rgba(16,185,129,0.2)' }}>
            🔒 Your data never leaves your browser. Zero cloud storage.
          </div>
        </div>

        {/* ── Notifications ── */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={15} style={{ color: 'var(--color-accent)' }} /> Notifications & Alerts
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 18 }}>
            Get alerted for follow-ups, interviews, and offers — via browser pop-up and/or email.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Browser notifications */}
            <div style={{ padding: '14px 16px', background: 'var(--color-surface-2)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                {notif.browserEnabled ? <Bell size={14} style={{ color: 'var(--color-success)' }} /> : <BellOff size={14} style={{ color: 'var(--color-muted)' }} />}
                <span style={{ fontWeight: 600, fontSize: 13 }}>Browser Notifications</span>
                {notif.browserEnabled && <span style={{ fontSize: 9, background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', padding: '1px 6px', borderRadius: 999, fontWeight: 700, marginLeft: 'auto' }}>ON</span>}
              </div>

              {browserPerm === 'denied' ? (
                <div style={{ fontSize: 11, color: 'var(--color-danger)', marginBottom: 10 }}>
                  ⚠️ Permission blocked in browser. Click the 🔒 icon in address bar to allow notifications.
                </div>
              ) : (
                <button
                  className={`btn ${notif.browserEnabled ? 'btn-ghost' : 'btn-primary'}`}
                  style={{ width: '100%', fontSize: 12, marginBottom: 12 }}
                  onClick={notif.browserEnabled
                    ? () => saveNotif({ ...notif, browserEnabled: false })
                    : enableBrowser}
                >
                  {notif.browserEnabled ? 'Disable Browser Alerts' : 'Enable Browser Alerts'}
                </button>
              )}

              <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                Shows a desktop pop-up when CareerPulse is open in your browser.
              </div>
            </div>

            {/* Email notifications */}
            <div style={{ padding: '14px 16px', background: 'var(--color-surface-2)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Mail size={14} style={{ color: notif.emailEnabled ? 'var(--color-success)' : 'var(--color-muted)' }} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>Email Notifications</span>
                {notif.emailEnabled && <span style={{ fontSize: 9, background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', padding: '1px 6px', borderRadius: 999, fontWeight: 700, marginLeft: 'auto' }}>ON</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11 }}>Your Email</label>
                <input
                  type="email"
                  value={notif.email}
                  onChange={(e) => setN('email', e.target.value)}
                  placeholder="hemalathar212@gmail.com"
                  style={{ fontSize: 12 }}
                />
              </div>

              {/* EmailJS config toggle */}
              <button
                className="btn btn-ghost"
                style={{ width: '100%', fontSize: 11, marginBottom: 8 }}
                onClick={() => setEjsOpen((o) => !o)}
              >
                {ejsOpen ? '▲ Hide' : '▼ Show'} EmailJS Config (required for email)
              </button>

              {ejsOpen && (
                <div style={{ padding: '10px 12px', background: 'var(--color-surface)', borderRadius: 6, marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--color-muted)', marginBottom: 8, lineHeight: 1.5 }}>
                    Free at <strong>emailjs.com</strong> · Create account → Email Services → Add Gmail → Email Templates → use variables: <code>{'{{to_email}}'}</code>, <code>{'{{subject}}'}</code>, <code>{'{{message}}'}</code>
                  </div>
                  {[
                    ['ejsServiceId',  'Service ID',   'e.g. service_xxxxxx'],
                    ['ejsTemplateId', 'Template ID',  'e.g. template_xxxxxx'],
                    ['ejsPublicKey',  'Public Key',   'e.g. xxxxxxxxxxxxxxx'],
                  ].map(([field, label, ph]) => (
                    <div className="form-group" key={field} style={{ marginBottom: 6 }}>
                      <label style={{ fontSize: 10 }}>{label}</label>
                      <input
                        value={(notif as unknown as Record<string, string>)[field] || ''}
                        onChange={(e) => setN(field as keyof NotifSettings, e.target.value)}
                        placeholder={ph}
                        style={{ fontSize: 11 }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                className={`btn ${notif.emailEnabled ? 'btn-ghost' : 'btn-primary'}`}
                style={{ width: '100%', fontSize: 12 }}
                onClick={() => saveNotif({ ...notif, emailEnabled: !notif.emailEnabled })}
                disabled={!notif.email || !notif.ejsServiceId}
              >
                {notif.emailEnabled ? 'Disable Email Alerts' : 'Enable Email Alerts'}
              </button>
            </div>
          </div>

          {/* Alert types */}
          <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--color-surface-2)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Alert Types</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { key: 'alertFollowUp',  label: '📌 Follow-up Reminders', desc: 'Due & overdue follow-ups' },
                { key: 'alertInterview', label: '🎯 Interview Alerts',     desc: 'Today & tomorrow interviews' },
                { key: 'alertOffer',     label: '🎉 Offer Notifications',  desc: 'When status becomes Offer' },
              ].map(({ key, label, desc }) => (
                <label key={key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', padding: '10px 12px', background: 'var(--color-surface)', borderRadius: 6, border: `1px solid ${notif[key as keyof NotifSettings] ? 'var(--color-accent)' : 'var(--color-border)'}` }}>
                  <input
                    type="checkbox"
                    checked={!!notif[key as keyof NotifSettings]}
                    onChange={(e) => setN(key as keyof NotifSettings, e.target.checked)}
                    style={{ marginTop: 2, accentColor: 'var(--color-accent)' }}
                  />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>{label}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save + Test row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => saveNotif(notif)}>
              <Save size={13} /> Save Alert Settings
            </button>
            <button
              className="btn btn-ghost"
              onClick={handleTest}
              disabled={testSending || (!notif.browserEnabled && !notif.emailEnabled)}
            >
              <Send size={13} /> {testSending ? 'Sending…' : 'Send Test Notification'}
            </button>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            Alerts fire once per day when you open CareerPulse. Browser alerts appear as desktop pop-ups. Email alerts are sent via EmailJS (free tier: 200 emails/month).
          </div>
        </div>

        {/* AI Providers */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>AI Providers</h3>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 16 }}>
            API keys stored only in your browser (IndexedDB). Never sent to any server.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {AI_PROVIDERS.map((p) => {
              const isConnected = !!activeProviders[p.id]?.apiKey;
              return (
                <div key={p.id} className="card" style={{ padding: '14px 16px', background: 'var(--color-surface-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <KeyRound size={14} style={{ color: isConnected ? 'var(--color-success)' : 'var(--color-muted)' }} />
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text)' }}>{p.label}</span>
                    {p.free && <span style={{ fontSize: 9, background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', padding: '1px 6px', borderRadius: 999, fontWeight: 700 }}>FREE</span>}
                    {isConnected && <span style={{ fontSize: 9, background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', padding: '1px 6px', borderRadius: 999, marginLeft: 'auto' }}>Connected ✓</span>}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showKeys[p.id] ? 'text' : 'password'}
                      value={apiKeys[p.id] || ''}
                      onChange={(e) => setApiKeys((k) => ({ ...k, [p.id]: e.target.value }))}
                      placeholder={`${p.label} API key…`}
                      style={{ paddingRight: 36 }}
                    />
                    <button
                      className="btn-icon"
                      style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: 3 }}
                      onClick={() => setShowKeys((s) => ({ ...s, [p.id]: !s[p.id] }))}
                    >
                      {showKeys[p.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                  <select
                    value={selectedModels[p.id] || p.model}
                    onChange={(e) => setSelectedModels((m) => ({ ...m, [p.id]: e.target.value }))}
                    style={{ marginTop: 6, marginBottom: 8, fontSize: 11, padding: '3px 6px', width: '100%' }}
                  >
                    {p.models.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '6px', fontSize: 12 }}
                    onClick={() => connectProvider(p.id)}
                  >
                    {isConnected ? 'Update Key' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  void labelStyle; void rowStyle; // suppress unused warning
}
