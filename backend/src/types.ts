// Cloudflare Workers Bindings
export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  GEMINI_API_KEY: string;
  ENCRYPTION_KEY: string;
  ENVIRONMENT: string;
}

// User types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'user' | 'admin';
  created_at: number;
  updated_at: number;
}

// Form types
export interface Form {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  ai_prompt?: string;
  is_anonymous: boolean;
  is_published: boolean;
  one_response_per_person: boolean;
  estimated_time?: number;
  response_count: number;
  created_at: number;
  updated_at: number;
  questions?: Question[];
}

// Question types
export type QuestionType = 
  | 'text' 
  | 'textarea' 
  | 'likert' 
  | 'multiple_choice' 
  | 'checkboxes' 
  | 'rating' 
  | 'yes_no';

export interface Question {
  id: string;
  form_id: string;
  question_text: string;
  question_type: QuestionType;
  options?: string[]; // For multiple choice, checkboxes
  is_required: boolean;
  order_index: number;
  conditional_logic?: ConditionalLogic;
  created_at: number;
}

export interface ConditionalLogic {
  show_if_question_id: string;
  show_if_answer: string | string[];
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
}

// Response types
export interface Response {
  id: string;
  form_id: string;
  response_token?: string;
  encrypted_data: string;
  user_fingerprint?: string;
  submitted_at: number;
}

export interface DecryptedResponse {
  id: string;
  form_id: string;
  answers: Record<string, any>; // question_id -> answer
  submitted_at: number;
}

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  encrypted_answer: string;
  created_at: number;
}

// Analytics types
export interface AnalyticsData {
  total_responses: number;
  completion_rate: number;
  average_time: number;
  question_analytics: QuestionAnalytics[];
  sentiment_analysis?: SentimentAnalysis;
  word_cloud_data?: WordCloudData[];
}

export interface QuestionAnalytics {
  question_id: string;
  question_text: string;
  question_type: QuestionType;
  response_distribution?: Record<string, number>;
  average_rating?: number;
  common_themes?: string[];
}

export interface SentimentAnalysis {
  positive: number;
  neutral: number;
  negative: number;
  key_topics: string[];
}

export interface WordCloudData {
  text: string;
  value: number;
}

// Session types
export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: number;
  created_at: number;
}

// API Request/Response types
export interface CreateFormRequest {
  ai_prompt: string;
  is_anonymous?: boolean;
  one_response_per_person?: boolean;
}

export interface CreateFormResponse {
  form: Form;
  questions: Question[];
}

export interface SubmitResponseRequest {
  form_id: string;
  answers: Record<string, any>;
  user_fingerprint?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}
