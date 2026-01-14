import { RESPONSE_TYPES, AI_OPINIONS } from './constants';

export interface CloudDetailField {
  section: "Cloud Solution Details";
  label: string;
  value: string;
  sheetName: string;
  cellRef?: string;
  rowIndex?: number;
}

export type AssessmentResponseNormalized = keyof typeof RESPONSE_TYPES;

export interface AiAnalysisResult {
  opinion: keyof typeof AI_OPINIONS;
  reasoning: string;
  confidence: number;
  requiredAction?: string;
}

export interface Attachment {
  name: string;
  size: number;
  type: string;
  data?: string; // Base64 string for preview/download
}

export interface AssessmentRow {
  questionId: string;
  questionText: string;
  responseRaw: string | null;
  responseNormalized: AssessmentResponseNormalized;
  mitigationRemarks: string | null;
  extra?: Record<string, string>;
  rowIndex: number;
  sheetName: string;
  isAnswered: boolean;
  hasMitigation: boolean;
  needsAttention: boolean;
  aiAnalysis?: AiAnalysisResult;
  attachments?: Attachment[];
  rationale?: string;
  example?: string;
  assessorComment?: string;
}

export interface AssessmentSummary {
  totalQuestions: number;
  answeredCount: number;
  yesCount: number;
  noCount: number;
  naCount: number;
  otherCount: number;
  unansweredCount: number;
  needsAttentionCount: number;
}

export interface ParsedCRAResult {
  meta: {
    fileName: string;
    parsedAtISO: string;
    sheetNames: string[];
  };
  cloudSolutionDetails: {
    allFields: CloudDetailField[];
    filledFields: CloudDetailField[];
    missingFields?: CloudDetailField[];
  };
  assessment: {
    allRows: AssessmentRow[];
    answeredRows: AssessmentRow[];
    needsAttentionRows: AssessmentRow[];
    summary: AssessmentSummary;
    reviewerFeedback?: string;
  };
}
