'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { showToast } from '@/lib/toast';

export default function SettingsPage() {
  const [batchOutput, setBatchOutput] = useState(true);
  const [explainable, setExplainable] = useState(true);
  const [biasDetection, setBiasDetection] = useState(false);

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
          <select style={{ width: '100%', maxWidth: 320 }}>
            <option>gemini-1.5-pro (Recommended)</option>
            <option>gemini-1.5-flash</option>
            <option>gemini-2.0-flash</option>
          </select>
        </div>
        <div className="settings-section">
          <div className="settings-label">AI Pipeline Toggles</div>
          <div className="settings-desc">Control how the screening engine operates across multiple candidates.</div>
          <div className="toggle-wrap">
            <div className="toggle-info">
              <div className="label">Multi-candidate Batch Output</div>
              <div className="desc">Force AI to evaluate and rank all candidates into a single JSON response</div>
            </div>
            <div className={`toggle ${batchOutput ? 'on' : ''}`} onClick={() => setBatchOutput((value) => !value)} />
          </div>
          <div className="toggle-wrap">
            <div className="toggle-info">
              <div className="label">Explainable Structuring</div>
              <div className="desc">Require strengths, gaps, and relevance notes for every scored candidate</div>
            </div>
            <div className={`toggle ${explainable ? 'on' : ''}`} onClick={() => setExplainable((value) => !value)} />
          </div>
          <div className="toggle-wrap">
            <div className="toggle-info">
              <div className="label">Bias Detection Filter</div>
              <div className="desc">Flag potentially biased demographic screening patterns for human review</div>
            </div>
            <div className={`toggle ${biasDetection ? 'on' : ''}`} onClick={() => setBiasDetection((value) => !value)} />
          </div>
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
            defaultValue={`You are an expert HR AI assistant evaluating multiple candidates. Given this job description:
{{job}}

Evaluate the following extracted candidate data:
{{candidates}}

Return a ranked JSON array strictly adhering to this schema: {id, score (0-100), strengths[], gaps[], reasoning}.`}
          />
          <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => showToast('AI Prompts saved!', 'success')}>
            Save Configuration
          </button>
        </div>
      </div>
    </AppShell>
  );
}
