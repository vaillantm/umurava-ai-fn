export type CandidateSkill = {
  name: string;
  level: string;
  yearsOfExperience: number;
};

export type CandidateLanguage = {
  name: string;
  proficiency: string;
};

export type CandidateExperience = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies?: string[];
  isCurrent?: boolean;
};

export type CandidateEducation = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
};

export type CandidateCertification = {
  name: string;
  issuer: string;
  issueDate: string;
};

export type CandidateProject = {
  name: string;
  description: string;
  technologies?: string[];
  role: string;
  link?: string;
  startDate: string;
  endDate: string;
};

export type CandidateProfile = {
  id: string | number;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    headline: string;
    bio: string;
    location: string;
  };
  skills: CandidateSkill[];
  languages: CandidateLanguage[];
  experience: CandidateExperience[];
  education: CandidateEducation[];
  certifications: CandidateCertification[];
  projects: CandidateProject[];
  availability: {
    status: string;
    type: string;
    startDate?: string;
  };
  socialLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  source?: string;
  incompleteReason?: string;
  reasoning?: string;
  score?: number;
  scoreBreakdown?: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
    certifications: number;
  };
  scores?: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
  };
  strengths?: string[];
  gaps?: string[];
  workflowStatus?: string;
  decision?: string;
  rank?: number;
  shortlistLabel?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  shortlistSize: number;
  description: string;
  requiredSkills: string[];
  idealCandidateProfile: string;
  aiWeights: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
    certifications: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ScreeningResult = CandidateProfile & {
  score: number;
  scoreBreakdown: NonNullable<CandidateProfile['scoreBreakdown']>;
  strengths: string[];
  gaps: string[];
  workflowStatus: string;
  decision: string;
  rank: number;
  shortlistLabel: string;
};

type Screening = {
  id: string;
  jobId: string;
  shortlistedCount: number;
  shortlistSize: number;
  totalCandidates: number;
  incompleteCount: number;
  averageScore: number;
  results: ScreeningResult[];
  incompleteCandidates: Array<{ candidateId: string | number; reason: string }>;
  generatedBy: string;
  createdAt: string;
};

