'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { getSettings, updateSettings, type AuthUser } from '@/lib/backend';
import { showToast } from '@/lib/toast';

type SettingsState = NonNullable<AuthUser['settings']>;

const DEFAULT_SETTINGS: SettingsState = {
  primaryModel: 'gemini-2.5-pro',
  batchOutput: true,
  explainableStructuring: true,
  biasDetection: true,
  promptContext: ''
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSettings().then((loaded) => setSettings({ ...DEFAULT_SETTINGS, ...loaded }));
  }, []);

  async function handleSave() {
    setBusy(true);
    try {
      const saved = await updateSettings(settings);
      setSettings({ ...DEFAULT_SETTINGS, ...saved });
      showToast('AI settings saved.', 'success');
    } catch {
      showToast('Could not save settings.', 'info');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      activeSidebar="settings"
      navLinks={<div />}
      actions={
        <Link className="btn btn-ghost btn-sm" href="/">
          Logout
        </Link>
      }
    >
      <div className="page-header">
        <div className="page-title">Recruiter Settings</div>
      </div>
      <div className="settings-content">
        <div className="settings-section">
          <div className="settings-label">Primary AI Model</div>
          <div className="settings-desc">Select the Gemini model used for parsing resumes and generating structured explanations.</div>
          <select style={{ width: '100%', maxWidth: 320 }} value={settings.primaryModel} onChange={(event) => setSettings((current) => ({ ...current, primaryModel: event.target.value }))}>
            <option value="gemini-2.5-pro">gemini-2.5-pro</option>
            <option value="gemini-1.5-pro">gemini-1.5-pro</option>
            <option value="gemini-1.5-flash">gemini-1.5-flash</option>
            <option value="gemini-2.0-flash">gemini-2.0-flash</option>
          </select>
        </div>
        <div className="settings-section">
          <div className="settings-label">AI Pipeline Toggles</div>
          <div className="settings-desc">Control how the screening engine operates across multiple candidates.</div>
          {[
            ['batchOutput', 'Multi-candidate Batch Output', 'Force AI to evaluate and rank all candidates into a single JSON response'],
            ['explainableStructuring', 'Explainable Structuring', 'Require strengths, gaps, and relevance notes for every scored candidate'],
            ['biasDetection', 'Bias Detection Filter', 'Flag potentially biased demographic screening patterns for human review']
          ].map(([key, label, desc]) => (
            <div className="toggle-wrap" key={String(key)}>
              <div className="toggle-info">
                <div className="label">{label}</div>
                <div className="desc">{desc}</div>
              </div>
              <div className={`toggle ${settings[key as keyof SettingsState] ? 'on' : ''}`} onClick={() => setSettings((current) => ({ ...current, [key]: !current[key as keyof SettingsState] }))} />
            </div>
          ))}
        </div>
        <div className="settings-section">
          <div className="settings-label">Prompt Engineering Context</div>
          <div className="settings-desc">
            Customize the system instructions sent to Gemini. Use <code style={{ background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{'{{job}}'}</code> and{' '}
            <code style={{ background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{'{{candidates}}'}</code> variables.
          </div>
          <textarea
            rows={5}
            style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, lineHeight: 1.7 }}
            value={settings.promptContext}
            onChange={(event) => setSettings((current) => ({ ...current, promptContext: event.target.value }))}
          />
          <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={handleSave} disabled={busy}>
            {busy ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
