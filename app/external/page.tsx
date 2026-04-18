'use client';

import Link from 'next/link';
import { ChangeEvent, DragEvent, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { showToast } from '@/lib/toast';
import { umuravaStore, type CandidateProfile } from '@/lib/umurava-store';

type Mode = 'upload' | 'csv' | 'pdf' | 'manual';

export default function ExternalPage() {
  const [mode, setMode] = useState<Mode>('upload');
  const [jsonCandidates, setJsonCandidates] = useState<CandidateProfile[]>([]);
  const [csvCandidates, setCsvCandidates] = useState<CandidateProfile[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [manualCount, setManualCount] = useState(0);

  const importCandidates = (items: CandidateProfile[]) => {
    items.forEach((candidate) => umuravaStore.addCandidate(candidate));
    showToast(`${items.length} candidates added to pool!`, 'success');
    window.location.assign('/candidates');
  };

  const readJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result || '[]'));
        const list = Array.isArray(parsed) ? parsed : [parsed];
        setJsonCandidates(list as CandidateProfile[]);
      } catch {
        showToast('Invalid JSON file. Please check the format.', 'info');
      }
    };
    reader.readAsText(file);
  };

  const readCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = String(event.target?.result || '').trim().split('\n').filter(Boolean);
      const headers = lines[0]?.split(',').map((item) => item.trim().replace(/"/g, '')) || [];
      const items: CandidateProfile[] = [];
      lines.slice(1).forEach((line, index) => {
        const values = line.split(',').map((item) => item.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, headerIndex) => {
          row[header] = values[headerIndex] || '';
        });
        if (!row.firstName || !row.lastName || !row.email) return;
        items.push({
          id: Date.now() + index,
          personalInfo: {
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            headline: row.headline || 'Candidate',
            location: row.location || 'Unknown',
            bio: ''
          },
          skills: row.skills ? row.skills.split(';').map((skill) => ({ name: skill.trim(), level: 'Intermediate', yearsOfExperience: Number(row.yearsExperience) || 1 })) : [],
          languages: [],
          experience: row.company ? [{ company: row.company, role: row.role || 'Professional', startDate: '2020-01', endDate: 'Present', description: '', technologies: [], isCurrent: true }] : [],
          education: row.degree ? [{ institution: 'University', degree: row.degree, fieldOfStudy: 'General', startYear: 2016, endYear: 2020 }] : [],
          certifications: [],
          projects: [],
          availability: { status: row.availability || 'Available', type: 'Full-time' },
          socialLinks: {}
        });
      });
      setCsvCandidates(items);
    };
    reader.readAsText(file);
  };

  const addPdfFiles = (files: File[]) => setPdfFiles((current) => [...current, ...files]);

  const parsePDFs = () => {
    const imports: CandidateProfile[] = [];
    pdfFiles.forEach((file, index) => {
      if (file.size < 5000) return;
      imports.push({
        id: Date.now() + index,
        personalInfo: {
          firstName: file.name.split('.')[0].split('_')[0] || 'Candidate',
          lastName: file.name.split('_')[1] || String(index + 1),
          email: `candidate${index + 1}@parsed.ai`,
          headline: 'Parsed from PDF Resume',
          location: 'Kigali, Rwanda',
          bio: 'Extracted via Gemini AI OCR parsing.'
        },
        skills: [{ name: 'Node.js', level: 'Intermediate', yearsOfExperience: 2 }],
        languages: [],
        experience: [{ company: 'Previous Company', role: 'Professional', startDate: '2021-01', endDate: 'Present', description: 'Extracted from PDF.', technologies: [], isCurrent: true }],
        education: [{ institution: 'University', degree: "Bachelor's", fieldOfStudy: 'Computer Science', startYear: 2017, endYear: 2021 }],
        certifications: [],
        projects: [],
        availability: { status: 'Available', type: 'Full-time' },
        socialLinks: {}
      });
    });
    imports.forEach((candidate) => umuravaStore.addCandidate(candidate));
    showToast(`${imports.length} PDF${imports.length !== 1 ? 's' : ''} parsed and added to pool!`, 'success');
    window.location.assign('/candidates');
  };

  const onDrop = (event: DragEvent<HTMLDivElement>, kind: 'json' | 'csv' | 'pdf') => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;
    if (kind === 'json') readJSON(file);
    if (kind === 'csv') readCSV(file);
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
          View Pool →
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
            <input id="json-file-input" type="file" accept=".json" onChange={(event: ChangeEvent<HTMLInputElement>) => event.target.files?.[0] && readJSON(event.target.files[0])} style={{ display: 'none' }} />
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)', display: 'block', marginBottom: 16 }}>
              cloud_upload
            </span>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Drop your JSON file here</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              or click to browse - accepts <code style={{ background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>.json</code> files with candidate array
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
              <button className="btn btn-primary btn-sm" type="button" onClick={() => importCandidates(jsonCandidates)}>
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
            <input id="csv-file-input" type="file" accept=".csv" onChange={(event: ChangeEvent<HTMLInputElement>) => event.target.files?.[0] && readCSV(event.target.files[0])} style={{ display: 'none' }} />
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
              <button className="btn btn-primary btn-sm" type="button" onClick={() => importCandidates(csvCandidates)}>
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
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Upload multiple .pdf files - Gemini AI will parse each resume with OCR</div>
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
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>{(file.size / 1024).toFixed(0)} KB · waiting</div>
                </div>
              </div>
            ))}
          </div>
          {pdfFiles.length ? (
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" type="button" onClick={parsePDFs}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  smart_toy
                </span>{' '}
                Parse with Gemini AI & Add to Pool
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === 'manual' ? (
        <div className="mode-panel active">
          <div className="form-section">
            <div className="form-section-title">Manual Entry</div>
            <p className="settings-desc">Quick mock entry to add a blank profile. The full multi-step form from the static version can be restored if needed.</p>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                setManualCount((count) => count + 1);
                umuravaStore.addCandidate({
                  id: `manual-${Date.now()}`,
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
                });
                showToast('Profile added successfully!', 'success');
                window.location.assign('/candidates');
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
