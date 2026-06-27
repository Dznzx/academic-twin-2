// ──────────────────────────────────────────────
// Academic Twin — Shared Types
// ──────────────────────────────────────────────

// ── Documents ────────────────────────────────
export type DocumentStatus = "PROCESSING" | "READY" | "FAILED";

export interface Document {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  pageCount?: number;
  wordCount?: number;
  subject?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  pageNumber?: number;
}

// ── Chat ─────────────────────────────────────
export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  sources?: CitationSource[];
  createdAt: Date;
}

export interface CitationSource {
  documentId: string;
  documentTitle: string;
  chunkContent: string;
  pageNumber?: number;
}

// ── Quiz ──────────────────────────────────────
export type QuizDifficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionType = "MCQ" | "SHORT_ANSWER" | "TRUE_FALSE";

export interface Quiz {
  id: string;
  documentId: string;
  title: string;
  difficulty: QuizDifficulty;
  questions: QuizQuestion[];
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeTaken?: number;
  completedAt: Date;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
}

// ── Flashcards ────────────────────────────────
export interface FlashcardSet {
  id: string;
  userId: string;
  documentId?: string;
  title: string;
  description?: string;
  cards: Flashcard[];
  createdAt: Date;
}

export interface Flashcard {
  id: string;
  setId: string;
  front: string;
  back: string;
  difficulty: number;
  nextReview: Date;
  reviewCount: number;
}

// ── Analytics ─────────────────────────────────
export interface UserAnalytics {
  totalStudyTime: number;
  documentsUploaded: number;
  quizzesCompleted: number;
  avgQuizScore: number;
  flashcardsReviewed: number;
  chatMessages: number;
  currentStreak: number;
  longestStreak: number;
  weakTopics: WeakTopic[];
  studySessions: StudySession[];
}

export interface WeakTopic {
  topic: string;
  score: number;
  subject?: string;
}

export interface StudySession {
  date: Date;
  duration: number;
  subject?: string;
}

// ── Study Plan ────────────────────────────────
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  tasks: StudyTask[];
}

export interface StudyTask {
  id: string;
  planId: string;
  title: string;
  description?: string;
  dueDate: Date;
  duration: number;
  priority: Priority;
  status: TaskStatus;
  subject?: string;
}

// ── API Responses ─────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ── Upload ────────────────────────────────────
export interface UploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "done" | "error";
  error?: string;
}
