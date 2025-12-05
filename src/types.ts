export interface Question {
  role_id: string;
  block_type: string;
  order: number;
  question_text: string;
  answer_type: string;
  options: string[];
  pae_type?: string;
  scale_min?: number | null;
  scale_max?: number | null;
}

export interface SubmissionRecord {
  submission_id: string;
  role_id: string;
  person_name: string;
  company: string;
  question_text: string;
  answer: string;
  block_type: string;
  timestamp: string;
}
