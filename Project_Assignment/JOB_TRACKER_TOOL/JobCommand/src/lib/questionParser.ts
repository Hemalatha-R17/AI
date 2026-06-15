// ============================================================
// questionParser.ts — flexible multi-format question importer
// ============================================================

export type QCategory  = 'Behavioral' | 'Technical' | 'System Design' | 'HR' | 'Coding';
export type QStatus    = 'To Prepare' | 'Practicing' | 'Practiced' | 'Asked in Interview' | 'Skipped';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export const Q_CATEGORIES: QCategory[]  = ['Behavioral', 'Technical', 'System Design', 'HR', 'Coding'];
export const Q_STATUS_CYCLE: QStatus[]  = ['To Prepare', 'Practicing', 'Practiced', 'Asked in Interview', 'Skipped'];
export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export interface ImportedQuestion {
  company?:       string;
  role?:          string;
  question:       string;
  category:       QCategory;
  status:         QStatus;
  notes?:         string;
  interviewDate?: string;
  source?:        string;
  difficulty?:    Difficulty;
  confidence?:    number; // 1–5
}

export interface ParseError {
  row?:    number;
  message: string;
}

export interface ParseResult {
  questions:    ImportedQuestion[];
  fileType:     string;
  errors:       ParseError[];
  warnings:     string[];
  suggestions:  string[];
  needsMapping: boolean;
  rawHeaders?:  string[];
  rawRows?:     string[][];
}

// ── header normalisation ──────────────────────────────────────
export function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_\-()]+/g, '').replace(/[^a-z0-9]/g, '');
}

// known column names → app field names
export const KNOWN_HEADERS: Record<string, string> = {
  question: 'question', questions: 'question', q: 'question', text: 'question',
  questiontext: 'question', body: 'question', prompt: 'question',
  company: 'company', org: 'company', organisation: 'company', organization: 'company', employer: 'company',
  role: 'role', position: 'role', jobtitle: 'role', title: 'role', job: 'role', jobrole: 'role',
  category: 'category', type: 'category', questiontype: 'category', cat: 'category', kind: 'category',
  status: 'status', progress: 'status', state: 'status',
  notes: 'notes', note: 'notes', comment: 'notes', comments: 'notes', answer: 'notes',
  outline: 'notes', hints: 'notes', hint: 'notes',
  interviewdate: 'interviewDate', date: 'interviewDate', interviewon: 'interviewDate',
  source: 'source', from: 'source', reference: 'source', origin: 'source',
  difficulty: 'difficulty', level: 'difficulty', hardness: 'difficulty', complexity: 'difficulty',
  confidence: 'confidence', rating: 'confidence', selfrating: 'confidence', score: 'confidence',
};

export const APP_FIELDS = [
  { value: 'question',      label: 'Question'         },
  { value: 'company',       label: 'Company'          },
  { value: 'role',          label: 'Role'             },
  { value: 'category',      label: 'Category'         },
  { value: 'status',        label: 'Status'           },
  { value: 'notes',         label: 'Notes'            },
  { value: 'interviewDate', label: 'Interview Date'   },
  { value: 'source',        label: 'Source'           },
  { value: 'difficulty',    label: 'Difficulty'       },
  { value: 'confidence',    label: 'Confidence (1–5)' },
];

// ── coercers ──────────────────────────────────────────────────
export function coerceCategory(val: string): QCategory {
  const v = val.trim().toLowerCase();
  if (v.includes('system') || v.includes('design') || v.includes('architect')) return 'System Design';
  if (v.includes('code') || v.includes('coding') || v.includes('algo') || v.includes('leetcode')) return 'Coding';
  if (v.includes('tech')) return 'Technical';
  if (v === 'hr' || v.includes('human') || v.includes('culture')) return 'HR';
  if (Q_CATEGORIES.includes(val as QCategory)) return val as QCategory;
  return 'Behavioral';
}