type StoreState = {
  jobs: Job[];
  activeJobId: string;
  candidates: CandidateProfile[];
  screenings: Screening[];
  currentScreeningId: string | null;
  interviewQueue: string[];
  settings: {
    primaryModel: string;
    batchOutput: boolean;
    explainableStructuring: boolean;
    biasDetection: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

type GenerateProfileInput = {
  firstName?: string | FormDataEntryValue | null;
  lastName?: string | FormDataEntryValue | null;
  email?: string | FormDataEntryValue | null;
  headline?: string | FormDataEntryValue | null;
  bio?: string | FormDataEntryValue | null;
  location?: string | FormDataEntryValue | null;
  skills?: CandidateSkill[];
  languages?: CandidateLanguage[];
  experience?: CandidateExperience[];
  education?: CandidateEducation[];
  certifications?: CandidateCertification[];
  projects?: CandidateProject[];
  availability_status?: string | FormDataEntryValue | null;
  availability_type?: string | FormDataEntryValue | null;
  availability_startDate?: string | FormDataEntryValue | null;
  linkedin?: string | FormDataEntryValue | null;
  github?: string | FormDataEntryValue | null;
  portfolio?: string | FormDataEntryValue | null;
};

const STORAGE_KEY = 'umurava.store.v1';

const DEFAULT_JOB: Job = {
  id: 'job-senior-backend-001',
  title: 'Senior Backend Engineer',
  department: 'Engineering',
  location: 'Kigali, Rwanda / Remote',
  employmentType: 'Full-time',
  experienceLevel: 'Mid-level (3-5 yrs)',
  shortlistSize: 20,
  description: 'We are looking for a Senior Backend Engineer to design and maintain scalable APIs.',
  requiredSkills: ['Node.js', 'TypeScript', 'MongoDB', 'REST APIs', 'Docker', 'PostgreSQL'],
  idealCandidateProfile:
    'Ideal candidate has 5+ years of Node.js experience, strong distributed systems knowledge, and comfort working in an agile startup environment.',
  aiWeights: {
    skills: 40,
    experience: 30,
    education: 15,
    projects: 10,
    certifications: 5
  },
  status: 'active',
  createdAt: '2026-04-18T10:00:00.000Z',
  updatedAt: '2026-04-18T10:00:00.000Z'
};

const baseProfiles = [
  {
    personalInfo: {
      firstName: 'Alice',
      lastName: 'Uwimana',
      email: 'alice.uwimana@andela.com',
      headline: 'Senior Backend Engineer · Node.js & AI Systems',
      bio: 'Experienced backend leader with expertise in scalable microservices and AI integrations.',
      location: 'Kigali, Rwanda'
    },
    skills: [
      { name: 'Node.js', level: 'Expert', yearsOfExperience: 6 },
      { name: 'TypeScript', level: 'Advanced', yearsOfExperience: 5 },
      { name: 'MongoDB', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'Docker', level: 'Advanced', yearsOfExperience: 3 },
      { name: 'Redis', level: 'Intermediate', yearsOfExperience: 2 }
    ],
    languages: [
      { name: 'English', proficiency: 'Fluent' },
      { name: 'Kinyarwanda', proficiency: 'Native' }
    ],
    experience: [
      {
        company: 'Andela',
        role: 'Senior Backend Engineer',
        startDate: '2022-01',
        endDate: 'Present',
        description: 'Led microservices migration for talent marketplace. Reduced latency 40%.',
        technologies: ['Node.js', 'Express', 'MongoDB'],
        isCurrent: true
      },
      {
        company: 'Kasha Rwanda',
        role: 'Backend Engineer',
        startDate: '2019-06',
        endDate: '2021-12',
        description: 'Built e-commerce APIs and payment integrations.',
        technologies: ['Node.js', 'MongoDB'],
        isCurrent: false
      }
    ],
    education: [
      {
        institution: 'University of Rwanda',
        degree: "Bachelor's",
        fieldOfStudy: 'Computer Science',
        startYear: 2016,
        endYear: 2020
      }
    ],
    certifications: [{ name: 'AWS Certified Developer', issuer: 'Amazon', issueDate: '2023-03' }],
    projects: [
      {
        name: 'Talent Marketplace API',
        description: 'Scalable backend for 50k+ users',
        technologies: ['Node.js', 'MongoDB'],
        role: 'Tech Lead',
        link: 'https://github.com/alice/talent-api',
        startDate: '2022-01',
        endDate: 'Present'
      }
    ],
    availability: { status: 'Available', type: 'Full-time', startDate: '2024-05-01' },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/aliceuwimana',
      github: 'https://github.com/aliceuwimana',
      portfolio: 'https://alice.dev'
    }
  },
  {
    personalInfo: {
      firstName: 'Eric',
      lastName: 'Nkurunziza',
      email: 'eric.nku@cloudtech.co.ke',
      headline: 'Full Stack Engineer · TypeScript & Cloud',
      bio: 'Cloud-native developer specializing in AWS and scalable applications.',
      location: 'Nairobi, Kenya'
    },
    skills: [
      { name: 'TypeScript', level: 'Advanced', yearsOfExperience: 5 },
      { name: 'Node.js', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'PostgreSQL', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'AWS', level: 'Advanced', yearsOfExperience: 3 }
    ],
    languages: [
      { name: 'English', proficiency: 'Fluent' },
      { name: 'Swahili', proficiency: 'Native' }
    ],
    experience: [
      {
        company: 'CloudTech Ltd',
        role: 'Full Stack Engineer',
        startDate: '2021-03',
        endDate: 'Present',
        description: 'AWS migrations and Kubernetes deployments.',
        technologies: ['TypeScript', 'Node.js'],
        isCurrent: true
      }
    ],
    education: [
      {
        institution: 'Strathmore University',
        degree: 'BSc',
        fieldOfStudy: 'Computer Science',
        startYear: 2017,
        endYear: 2021
      }
    ],
    certifications: [{ name: 'AWS Certified Developer Associate', issuer: 'Amazon', issueDate: '2023-08' }],
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Serverless AWS app with Lambda.',
        technologies: ['AWS Lambda', 'TypeScript'],
        role: 'Full Stack',
        startDate: '2022-06',
        endDate: '2023-02'
      }
    ],
    availability: { status: 'Open to Opportunities', type: 'Full-time', startDate: '2024-06-01' },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/ericnku',
      github: 'https://github.com/ericnku'
    }
  },
  {
    personalInfo: {
      firstName: 'Grace',
      lastName: 'Mutoni',
      email: 'grace.mutoni@designlab.rw',
      headline: 'Product Designer · Systems Thinking & Research',
      bio: 'Product designer with strong UX research, design systems, and prototyping practice.',
      location: 'Kigali, Rwanda'
    },
    skills: [
      { name: 'Figma', level: 'Expert', yearsOfExperience: 6 },
      { name: 'User Research', level: 'Advanced', yearsOfExperience: 5 },
      { name: 'Design Systems', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'Prototyping', level: 'Advanced', yearsOfExperience: 5 }
    ],
    languages: [{ name: 'English', proficiency: 'Fluent' }],
    experience: [
      {
        company: 'Design Lab Rwanda',
        role: 'Product Designer',
        startDate: '2020-02',
        endDate: 'Present',
        description: 'Led design ops and product discovery for B2B SaaS products.',
        technologies: ['Figma', 'Miro'],
        isCurrent: true
      }
    ],
    education: [
      {
        institution: 'ALU',
        degree: 'BA',
        fieldOfStudy: 'Design',
        startYear: 2015,
        endYear: 2019
      }
    ],
    certifications: [],
    projects: [
      {
        name: 'Recruiter Dashboard',
        description: 'Design system and workflow improvements for an ATS.',
        technologies: ['Figma', 'Design Systems'],
        role: 'Lead Designer',
        link: 'https://example.com',
        startDate: '2023-01',
        endDate: '2023-09'
      }
    ],
    availability: { status: 'Available', type: 'Contract', startDate: '2024-05-15' },
    socialLinks: { linkedin: 'https://linkedin.com/in/gracemutoni', portfolio: 'https://grace.design' }
  },
  {
    personalInfo: {
      firstName: 'David',
      lastName: 'Hakizimana',
      email: 'david.haki@infra.dev',
      headline: 'DevOps Engineer · Cloud Automation',
      bio: 'DevOps specialist focused on CI/CD, infrastructure as code, and observability.',
      location: 'Remote'
    },
    skills: [
      { name: 'Docker', level: 'Expert', yearsOfExperience: 6 },
      { name: 'Kubernetes', level: 'Advanced', yearsOfExperience: 5 },
      { name: 'AWS', level: 'Advanced', yearsOfExperience: 5 },
      { name: 'Terraform', level: 'Advanced', yearsOfExperience: 4 }
    ],
    languages: [{ name: 'English', proficiency: 'Fluent' }],
    experience: [
      {
        company: 'InfraWorks',
        role: 'DevOps Engineer',
        startDate: '2019-05',
        endDate: 'Present',
        description: 'Managed cloud infrastructure, deployments, and monitoring.',
        technologies: ['AWS', 'Kubernetes', 'Terraform'],
        isCurrent: true
      }
    ],
    education: [
      {
        institution: 'University of Kigali',
        degree: 'BSc',
        fieldOfStudy: 'Computer Engineering',
        startYear: 2014,
        endYear: 2018
      }
    ],
    certifications: [
      { name: 'AWS Solutions Architect', issuer: 'Amazon', issueDate: '2022-11' },
      { name: 'CKA', issuer: 'CNCF', issueDate: '2023-05' }
    ],
    projects: [
      {
        name: 'Deployment Platform',
        description: 'Built self-service deployment workflows for engineering teams.',
        technologies: ['Terraform', 'Kubernetes'],
        role: 'Owner',
        startDate: '2021-04',
        endDate: 'Present'
      }
    ],
    availability: { status: 'Open to Opportunities', type: 'Full-time', startDate: '2024-06-01' },
    socialLinks: { github: 'https://github.com/dhakizimana' }
  }
];

