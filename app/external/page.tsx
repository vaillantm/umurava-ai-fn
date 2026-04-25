'use client';

import Link from 'next/link';
import { ChangeEvent, DragEvent, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { createCandidate, uploadCsv, uploadJson, uploadPdf, type CandidateRecord } from '@/lib/api';
import { showToast } from '@/lib/toast';

type Mode = 'upload' | 'csv' | 'pdf' | 'manual';

export default function ExternalPage() {
  const [mode, setMode] = useState<Mode>('upload');
  const [jsonCandidates, setJsonCandidates] = useState<CandidateRecord[]>([]);
  const [csvCandidates, setCsvCandidates] = useState<CandidateRecord[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [manualCount, setManualCount] = useState(0);

  const importCandidates = async (items: CandidateRecord[]) => {
    showToast(`${items.length} candidates added to pool!`, 'success');
    window.location.assign('/candidates');
  };

  const readJSON = async (file: File) => {
    try {
      const imported = await uploadJson(file);
      setJsonCandidates(imported);
    } catch {
      showToast('Invalid JSON file. Please check the format.', 'info');
    }
  };

  const readCSV = async (file: File) => {
    try {
      const imported = await uploadCsv(file);
      setCsvCandidates(imported);
    } catch {
      showToast('Could not parse the CSV file.', 'info');
    }
  };

  const addPdfFiles = (files: File[]) => setPdfFiles((current) => [...current, ...files]);

  const parsePDFs = async () => {
    const imports: CandidateRecord[] = [];
    for (const file of pdfFiles) {
      const parsed = await uploadPdf(file);
      imports.push(...parsed);
    }
    setPdfFiles([]);
    setJsonCandidates([]);
    setCsvCandidates([]);
    await importCandidates(imports);
    showToast(`${imports.length} PDF${imports.length !== 1 ? 's' : ''} parsed and added to pool!`, 'success');
  };

  const onDrop = (event: DragEvent<HTMLDivElement>, kind: 'json' | 'csv' | 'pdf') => {
    event.preventDefault();
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
      actions={<Link className="btn btn-ghost btn-sm" href="/candidates">View Candidate Pool</Link>}
    >
      <div className="page-header">
        <div className="page-title">
          Bulk CV Upload <span>Add candidates to screening pool</span>
        </div>
        <Link className="btn btn-ghost btn-sm" href="/candidates">
          View Pool
        </Link>
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
              or click to browse - accepts <code style={{ background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>.json</code> files with candidate arrays
            </div>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => document.getElementById('json-file-input')?.click()}>
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
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{jsonCandidates.length} candidates parsed</div>
              </div>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => void importCandidates(jsonCandidates)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  add_circle
                </span>{' '}
                Add to Pool
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
              Accepts <code style={{ background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>.csv</code> files with one row per candidate
            </div>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => document.getElementById('csv-file-input')?.click()}>
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
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ready to import</div>
              </div>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => void importCandidates(csvCandidates)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  add_circle
                </span>{' '}
                Add to Pool
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
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Upload multiple .pdf files - the backend upload endpoint will parse each resume.</div>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => document.getElementById('pdf-file-input')?.click()}>
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
                Parse with AI & Add to Pool
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === 'manual' ? (
        <div className="mode-panel active">
          <div className="form-section">
            <div className="form-section-title">Manual Entry</div>
            <p className="settings-desc">Quick mock entry to add a blank profile.</p>
            <button
              className="btn btn-primary"
              type="button"
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
                  window.location.assign('/candidates');
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