export function coerceStatus(val: string): QStatus {
  const v = val.trim().toLowerCase();
  if (v === 'practicing' || v === 'in progress' || v === 'inprogress' || v === 'wip') return 'Practicing';
  if (v === 'practiced' || v === 'done' || v === 'complete' || v === 'completed') return 'Practiced';
  if (v.includes('asked') || v.includes('interview') || v === 'done in interview') return 'Asked in Interview';
  if (v === 'skip' || v === 'skipped' || v === 'ignore') return 'Skipped';
  if (Q_STATUS_CYCLE.includes(val as QStatus)) return val as QStatus;
  return 'To Prepare';
}

export function coerceDifficulty(val: string): Difficulty | undefined {
  const v = val.trim().toLowerCase();
  if (v === 'easy' || v === 'low' || v === '1' || v === 'simple') return 'Easy';
  if (v === 'medium' || v === 'mid' || v === 'moderate' || v === '2' || v === '3') return 'Medium';
  if (v === 'hard' || v === 'high' || v === 'difficult' || v === '4' || v === '5') return 'Hard';
  return undefined;
}

export function detectCategory(text: string): QCategory {
  const t = text.toLowerCase();
  if (/\b(design|architect|scale|distributed|load.?balanc|sharding|replication|cap.theorem|microservice|database.design|api.design|system.design)\b/.test(t)) return 'System Design';
  if (/\b(code|algorithm|implement|big.?o|leetcode|data.?struct|recursion|sort|search|tree|graph|dynamic.program|complexity|write a function)\b/.test(t)) return 'Coding';
  if (/\b(api|framework|librar|technolog|language|syntax|tool|stack|difference.between|what.is|how.does|explain.how)\b/.test(t)) return 'Technical';
  if (/\b(salary|culture.?fit|why.do.you.want|where.do.you.see|weakness|strength|goal|motivat|culture|compensation)\b/.test(t)) return 'HR';
  return 'Behavioral';
}

function extractFromFilename(name: string): { company?: string; role?: string } {
  const base = name.replace(/\.[^.]+$/, '').replace(/[_\-]+/g, ' ').trim();
  const parts = base.split(/\s+/);
  if (parts.length >= 2) return { company: parts[0], role: parts.slice(1).join(' ') };
  return {};
}

// ── CSV parser ────────────────────────────────────────────────
export function parseCSVLine(line: string): string[] {
  const l = line.endsWith('\r') ? line.slice(0, -1) : line;
  const result: string[] = [];
  let i = 0;
  while (i < l.length) {
    if (l[i] === '"') {
      let field = '';
      i++;
      while (i < l.length) {
        if (l[i] === '"' && l[i + 1] === '"') { field += '"'; i += 2; }
        else if (l[i] === '"') { i++; break; }
        else { field += l[i++]; }
      }
      if (l[i] === ',') i++;
      result.push(field.trim());
    } else {
      const end = l.indexOf(',', i);
      if (end === -1) { result.push(l.slice(i).trim()); break; }
      result.push(l.slice(i, end).trim());
      i = end + 1;
    }
  }
  return result;
}

function buildFromMapped(obj: Record<string, string>, fileInfo: { company?: string; role?: string }): ImportedQuestion | null {
  const q = obj['question']?.trim();
  if (!q) return null;
  const conf = parseInt(obj['confidence'] || '');
  return {
    company:       (obj['company'] || fileInfo.company || '').trim(),
    role:          (obj['role']    || fileInfo.role    || '').trim(),
    question:      q,
    category:      obj['category'] ? coerceCategory(obj['category']) : detectCategory(q),
    status:        obj['status']   ? coerceStatus(obj['status'])     : 'To Prepare',
    notes:         obj['notes']    || '',
    interviewDate: obj['interviewDate'] || '',
    source:        obj['source']   || '',
    difficulty:    obj['difficulty'] ? coerceDifficulty(obj['difficulty']) : undefined,
    confidence:    !isNaN(conf) && conf >= 1 && conf <= 5 ? conf : undefined,
  };
}