const seedNames = [
  ['Michael', 'Okonkwo'],
  ['Amara', 'Diallo'],
  ['Paul', 'Mugabo'],
  ['Aisha', 'Kabore'],
  ['Kwame', 'Asante'],
  ['Zainab', 'Yusuf'],
  ['Emmanuel', 'Niyonzima'],
  ['Fatou', 'Diop'],
  ['Olivier', 'Habimana'],
  ['Nadia', 'Khalil']
];

const locations = ['Accra, Ghana', 'Dakar, Senegal', 'Kampala, Uganda', 'Addis Ababa, Ethiopia', 'Dar es Salaam, Tanzania'];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function normalizeCandidate(profile: Partial<CandidateProfile>): CandidateProfile {
  const normalized = clone(profile) as CandidateProfile;
  normalized.personalInfo = normalized.personalInfo || ({} as CandidateProfile['personalInfo']);
  normalized.skills = Array.isArray(normalized.skills) ? normalized.skills : [];
  normalized.languages = Array.isArray(normalized.languages) ? normalized.languages : [];
  normalized.experience = Array.isArray(normalized.experience) ? normalized.experience : [];
  normalized.education = Array.isArray(normalized.education) ? normalized.education : [];
  normalized.certifications = Array.isArray(normalized.certifications) ? normalized.certifications : [];
  normalized.projects = Array.isArray(normalized.projects) ? normalized.projects : [];
  normalized.availability = normalized.availability || { status: 'Available', type: 'Full-time' };
  normalized.socialLinks = normalized.socialLinks || {};
  normalized.source = normalized.source || 'manual';
  normalized.updatedAt = new Date().toISOString();
  return normalized;
}

