// Core Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  autoSave: boolean;
  notifications: boolean;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

// Dashboard Types
export interface DashboardStats {
  totalProjects: number;
  completedTasks: number;
  pendingTasks: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'project' | 'task' | 'document' | 'research';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface Project {
  id: string;
  name: string;
  type: 'pdf-docx' | 'research' | 'report' | 'slides' | 'computer';
  status: 'in-progress' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  data: any;
}

// PDF/DOCX Types
export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'md';
  size: number;
  pages?: number;
  uploadedAt: string;
  processed: boolean;
  content?: string;
  metadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  author?: string;
  title?: string;
  subject?: string;
  keywords?: string[];
  createdDate?: string;
  modifiedDate?: string;
}

export interface ConversionTask {
  id: string;
  sourceFile: Document;
  targetFormat: 'pdf' | 'docx' | 'txt' | 'md';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export interface MergeTask {
  id: string;
  files: Document[];
  outputName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
}

export interface SplitTask {
  id: string;
  sourceFile: Document;
  splitOptions: SplitOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
}

export interface SplitOptions {
  byPages: boolean;
  pageRanges?: string[];
  byBookmarks: boolean;
  byHeadings: boolean;
}

// Researcher Types
export interface ResearchTopic {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  sources: ResearchSource[];
  notes: ResearchNote[];
  createdAt: string;
  updatedAt: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  type: 'web' | 'pdf' | 'book' | 'article';
  relevance: number;
  summary?: string;
  accessedAt: string;
}

export interface ResearchNote {
  id: string;
  content: string;
  sourceId?: string;
  tags: string[];
  createdAt: string;
}

export interface SearchQuery {
  id: string;
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
  timestamp: string;
}

export interface SearchFilters {
  dateRange?: { start: string; end: string };
  sourceTypes?: string[];
  language?: string;
  region?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate?: string;
  relevance: number;
}

// Report Writer Types
export interface Report {
  id: string;
  title: string;
  type: 'academic' | 'business' | 'technical' | 'creative';
  outline: ReportOutline;
  content: ReportContent;
  status: 'draft' | 'review' | 'final';
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  format: 'pdf' | 'docx' | 'html';
}

export interface ReportOutline {
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  subsections: ReportSection[];
  content?: string;
}

export interface ReportContent {
  introduction?: string;
  chapters: Chapter[];
  conclusion?: string;
  references: Reference[];
}

export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface Reference {
  id: string;
  authors: string[];
  title: string;
  source: string;
  year: number;
  url?: string;
  doi?: string;
}

// Slide Maker Types
export interface Presentation {
  id: string;
  title: string;
  description: string;
  theme: SlideTheme;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  content: SlideContent;
  layout: SlideLayout;
  background?: string;
  animations?: SlideAnimation[];
}

export type SlideType = 'title' | 'content' | 'image' | 'chart' | 'video' | 'quote' | 'section';

export interface SlideContent {
  title?: string;
  subtitle?: string;
  text?: string;
  bullets?: string[];
  imageUrl?: string;
  chartData?: any;
  videoUrl?: string;
  quote?: string;
  attribution?: string;
}

export interface SlideLayout {
  columns: number;
  alignment: 'left' | 'center' | 'right';
  spacing: 'compact' | 'normal' | 'spacious';
}

export interface SlideTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  fontSize: number;
}

export interface SlideAnimation {
  type: 'fade' | 'slide' | 'zoom' | 'fly';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration: number;
  delay: number;
}

// Computer Expert Types
export interface ComputerTask {
  id: string;
  type: TaskType;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  steps: TaskStep[];
  result?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export type TaskType = 
  | 'file_operations' 
  | 'web_browser' 
  | 'code_execution' 
  | 'data_processing' 
  | 'automation';

export interface TaskStep {
  id: string;
  action: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  screenshot?: string;
  result?: any;
  error?: string;
}

export interface AutomationScript {
  id: string;
  name: string;
  description: string;
  steps: AutomationStep[];
  schedule?: CronSchedule;
  lastRun?: string;
  createdAt: string;
}

export interface AutomationStep {
  action: string;
  target: string;
  value?: string;
  wait?: number;
}

export interface CronSchedule {
  expression: string;
  enabled: boolean;
}

// Settings Types
export interface AppSettings {
  general: GeneralSettings;
  appearance: AppearanceSettings;
  performance: PerformanceSettings;
  security: SecuritySettings;
  integrations: IntegrationSettings;
}

export interface GeneralSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  autoStart: boolean;
  autoUpdate: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'custom';
  accentColor: string;
  fontSize: number;
  fontFamily: string;
  compactMode: boolean;
  animations: boolean;
}

export interface PerformanceSettings {
  maxConcurrentTasks: number;
  cacheSize: number;
  enableHardwareAcceleration: boolean;
  lazyLoading: boolean;
}

export interface SecuritySettings {
  requireAuth: boolean;
  sessionTimeout: number;
  encryptLocalData: boolean;
  allowTelemetry: boolean;
}

export interface IntegrationSettings {
  cloudStorage: 'none' | 'dropbox' | 'gdrive' | 'onedrive';
  apiKeys: Record<string, string>;
  webhooks: WebhookConfig[];
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  active: boolean;
}