function parseCSVContent(content: string, filename: string): ParseResult {
  const lines = content.trim().split(/\r?\n/).filter(l => l.trim());
  const fileInfo = extractFromFilename(filename);

  if (lines.length === 0) return {
    questions: [], fileType: 'CSV', errors: [{ message: 'File is empty.' }],
    warnings: [], suggestions: ['Add a header row followed by data rows.'], needsMapping: false,
  };

  const rawHeaders = parseCSVLine(lines[0]);
  const rawRows    = lines.slice(1).map(parseCSVLine);
  const normHeaders = rawHeaders.map(normalizeHeader);

  const mapping: Record<string, string> = {};
  let unknownCount = 0;
  for (const h of normHeaders) {
    const mapped = KNOWN_HEADERS[h];
    if (mapped) mapping[h] = mapped;
    else unknownCount++;
  }

  const hasQuestion = Object.values(mapping).includes('question');
  if (!hasQuestion) {
    const initialMapping: Record<string, string> = {};
    rawHeaders.forEach(h => { initialMapping[h] = KNOWN_HEADERS[normalizeHeader(h)] || ''; });
    return {
      questions: [], fileType: 'CSV', errors: [], warnings: [],
      suggestions: ["Couldn't find a 'Question' column. Use the mapping panel below to assign your columns."],
      needsMapping: true, rawHeaders, rawRows,
    };
  }

  const questions: ImportedQuestion[] = [];
  const errors: ParseError[] = [];
  const warnings: string[] = [];

  rawRows.forEach((vals, idx) => {
    if (!vals.some(v => v)) return;
    const obj: Record<string, string> = {};
    normHeaders.forEach((h, i) => { if (mapping[h]) obj[mapping[h]] = vals[i] || ''; });
    const built = buildFromMapped(obj, fileInfo);
    if (built) questions.push(built);
    else errors.push({ row: idx + 2, message: `Row ${idx + 2}: no question text — skipped.` });
  });

  if (unknownCount > 0)
    warnings.push(`${unknownCount} unrecognized column(s) ignored. Use the mapping panel for full control.`);

  return { questions, fileType: 'CSV', errors, warnings, suggestions: [], needsMapping: false };
}

// ── JSON parser ───────────────────────────────────────────────
function parseJSONContent(content: string, filename: string): ParseResult {
  const fileInfo = extractFromFilename(filename);
  let data: unknown;
  try { data = JSON.parse(content); }
  catch { return {
    questions: [], fileType: 'JSON',
    errors: [{ message: 'Invalid JSON. Check for missing commas, brackets, or quotes.' }],
    warnings: [], suggestions: ['Validate your JSON at jsonlint.com before importing.'],
    needsMapping: false,
  }; }

  let arr: unknown[];
  if (Array.isArray(data)) {
    arr = data;
  } else if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const candidate = d['questions'] || d['items'] || d['data'] || d['bank'] || d['questionBank'];
    if (Array.isArray(candidate)) arr = candidate;
    else arr = [data];
  } else {
    return {
      questions: [], fileType: 'JSON',
      errors: [{ message: 'JSON must be an array of objects, or an object with a "questions" array.' }],
      warnings: [], suggestions: ['Example: [{"question":"...","category":"Behavioral"}]'],
      needsMapping: false,
    };
  }

  const questions: ImportedQuestion[] = [];
  const errors: ParseError[] = [];
  const warnings: string[] = [];

  arr.forEach((item, idx) => {
    if (!item || typeof item !== 'object') return;
    const o = item as Record<string, unknown>;
    const str = (keys: string[]) => {
      for (const k of keys) { const v = o[k]; if (v && typeof v === 'string' && v.trim()) return v.trim(); } return '';
    };

    const q = str(['question', 'text', 'q', 'Question', 'questionText', 'body', 'prompt']);
    if (!q) { errors.push({ row: idx + 1, message: `Item ${idx + 1}: no question text — skipped.` }); return; }

    const catRaw  = str(['category', 'type', 'Category', 'questionType']);
    const statRaw = str(['status', 'Status', 'progress']);
    const diffRaw = str(['difficulty', 'Difficulty', 'level']);
    const confRaw = str(['confidence', 'Confidence', 'rating', 'score']);
    const conf    = parseInt(confRaw);

    questions.push({
      company:       str(['company', 'Company', 'org']) || fileInfo.company || '',
      role:          str(['role', 'Role', 'position', 'title']) || fileInfo.role || '',
      question:      q,
      category:      catRaw ? coerceCategory(catRaw) : detectCategory(q),
      status:        statRaw ? coerceStatus(statRaw) : 'To Prepare',
      notes:         str(['notes', 'note', 'answer', 'Notes', 'hint', 'hints']),
      interviewDate: str(['interviewDate', 'interview_date', 'date', 'interviewOn']),
      source:        str(['source', 'from', 'reference']),
      difficulty:    diffRaw ? coerceDifficulty(diffRaw) : undefined,
      confidence:    !isNaN(conf) && conf >= 1 && conf <= 5 ? conf : undefined,
    });
  });

  if (errors.length > 0 && questions.length > 0)
    warnings.push(`${errors.length} item(s) skipped — missing question text.`);

  return { questions, fileType: 'JSON', errors, warnings, suggestions: [], needsMapping: false };
}