function seedCandidates(): CandidateProfile[] {
  const candidates: CandidateProfile[] = [];
  for (let index = 0; index < 24; index += 1) {
    const base = clone(baseProfiles[index % baseProfiles.length]) as CandidateProfile;
    const [firstName, lastName] = seedNames[index % seedNames.length];
    base.id = `cand_${String(index + 1).padStart(3, '0')}`;
    base.personalInfo.firstName = firstName;
    base.personalInfo.lastName = lastName;
    base.personalInfo.email = `candidate${index + 1}@umurava.ai`;
    base.personalInfo.location = locations[index % locations.length];
    base.personalInfo.headline = base.personalInfo.headline.replace(/·.*$/, `· ${base.personalInfo.headline.split('·')[0].trim()}`);
    if (index === 4 || index === 9 || index === 14 || index === 19) {
      base.incompleteReason = 'Incomplete resume structure needs manual review';
      base.projects = [];
      base.certifications = [];
    }
    candidates.push(normalizeCandidate(base));
  }
  return candidates;
}

function defaultState(): StoreState {
  const now = new Date().toISOString();
  return {
    jobs: [clone(DEFAULT_JOB)],
    activeJobId: DEFAULT_JOB.id,
    candidates: seedCandidates(),
    screenings: [],
    currentScreeningId: null,
    interviewQueue: [],
    settings: {
      primaryModel: 'gemini-2.5-pro',
      batchOutput: true,
      explainableStructuring: true,
      biasDetection: true
    },
    createdAt: now,
    updatedAt: now
  };
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function loadState(): StoreState {
  if (!isBrowser()) {
    return defaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    const fallback = defaultState();
    return {
      ...fallback,
      ...parsed,
      jobs: Array.isArray(parsed.jobs) && parsed.jobs.length ? (parsed.jobs as Job[]) : fallback.jobs,
      candidates: Array.isArray(parsed.candidates) && parsed.candidates.length ? (parsed.candidates as CandidateProfile[]) : fallback.candidates,
      screenings: Array.isArray(parsed.screenings) ? (parsed.screenings as Screening[]) : [],
      interviewQueue: Array.isArray(parsed.interviewQueue) ? (parsed.interviewQueue as string[]) : [],
      settings: { ...fallback.settings, ...(parsed.settings || {}) }
    };
  } catch {
    return defaultState();
  }
}

let _state: StoreState | null = null;

function getOrInitState(): StoreState {
  if (!_state) _state = loadState();
  return _state;
}

// proxy so existing `state.x` references still work
const state = new Proxy({} as StoreState, {
  get(_t, key) { return (getOrInitState() as any)[key]; },
  set(_t, key, value) { (getOrInitState() as any)[key] = value; return true; }
});

function persist() {
  state.updatedAt = new Date().toISOString();
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveJob() {
  return state.jobs.find((job) => job.id === state.activeJobId) || state.jobs[0];
}

function setActiveJob(jobId: string) {
  if (state.jobs.some((job) => job.id === jobId)) {
    state.activeJobId = jobId;
    persist();
  }
  return getActiveJob();
}

function getCurrentShortlistSize() {
  return getActiveJob()?.shortlistSize || 10;
}

function setShortlistSize(size: number) {
  const job = getActiveJob();
  if (!job) return null;
  job.shortlistSize = Number(size) || 10;
  job.updatedAt = new Date().toISOString();
  persist();
  return job.shortlistSize;
}

function getCandidates() {
  return state.candidates;
}

function generateFullProfile(formData: GenerateProfileInput): CandidateProfile {
  return normalizeCandidate({
    id: `cand_${Date.now()}`,
    source: 'manual',
    personalInfo: {
      firstName: String(formData.firstName || ''),
      lastName: String(formData.lastName || ''),
      email: String(formData.email || ''),
      headline: String(formData.headline || ''),
      bio: String(formData.bio || ''),
      location: String(formData.location || '')
    },
    skills: formData.skills || [],
    languages: formData.languages || [],
    experience: formData.experience || [],
    education: formData.education || [],
    certifications: formData.certifications || [],
    projects: formData.projects || [],
    availability: {
      status: String(formData.availability_status || 'Available'),
      type: String(formData.availability_type || 'Full-time'),
      startDate: String(formData.availability_startDate || new Date().toISOString().split('T')[0])
    },
    socialLinks: {
      linkedin: String(formData.linkedin || ''),
      github: String(formData.github || ''),
      portfolio: String(formData.portfolio || '')
    }
  });
}

function addCandidate(profile: CandidateProfile) {
  const normalized = normalizeCandidate(profile);
  if (!normalized.id) normalized.id = `cand_${Date.now()}`;
  const email = normalized.personalInfo?.email;
  if (email) {
    state.candidates = state.candidates.filter((candidate) => candidate.personalInfo?.email !== email);
  }
  state.candidates = [...state.candidates, normalized];
  persist();
  return normalized;
}

function upsertJob(jobData: Partial<Job>) {
  const now = new Date().toISOString();
  const payload: Job = {
    ...clone(DEFAULT_JOB),
    ...jobData,
    requiredSkills: Array.isArray(jobData.requiredSkills) ? jobData.requiredSkills : DEFAULT_JOB.requiredSkills,
    aiWeights: { ...DEFAULT_JOB.aiWeights, ...(jobData.aiWeights || {}) },
    updatedAt: now,
    id: jobData.id || `job_${Date.now()}`,
    createdAt: jobData.id ? jobData.createdAt || now : now
  };
  const index = state.jobs.findIndex((job) => job.id === payload.id);
  if (index >= 0) state.jobs[index] = payload;
  else state.jobs.unshift(payload);
  state.activeJobId = payload.id;
  persist();
  return payload;
}

function isIncompleteCandidate(candidate?: CandidateProfile) {
  if (!candidate) return true;
  if (candidate.incompleteReason) return true;
  const required = ['firstName', 'lastName', 'email', 'headline', 'location'] as const;
  const missingRequired = required.filter((key) => !candidate.personalInfo?.[key]);
  if (missingRequired.length) return true;
  if (!candidate.skills?.length) return true;
  if (!candidate.experience?.length) return true;
  return false;
}

function yearsOfExperience(candidate: CandidateProfile) {
  return (candidate.experience || []).reduce((sum, experience) => {
    const start = new Date(experience.startDate);
    const end = experience.endDate === 'Present' ? new Date() : new Date(experience.endDate);
    const delta =
      Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) ? 0 : (Number(end) - Number(start)) / (1000 * 60 * 60 * 24 * 365.25);
    return sum + Math.max(delta, 0);
  }, 0);
}

function scoreCandidate(candidate: CandidateProfile, job: Job, requiredSkills: string[]): ScreeningResult {
  const weights = { ...DEFAULT_JOB.aiWeights, ...(job.aiWeights || {}) };
  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];
  const education = Array.isArray(candidate.education) ? candidate.education : [];
  const projects = Array.isArray(candidate.projects) ? candidate.projects : [];
  const certifications = Array.isArray(candidate.certifications) ? candidate.certifications : [];
  const matchingSkills = skills.filter((skill) => requiredSkills.some((requiredSkill) => requiredSkill.toLowerCase() === skill.name.toLowerCase()));
  const skillScore = Math.min((matchingSkills.length / Math.max(requiredSkills.length, 1)) * weights.skills, weights.skills);
  const expYears = yearsOfExperience(candidate);
  const expScore = Math.min((expYears / 5) * weights.experience, weights.experience);
  const eduScore = education.length > 0 ? weights.education : 0;
  const projectScore = Math.min(projects.length * 3, weights.projects);
  const certScore = Math.min(certifications.length * 2.5, weights.certifications);
  const overall = Math.round(skillScore + expScore + eduScore + projectScore + certScore);
  const strengths = [
    matchingSkills.length ? `${matchingSkills[0].name} proficiency` : 'General technical background',
    expYears > 3 ? 'Relevant industry experience' : 'Potential for growth'
  ];
  const gaps = matchingSkills.length < requiredSkills.length ? ['Some required skills missing'] : [];

  return {
    ...clone(candidate),
    score: overall,
    scoreBreakdown: {
      skills: Math.round(skillScore),
      experience: Math.round(expScore),
      education: Math.round(eduScore),
      projects: Math.round(projectScore),
      certifications: Math.round(certScore)
    },
    scores: {
      skills: Math.round(skillScore),
      experience: Math.round(expScore),
      education: Math.round(eduScore),
      projects: Math.round(projectScore)
    },
    strengths,
    gaps,
    reasoning: `Strong match because of ${matchingSkills.map((skill) => skill.name).join(', ') || 'broad experience'} expertise and ${expYears.toFixed(
      1
    )} years of experience. Education and projects further validate technical depth.`,
    workflowStatus: 'pending',
    decision: 'shortlisted',
    rank: 0,
    shortlistLabel: ''
  };
}

