'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ChangeEvent, type DragEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { createCandidate, listJobs, uploadBulkPdf, uploadCsv, uploadJson, type CandidateRecord, type JobRecord } from '@/lib/api';
import { showToast } from '@/lib/toast';

type Mode = 'upload' | 'csv' | 'pdf' | 'manual';

export default function ExternalPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('upload');
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [activeJobId, setActiveJobId] = useState('');
  const [jsonCandidates, setJsonCandidates] = useState<CandidateRecord[]>([]);
  const [csvCandidates, setCsvCandidates] = useState<CandidateRecord[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [manualCount, setManualCount] = useState(0);

  useEffect(() => {
    let alive = true;
    listJobs()
      .then((items) => {
        if (!alive) return;
        setJobs(items);
      })
      .finally(() => {
        if (alive) setLoadingJobs(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const jobId = searchParams.get('jobId') || '';
    if (jobId) setActiveJobId(jobId);
  }, [searchParams]);

  useEffect(() => {
    if (!activeJobId && jobs.length) setActiveJobId(jobs[0].id || '');
  }, [activeJobId, jobs]);

  const activeJob = useMemo(
    () => jobs.find((job) => String(job.id) === String(activeJobId)) || null,
    [activeJobId, jobs]
  );

  const requireJob = () => {
    if (!activeJobId) {
      showToast('Select a job before uploading candidates.', 'info');
      return false;
    }
    return true;
  };

  const importCandidates = async (items: CandidateRecord[]) => {
    if (!requireJob()) return;
    showToast(`${items.length} candidates prepared for ${activeJob?.title || 'the selected job'}!`, 'success');
    window.location.assign(`/candidates?jobId=${activeJobId}`);
  };

  const readJSON = async (file: File) => {
    if (!requireJob()) return;
    try {
      const imported = await uploadJson(file, activeJobId);
      setJsonCandidates(imported);
    } catch {
      showToast('Invalid JSON file. Please check the format.', 'info');
    }
  };

  const readCSV = async (file: File) => {
    if (!requireJob()) return;
    try {
      const imported = await uploadCsv(file, activeJobId);
      setCsvCandidates(imported);
    } catch {
      showToast('Could not parse the CSV file.', 'info');
    }
  };

  const addPdfFiles = (files: File[]) => {
    if (!requireJob()) return;
    setPdfFiles((current) => [...current, ...files]);
  };

  const parsePDFs = async () => {
    if (!requireJob()) return;
    const imports = await uploadBulkPdf(pdfFiles, activeJobId);
    setPdfFiles([]);
    setJsonCandidates([]);
    setCsvCandidates([]);
    await importCandidates(imports);
    showToast(`${imports.length} PDF${imports.length !== 1 ? 's' : ''} parsed and prepared for the job!`, 'success');
  };

  const onDrop = (event: DragEvent<HTMLDivElement>, kind: 'json' | 'csv' | 'pdf') => {
    event.preventDefault();
    if (!activeJobId) {
      showToast('Select a job first.', 'info');
      return;
    }
    const file = event.dataTransfer.files[0];
    if (!file) return;
    if (kind === 'json') void readJSON(file);
    if (kind === 'csv') void readCSV(file);
    if (kind === 'pdf' && file.type === 'application/pdf') addPdfFiles([file]);
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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={activeJobId}
            onChange={(event) => setActiveJobId(event.target.value)}
            style={{ minWidth: 260, padding: '8px 12px' }}
            disabled={loadingJobs || !jobs.length}
          >
            <option value="">{loadingJobs ? 'Loading jobs...' : 'Select a job...'}</option>
            {jobs.map((job) => (
              <option key={String(job.id)} value={String(job.id)}>
                {job.title} {job.company ? `- ${job.company}` : ''}
              </option>
            ))}
          </select>
          <Link className="btn btn-ghost btn-sm" href="/jobs">
            Manage Jobs
          </Link>
        </div>
      </div>

      <div className="shortlist-banner" style={{ marginBottom: 24 }}>
        <span className="material-symbols-outlined">info</span>
        <div>
          <strong>Uploads are job-scoped now</strong>
          <p>Pick a job first, then import JSON, CSV, or PDFs. The backend receives `jobId` with every upload.</p>
        </div>
      </div>

      <div className="mode-tabs">
        {[
          ['upload', 'Upload JSON', 'upload_file'],
          ['csv', 'Upload CSV', 'table_chart'],
          ['pdf', 'Upload PDF Resumes', 'picture_as_pdf'],
          ['manual', 'Manual Entry', 'edit_note']
        ].map(([key, label, icon]) => (
          <div key={key} className={`mode-tab ${mode === key ? 'active' : ''}`} onClick={() => setMode(key as Mode)}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {icon}
            </span>{' '}
            {label}
          </div>
        ))}
      </div>

      {mode === 'upload' ? (
        <div className="mode-panel active">
          <div className="upload-zone" onDrop={(event) => onDrop(event, 'json')} onDragOver={(event) => event.preventDefault()}>
            <input id="json-file-input" type="file" accept=".json" onChange={(event: ChangeEvent<HTMLInputElement>) => event.target.files?.[0] && void readJSON(event.target.files[0])} style={{ display: 'none' }} />
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)', display: 'block', marginBottom: 16 }}>
              cloud_upload
            </span>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Drop your JSON file here</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              or click to browse - the file will be imported into the selected job
            </div>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => document.getElementById('json-file-input')?.click()} disabled={!activeJobId}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                folder_open
              </span>{' '}
              Browse File
            </button>
          </div>
          {jsonCandidates.length ? (
            <div className="upload-result">
              <span className="material-symbols-outlined" style={{ color: 'var(--green)', fontSize: 24 }}>
                check_circle
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{jsonCandidates.length} candidate file loaded</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{jsonCandidates.length} candidates parsed for {activeJob?.title || 'the selected job'}</div>
              </div>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => void importCandidates(jsonCandidates)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  add_circle
                </span>{' '}
                Continue to Screening
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === 'csv' ? (
        <div className="mode-panel active">
          <div className="upload-zone" onDrop={(event) => onDrop(event, 'csv')} onDragOver={(event) => event.preventDefault()}>
            <input id="csv-file-input" type="file" accept=".csv" onChange={(event: ChangeEvent<HTMLInputElement>) => event.target.files?.[0] && void readCSV(event.target.files[0])} style={{ display: 'none' }} />
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)', display: 'block', marginBottom: 16 }}>
              table_chart
            </span>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Drop your CSV file here</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Candidate rows will be imported into the selected job.
            </div>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => document.getElementById('csv-file-input')?.click()} disabled={!activeJobId}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                folder_open
              </span>{' '}
              Browse File
            </button>
          </div>
          {csvCandidates.length ? (
            <div className="upload-result">
              <span className="material-symbols-outlined" style={{ color: 'var(--green)', fontSize: 24 }}>
                check_circle
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{csvCandidates.length} valid rows parsed</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ready for {activeJob?.title || 'the selected job'}</div>
              </div>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => void importCandidates(csvCandidates)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  add_circle
                </span>{' '}
                Continue to Screening
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === 'pdf' ? (
        <div className="mode-panel active">
          <div className="upload-zone" onDrop={(event) => onDrop(event, 'pdf')} onDragOver={(event) => event.preventDefault()}>
            <input id="pdf-file-input" type="file" accept=".pdf" multiple onChange={(event: ChangeEvent<HTMLInputElement>) => addPdfFiles(Array.from(event.target.files || []))} style={{ display: 'none' }} />
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)', display: 'block', marginBottom: 16 }}>
              picture_as_pdf
            </span>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Drop PDF resumes here</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Upload one or more PDFs for the selected job.
            </div>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => document.getElementById('pdf-file-input')?.click()} disabled={!activeJobId}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                folder_open
              </span>{' '}
              Browse PDFs
            </button>
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pdfFiles.map((file) => (
              <div key={`${file.name}-${file.size}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                  PDF
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>{(file.size / 1024).toFixed(0)} KB - waiting</div>
                </div>
              </div>
            ))}
          </div>
          {pdfFiles.length ? (
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" type="button" onClick={() => void parsePDFs()}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  smart_toy
                </span>{' '}
                Parse with AI & Add to Job
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === 'manual' ? (
        <div className="mode-panel active">
          <div className="form-section">
            <div className="form-section-title">Manual Entry</div>
            <p className="settings-desc">Quick mock entry to add a blank profile into the selected job flow.</p>
            <button
              className="btn btn-primary"
              type="button"
              disabled={!activeJobId}
              onClick={() => {
                setManualCount((count) => count + 1);
                void createCandidate({
                  id: `manual-${Date.now()}`,
                  source: 'manual',
                  personalInfo: {
                    firstName: 'Manual',
                    lastName: `Candidate ${manualCount + 1}`,
                    email: `manual${manualCount + 1}@umurava.ai`,
                    headline: 'Manually added candidate',
                    location: 'Unknown',
                    bio: ''
                  },
                  skills: [{ name: 'Communication', level: 'Intermediate', yearsOfExperience: 1 }],
                  languages: [],
                  experience: [{ company: 'N/A', role: 'N/A', startDate: '2024-01', endDate: 'Present', description: 'Manually added placeholder.', technologies: [], isCurrent: true }],
                  education: [],
                  certifications: [],
                  projects: [],
                  availability: { status: 'Available', type: 'Full-time' },
                  socialLinks: {}
                } as CandidateRecord).then(() => {
                  showToast('Profile added successfully!', 'success');
                  window.location.assign(`/candidates?jobId=${activeJobId}`);
                });
              }}
            >
              Add Placeholder Candidate
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