// ── TXT / Markdown parser ─────────────────────────────────────

// Returns true if a heading is a document-structure or topic section,
// NOT a company/organisation name.
function isDocumentHeading(h: string): boolean {
  // Numbered question headings: "Q9. How do you…", "Q1)"
  if (/^Q\d+[.)]/i.test(h)) return true;
  // Heading that IS a question (ends with ?)
  if (h.endsWith('?')) return true;
  // Heading that starts with a question word
  if (/^(how |what |why |when |where |tell me|describe |explain |give me|walk me|can you|could you|have you|do you|did you|share a|design a|implement)/i.test(h)) return true;
  return /\b(behavioral|technical|system.design|coding|hr|interview|question|table.of|contents?|introduction|overview|appendix|glossary|references?|summary|conclusion|about|general|misc|miscellaneous|automation|testing|strategy|methodology|framework|guide|tips?|checklist|preparation|prep|resources?|section|chapter|part|topic|category|categories|devops|ci.?cd|pipeline|deployment|infrastructure|cloud|platform|monitoring|observability|security|networking|database|frontend|backend|fullstack|mobile|web|api|microservice)\b/i.test(h)
    || /\bof\b/i.test(h)
    || /\//.test(h) && !/^https?:/.test(h)
    || /[&]/.test(h) && h.split(/\s+/).length >= 3;
}

