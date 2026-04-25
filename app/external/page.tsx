'use client';

import Link from 'next/link';
import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { listJobs, uploadJson, type CandidateRecord, type JobRecord } from '@/lib/api';
import { showToast } from '@/lib/toast';

export default function ExternalPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [activeJobId, setActiveJobId] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [jsonCandidates, setJsonCandidates] = useState<CandidateRecord[]>([]);

  useEffect(() => {
    let alive = true;
    listJobs()
      .then((items) => {
        if (!alive) return;
        setJobs(items);
        setActiveJobId(items[0]?.id || '');
      })
      .finally(() => {
        if (alive) setLoadingJobs(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const activeJob = useMemo(() => jobs.find((job) => String(job.id) === String(activeJobId)) || null, [activeJobId, jobs]);

  const requireJob = () => {
    if (!activeJobId) {
      showToast('Select a job before uploading JSON.', 'info');
      return false;
    }
    return true;
  };

  const normalizePayload = (raw: unknown) => {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      if (Array.isArray(obj.candidates)) return obj.candidates;
      if (Array.isArray(obj.data)) return obj.data;
      if (obj.personalInfo) return obj;
    }
    return raw;
  };

  const handleUpload = async (raw: unknown) => {
    if (!requireJob()) return;
    try {
      const imported = await uploadJson(normalizePayload(raw), activeJobId);
      setJsonCandidates(imported);
      showToast(`Uploaded ${imported.length || 1} candidate${(imported.length || 1) !== 1 ? 's' : ''} for ${activeJob?.title || 'the selected job'}.`, 'success');
    } catch {
      showToast('Could not upload the JSON payload.', 'info');
    }
  };

  const readJSON = async (file: File) => {
    try {
      const text = await file.text();
      setJsonText(text);
      await handleUpload(JSON.parse(text));
    } catch {
      showToast('Invalid JSON file. Please check the format.', 'info');
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) void readJSON(file);
  };

  const uploadText = async () => {
    try {
      await handleUpload(JSON.parse(jsonText));
    } catch {
      showToast('Paste a valid JSON object or array before uploading.', 'info');
    }
  };

  return (
    <AppShell
      activeSidebar="external"
      navLinks={<div className="nav-link active">Bulk CV Upload</div>}
      actions={<Link className="btn btn-ghost btn-sm" href="/jobs">Choose Job</Link>}
    >
      <div className="page-header">
        <div className="page-title">
          Bulk CV Upload <span>{activeJob ? `For ${activeJob.title}` : 'Select a job first'}</span>
        </div>
        <select
          value={activeJobId}
          onChange={(event) => setActiveJobId(event.target.value)}
          style={{ minWidth: 280, padding: '8px 12px' }}
          disabled={loadingJobs || !jobs.length}
        >
          <option value="">{loadingJobs ? 'Loading jobs...' : 'Select a job...'}</option>
          {jobs.map((job) => (
            <option key={String(job.id)} value={String(job.id)}>
              {job.title} {job.company ? `- ${job.company}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="shortlist-banner" style={{ marginBottom: 24 }}>
        <span className="material-symbols-outlined">info</span>
        <div>
          <strong>JSON upload now posts the actual JSON content</strong>
          <p>Pick a job first, then paste a candidate object or JSON array, or upload a `.json` file. The payload is serialized and sent as the multipart `file` field.</p>
        </div>
      </div>

      <div className="mode-panel active">
        <div className="upload-zone" onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
          <input
            id="json-file-input"
            type="file"
            accept=".json"
            onChange={(event: ChangeEvent<HTMLInputElement>) => event.target.files?.[0] && void readJSON(event.target.files[0])}
            style={{ display: 'none' }}
          />
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)', display: 'block', marginBottom: 16 }}>
            cloud_upload
          </span>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Drop your JSON file here</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            or paste a candidate object or array below
          </div>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => document.getElementById('json-file-input')?.click()} disabled={!activeJobId}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              folder_open
            </span>{' '}
            Browse File
          </button>
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label>Paste JSON</label>
          <textarea
            rows={10}
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            placeholder='Paste a single candidate object like { "personalInfo": { ... } } or a JSON array like [ { ... }, { ... } ]'
          />
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => void uploadText()} disabled={!activeJobId || !jsonText.trim()}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                cloud_upload
              </span>{' '}
              Upload JSON
            </button>
          </div>
        </div>

        {jsonCandidates.length ? (
          <div className="upload-result">
            <span className="material-symbols-outlined" style={{ color: 'var(--green)', fontSize: 24 }}>
              check_circle
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{jsonCandidates.length} candidate{jsonCandidates.length !== 1 ? 's' : ''} loaded</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Ready for {activeJob?.title || 'the selected job'}.
              </div>
            </div>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => window.location.assign(`/candidates?jobId=${activeJobId}`)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                add_circle
              </span>{' '}
              Continue
            </button>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