function runScreening(jobId = state.activeJobId, options: { requiredSkills?: string[]; shortlistSize?: number } = {}) {
  const job = state.jobs.find((item) => item.id === jobId) || getActiveJob() || clone(DEFAULT_JOB);
  const shortlistSize = Number(options.shortlistSize || job.shortlistSize || 10);
  const requiredSkills = Array.isArray(options.requiredSkills) && options.requiredSkills.length ? options.requiredSkills : job.requiredSkills;
  const candidates = state.candidates.map(clone);
  const results: ScreeningResult[] = [];
  const incompleteCandidates: Screening['incompleteCandidates'] = [];

  candidates.forEach((candidate) => {
    if (isIncompleteCandidate(candidate)) {
      incompleteCandidates.push({
        candidateId: candidate.id,
        reason: candidate.incompleteReason || 'Missing required resume fields'
      });
      return;
    }
    results.push(scoreCandidate(candidate, job, requiredSkills));
  });

  results.sort((a, b) => b.score - a.score).forEach((candidate, index) => {
    candidate.rank = index + 1;
    candidate.decision = index < shortlistSize ? 'shortlisted' : 'reviewed';
    candidate.shortlistLabel = `Top ${shortlistSize}`;
  });

  const screening: Screening = {
    id: `screen_${Date.now()}`,
    jobId: job.id,
    shortlistedCount: Math.min(shortlistSize, results.length),
    shortlistSize,
    totalCandidates: candidates.length,
    incompleteCount: incompleteCandidates.length,
    averageScore: results.length ? Math.round(results.reduce((sum, candidate) => sum + candidate.score, 0) / results.length) : 0,
    results,
    incompleteCandidates,
    generatedBy: 'gemini-2.5-pro (simulated)',
    createdAt: new Date().toISOString()
  };

  state.screenings.unshift(screening);
  state.currentScreeningId = screening.id;
  persist();
  return screening;
}

