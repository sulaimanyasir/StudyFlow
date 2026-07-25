import { Assignment, Course, Exam } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'AI request failed');
  }
  return res.json();
}

async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'AI request failed');
  }
  return res.json();
}

export function getWeeklyDigest(courses: Course[], assignments: Assignment[], exams: Exam[]) {
  return post<{ summary: string }>('/api/ai/weekly-digest', { courses, assignments, exams });
}

export interface StudyPlanInput {
  title: string;
  type: string;
  dueDate: string;
  estimatedHours: number;
  description?: string;
}

export interface StudyPlanStep {
  day: string;
  task: string;
  hours: number;
}

export function getStudyPlan(input: StudyPlanInput) {
  return post<{ plan: StudyPlanStep[] }>('/api/ai/study-plan', input);
}

export interface QuickAddResult {
  kind: 'assignment' | 'exam';
  title: string;
  courseId?: string;
  dueDate: string;
  priority?: string;
  type?: string;
  estimatedHours?: number;
  time?: string;
  room?: string;
}

export function quickAddParse(text: string, courses: Course[]) {
  return post<QuickAddResult>('/api/ai/quick-add', { text, courses });
}

export interface Flashcard {
  question: string;
  answer: string;
}

export function getFlashcards(topic: string, notes: string, courseName: string, count = 8) {
  return post<{ flashcards: Flashcard[] }>('/api/ai/flashcards', { topic, notes, courseName, count });
}

// --- AI Workspace Functions ---

export function sendStudyChat(message: string, context?: string) {
  return post<{ reply: string }>('/api/ai/chat', { message, context });
}

export function uploadDocumentChat(message: string, file: File, previousContext?: string) {
  const formData = new FormData();
  formData.append('message', message);
  formData.append('file', file);
  if (previousContext) formData.append('previousContext', previousContext);
  return postFormData<{ reply: string, documentContext: string }>('/api/ai/document-chat', formData);
}

export interface SummarizeResult {
  summary: string;
}

export function summarizeNotes(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return postFormData<SummarizeResult>('/api/ai/summarize', formData);
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizResult {
  title: string;
  questions: QuizQuestion[];
}

export function generateQuiz(topic: string, file?: File, numQuestions: number = 5) {
  const formData = new FormData();
  if (topic) formData.append('topic', topic);
  if (file) formData.append('file', file);
  formData.append('numQuestions', numQuestions.toString());
  
  return postFormData<QuizResult>('/api/ai/quiz', formData);
}
