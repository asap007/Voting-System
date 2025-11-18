// API Base URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

// Question Types
export type QuestionType = 
  | 'text' 
  | 'textarea' 
  | 'likert' 
  | 'multiple_choice' 
  | 'checkboxes' 
  | 'rating' 
  | 'yes_no';

export interface ConditionalLogic {
  show_if_question_id: string;
  show_if_answer: string | string[];
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
}

export interface Question {
  id: string;
  form_id: string;
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  is_required: boolean;
  order_index: number;
  conditional_logic?: ConditionalLogic;
  created_at: number;
}

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

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  created_at: number;
  updated_at: number;
}

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