function parseTxtMdContent(content: string, filename: string): ParseResult {
  const lines = content.split(/\r?\n/);
  const fileInfo = extractFromFilename(filename);
  const isMd = /\.(md|markdown)$/i.test(filename);

  let currentCompany = fileInfo.company || '';
  let currentRole    = fileInfo.role    || '';
  let currentSection = '';
  const questions: ImportedQuestion[] = [];
  let last: ImportedQuestion | null = null;

  const looksLikeQuestion = (t: string) => {
    if (t.length < 8) return false;
    if (t.endsWith('?')) return true;
    return /^(tell me|describe( a time)?|explain|how (would|do|did|have|should)|what (would|is|are|was)|why (did|do|would)|walk me through|can you|could you|give me an example|share a time|what's your|have you ever)/i.test(t);
  };

  const stripPrefix = (s: string) =>
    s.replace(/^\d+[\.\)]\s*/, '')
     .replace(/^[-*•]\s*/, '')
     .replace(/^Q\s*[:\.]\s*/i, '')
     .replace(/^Question\s*[:\.]\s*/i, '')
     .replace(/\*+/g, '')
     .trim();

  for (let i = 0; i < lines.length; i++) {
    const raw  = lines[i];
    const line = raw.trim();
    if (!line) { last = null; continue; }

    // Heading: ## Company — Role
    const headMatch = line.match(/^#{1,4}\s+(.+)/);
    if (headMatch) {
      const heading = headMatch[1].replace(/\*+/g, '').trim();
      const parts = heading.split(/[\|—–\-:]+/).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) { currentCompany = parts[0]; currentRole = parts[1]; }
      else if (!isDocumentHeading(heading)) {
        currentCompany = heading; currentRole = '';
      } else { currentSection = heading; }
      last = null; continue;
    }

    // Metadata: "Company: Google" / "Role: SWE"
    const metaMatch = line.match(/^(company|org|role|position|title)\s*:\s*(.+)/i);
    if (metaMatch) {
      const k = metaMatch[1].toLowerCase(); const v = metaMatch[2].trim();
      if (k === 'company' || k === 'org') currentCompany = v;
      if (k === 'role' || k === 'position' || k === 'title') currentRole = v;
      last = null; continue;
    }

    // Inline metadata when last question exists
    if (last) {
      const noteMatch = line.match(/^(note|answer|hint|a)\s*[:\.]\s*(.+)/i);
      if (noteMatch) { last.notes = ((last.notes || '') + (last.notes ? '\n' : '') + noteMatch[2].trim()); continue; }
      const statMatch = line.match(/^status\s*:\s*(.+)/i);
      if (statMatch) { last.status = coerceStatus(statMatch[1]); continue; }
      const diffMatch = line.match(/^difficulty\s*:\s*(.+)/i);
      if (diffMatch) { last.difficulty = coerceDifficulty(diffMatch[1]); continue; }
      const confMatch = line.match(/^confidence\s*:\s*(\d)/i);
      if (confMatch) { const c = parseInt(confMatch[1]); if (c >= 1 && c <= 5) last.confidence = c; continue; }
    }

    const text = stripPrefix(line);
    if (looksLikeQuestion(text)) {
      last = {
        company: currentCompany, role: currentRole,
        question: text, category: detectCategory(text),
        status: 'To Prepare', notes: '',
        source: currentSection || undefined,
      };
      questions.push(last);
    }
  }

  if (questions.length === 0) return {
    questions: [], fileType: isMd ? 'Markdown' : 'Text',
    errors: [{ message: 'No questions detected in this file.' }],
    warnings: [],
    suggestions: [
      'Questions are detected if they end with "?" or start with "Tell me", "How", "What", "Why", "Describe", "Explain".',
      'Use "## Company — Role" headers to set context.',
      'Add "Note: ..." on the next line after a question to attach notes.',
      'Add "Status: Practiced" or "Difficulty: Hard" on the line after a question.',
    ],
    needsMapping: false,
  };

  const warnings: string[] = [];
  if (!currentCompany) warnings.push('No company detected. Add "## CompanyName — Role" section headers, or update manually after import.');

  return { questions, fileType: isMd ? 'Markdown' : 'Text', errors: [], warnings, suggestions: [], needsMapping: false };
}

// ── orchestrator ──────────────────────────────────────────────
export function parseFile(filename: string, content: string): ParseResult {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (ext === 'json') return parseJSONContent(content, filename);
  if (ext === 'md' || ext === 'markdown') return parseTxtMdContent(content, filename);
  if (ext === 'txt') return parseTxtMdContent(content, filename);
  if (ext === 'csv') return parseCSVContent(content, filename);

  // Auto-detect
  try {
    const json = parseJSONContent(content, filename);
    if (json.questions.length > 0) return { ...json, fileType: 'Auto-detected JSON' };
  } catch { /* noop */ }

  if (content.includes(',')) {
    const csv = parseCSVContent(content, filename);
    if (csv.questions.length > 0 || csv.needsMapping) return { ...csv, fileType: 'Auto-detected CSV' };
  }

  return parseTxtMdContent(content, filename);
}

export function applyColumnMapping(
  rawHeaders: string[],
  rawRows: string[][],
  mapping: Record<string, string>,
  filename: string,
): ParseResult {
  const fileInfo = extractFromFilename(filename);
  const questions: ImportedQuestion[] = [];
  const errors: ParseError[] = [];

  rawRows.forEach((vals, idx) => {
    if (!vals.some(v => v)) return;
    const obj: Record<string, string> = {};
    rawHeaders.forEach((h, i) => { if (mapping[h]) obj[mapping[h]] = vals[i] || ''; });
    const built = buildFromMapped(obj, fileInfo);
    if (built) questions.push(built);
    else errors.push({ row: idx + 2, message: `Row ${idx + 2}: no question text — skipped.` });
  });

  return { questions, fileType: 'CSV (mapped)', errors, warnings: [], suggestions: [], needsMapping: false };
}