function getLatestScreening() {
  return state.screenings[0] || null;
}

function getLatestScreeningResults() {
  return getLatestScreening()?.results || [];
}

function setLatestScreening(screening: Screening) {
  if (!screening) return null;
  state.screenings.unshift(screening);
  state.currentScreeningId = screening.id;
  persist();
  return screening;
}

function getDashboardSummary() {
  const latest = getLatestScreening();
  return {
    activeJobs: state.jobs.length,
    totalApplicants: state.candidates.length,
    aiScreened: latest?.results?.length || 0,
    shortlisted: latest?.shortlistedCount || 0,
    incompleteCount: latest?.incompleteCount || 0
  };
}

function updateLatestResult(candidateId: string | number, workflowStatus: string) {
  const screening = getLatestScreening();
  if (!screening) return null;
  const candidate = screening.results.find((result) => String(result.id) === String(candidateId));
  if (!candidate) return null;
  candidate.workflowStatus = workflowStatus;
  candidate.decision = workflowStatus === 'interview' ? 'shortlisted' : workflowStatus === 'rejected' ? 'rejected' : candidate.decision;
  persist();
  return candidate;
}

export const umuravaStore = {
  getState: () => state,
  getCandidates,
  addCandidate,
  generateFullProfile,
  getActiveJob,
  setActiveJob,
  getCurrentShortlistSize,
  setShortlistSize,
  saveJob: upsertJob,
  runScreening,
  getLatestScreening,
  getLatestScreeningResults,
  setLatestScreening,
  getDashboardSummary,
  markInterview: (candidateId: string | number) => updateLatestResult(candidateId, 'interview'),
  markRejected: (candidateId: string | number) => updateLatestResult(candidateId, 'rejected'),
  seedCandidates,
  persist
};

if (isBrowser()) {
  (window as Window & { UmuravaStore?: typeof umuravaStore }).UmuravaStore = umuravaStore;
}
