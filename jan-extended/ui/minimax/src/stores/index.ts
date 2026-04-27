import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  UserPreferences, 
  DashboardStats, 
  Project, 
  Document, 
  ResearchTopic, 
  Report, 
  Presentation, 
  ComputerTask,
  AppSettings,
  NavItem,
  ConversionTask,
  MergeTask,
  SplitTask,
  SearchQuery,
  AutomationScript,
  Plugin
} from '@/types';

// App Store
interface AppState {
  isLoading: boolean;
  sidebarOpen: boolean;
  activeModule: string;
  notifications: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setActiveModule: (module: string) => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoading: false,
      sidebarOpen: true,
      activeModule: 'dashboard',
      notifications: [],
      setLoading: (loading) => set({ isLoading: loading }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setActiveModule: (module) => set({ activeModule: module }),
      addNotification: (message, type) => 
        set((state) => ({ 
          notifications: [...state.notifications, { id: Date.now().toString(), message, type }] 
        })),
      removeNotification: (id) => 
        set((state) => ({ 
          notifications: state.notifications.filter(n => n.id !== id) 
        })),
    }),
    { name: 'app-storage' }
  )
);

// User Store
interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: {
        id: '1',
        name: 'User',
        email: 'user@example.com',
        preferences: {
          theme: 'dark',
          language: 'en',
          fontSize: 'medium',
          autoSave: true,
          notifications: true,
        },
        createdAt: new Date().toISOString(),
      },
      setUser: (user) => set({ user }),
      updatePreferences: (prefs) => 
        set((state) => ({ 
          user: state.user ? { 
            ...state.user, 
            preferences: { ...state.user.preferences, ...prefs } 
          } : null 
        })),
    }),
    { name: 'user-storage' }
  )
);

// Project Store
interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [],
      activeProject: null,
      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, data) => 
        set((state) => ({ 
          projects: state.projects.map(p => p.id === id ? { ...p, ...data } : p) 
        })),
      deleteProject: (id) => 
        set((state) => ({ 
          projects: state.projects.filter(p => p.id !== id) 
        })),
      setActiveProject: (project) => set({ activeProject: project }),
    }),
    { name: 'project-storage' }
  )
);

// Document Store (PDF/DOCX)
interface DocumentState {
  documents: Document[];
  conversions: ConversionTask[];
  merges: MergeTask[];
  splits: SplitTask[];
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  updateDocument: (id: string, data: Partial<Document>) => void;
  addConversion: (task: ConversionTask) => void;
  updateConversion: (id: string, data: Partial<ConversionTask>) => void;
  addMerge: (task: MergeTask) => void;
  updateMerge: (id: string, data: Partial<MergeTask>) => void;
  addSplit: (task: SplitTask) => void;
  updateSplit: (id: string, data: Partial<SplitTask>) => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set) => ({
      documents: [],
      conversions: [],
      merges: [],
      splits: [],
      addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
      removeDocument: (id) => set((state) => ({ 
        documents: state.documents.filter(d => d.id !== id) 
      })),
      updateDocument: (id, data) => 
        set((state) => ({ 
          documents: state.documents.map(d => d.id === id ? { ...d, ...data } : d) 
        })),
      addConversion: (task) => set((state) => ({ conversions: [...state.conversions, task] })),
      updateConversion: (id, data) => 
        set((state) => ({ 
          conversions: state.conversions.map(t => t.id === id ? { ...t, ...data } : t) 
        })),
      addMerge: (task) => set((state) => ({ merges: [...state.merges, task] })),
      updateMerge: (id, data) => 
        set((state) => ({ 
          merges: state.merges.map(t => t.id === id ? { ...t, ...data } : t) 
        })),
      addSplit: (task) => set((state) => ({ splits: [...state.splits, task] })),
      updateSplit: (id, data) => 
        set((state) => ({ 
          splits: state.splits.map(t => t.id === id ? { ...t, ...data } : t) 
        })),
    }),
    { name: 'document-storage' }
  )
);

// Research Store
interface ResearchState {
  topics: ResearchTopic[];
  searches: SearchQuery[];
  activeTopic: ResearchTopic | null;
  addTopic: (topic: ResearchTopic) => void;
  updateTopic: (id: string, data: Partial<ResearchTopic>) => void;
  deleteTopic: (id: string) => void;
  setActiveTopic: (topic: ResearchTopic | null) => void;
  addSearch: (search: SearchQuery) => void;
}

export const useResearchStore = create<ResearchState>()(
  persist(
    (set) => ({
      topics: [],
      searches: [],
      activeTopic: null,
      addTopic: (topic) => set((state) => ({ topics: [...state.topics, topic] })),
      updateTopic: (id, data) => 
        set((state) => ({ 
          topics: state.topics.map(t => t.id === id ? { ...t, ...data } : t) 
        })),
      deleteTopic: (id) => set((state) => ({ topics: state.topics.filter(t => t.id !== id) })),
      setActiveTopic: (topic) => set({ activeTopic: topic }),
      addSearch: (search) => set((state) => ({ searches: [search, ...state.searches] })),
    }),
    { name: 'research-storage' }
  )
);

// Report Store
interface ReportState {
  reports: Report[];
  activeReport: Report | null;
  addReport: (report: Report) => void;
  updateReport: (id: string, data: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  setActiveReport: (report: Report | null) => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      reports: [],
      activeReport: null,
      addReport: (report) => set((state) => ({ reports: [...state.reports, report] })),
      updateReport: (id, data) => 
        set((state) => ({ 
          reports: state.reports.map(r => r.id === id ? { ...r, ...data } : r) 
        })),
      deleteReport: (id) => set((state) => ({ reports: state.reports.filter(r => r.id !== id) })),
      setActiveReport: (report) => set({ activeReport: report }),
    }),
    { name: 'report-storage' }
  )
);

// Slide Store
interface SlideState {
  presentations: Presentation[];
  activePresentation: Presentation | null;
  selectedSlide: string | null;
  addPresentation: (presentation: Presentation) => void;
  updatePresentation: (id: string, data: Partial<Presentation>) => void;
  deletePresentation: (id: string) => void;
  setActivePresentation: (presentation: Presentation | null) => void;
  setSelectedSlide: (slideId: string | null) => void;
  addSlide: (presentationId: string, slide: any) => void;
  updateSlide: (presentationId: string, slideId: string, data: Partial<any>) => void;
  deleteSlide: (presentationId: string, slideId: string) => void;
  reorderSlides: (presentationId: string, slides: any[]) => void;
}

export const useSlideStore = create<SlideState>()(
  persist(
    (set) => ({
      presentations: [],
      activePresentation: null,
      selectedSlide: null,
      addPresentation: (presentation) => 
        set((state) => ({ presentations: [...state.presentations, presentation] })),
      updatePresentation: (id, data) => 
        set((state) => ({ 
          presentations: state.presentations.map(p => p.id === id ? { ...p, ...data } : p) 
        })),
      deletePresentation: (id) => 
        set((state) => ({ presentations: state.presentations.filter(p => p.id !== id) })),
      setActivePresentation: (presentation) => set({ activePresentation: presentation }),
      setSelectedSlide: (slideId) => set({ selectedSlide: slideId }),
      addSlide: (presentationId, slide) =>
        set((state) => ({
          presentations: state.presentations.map(p => 
            p.id === presentationId ? { ...p, slides: [...p.slides, slide] } : p
          )
        })),
      updateSlide: (presentationId, slideId, data) =>
        set((state) => ({
          presentations: state.presentations.map(p => 
            p.id === presentationId ? {
              ...p,
              slides: p.slides.map(s => s.id === slideId ? { ...s, ...data } : s)
            } : p
          )
        })),
      deleteSlide: (presentationId, slideId) =>
        set((state) => ({
          presentations: state.presentations.map(p => 
            p.id === presentationId ? {
              ...p,
              slides: p.slides.filter(s => s.id !== slideId)
            } : p
          )
        })),
      reorderSlides: (presentationId, slides) =>
        set((state) => ({
          presentations: state.presentations.map(p => 
            p.id === presentationId ? { ...p, slides } : p
          )
        })),
    }),
    { name: 'slide-storage' }
  )
);

// Computer Task Store
interface ComputerState {
  tasks: ComputerTask[];
  scripts: AutomationScript[];
  activeTask: ComputerTask | null;
  addTask: (task: ComputerTask) => void;
  updateTask: (id: string, data: Partial<ComputerTask>) => void;
  deleteTask: (id: string) => void;
  setActiveTask: (task: ComputerTask | null) => void;
  addScript: (script: AutomationScript) => void;
  updateScript: (id: string, data: Partial<AutomationScript>) => void;
  deleteScript: (id: string) => void;
}

export const useComputerStore = create<ComputerState>()(
  persist(
    (set) => ({
      tasks: [],
      scripts: [],
      activeTask: null,
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, data) => 
        set((state) => ({ 
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...data } : t) 
        })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter(t => t.id !== id) })),
      setActiveTask: (task) => set({ activeTask: task }),
      addScript: (script) => set((state) => ({ scripts: [...state.scripts, script] })),
      updateScript: (id, data) => 
        set((state) => ({ 
          scripts: state.scripts.map(s => s.id === id ? { ...s, ...data } : s) 
        })),
      deleteScript: (id) => set((state) => ({ scripts: state.scripts.filter(s => s.id !== id) })),
    }),
    { name: 'computer-storage' }
  )
);

// Settings Store
interface SettingsState {
  settings: AppSettings;
  updateSettings: (data: Partial<AppSettings>) => void;
  updateGeneral: (data: Partial<AppSettings['general']>) => void;
  updateAppearance: (data: Partial<AppSettings['appearance']>) => void;
  updatePerformance: (data: Partial<AppSettings['performance']>) => void;
  updateSecurity: (data: Partial<AppSettings['security']>) => void;
  updateIntegrations: (data: Partial<AppSettings['integrations']>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        general: {
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '24h' as const,
          autoStart: false,
          autoUpdate: true,
        },
        appearance: {
          theme: 'dark',
          accentColor: '#0ea5e9',
          fontSize: 14,
          fontFamily: 'Inter',
          compactMode: false,
          animations: true,
        },
        performance: {
          maxConcurrentTasks: 3,
          cacheSize: 500,
          enableHardwareAcceleration: true,
          lazyLoading: true,
        },
        security: {
          requireAuth: false,
          sessionTimeout: 30,
          encryptLocalData: false,
          allowTelemetry: true,
        },
        integrations: {
          cloudStorage: 'none' as const,
          apiKeys: {},
          webhooks: [],
        },
      },
      updateSettings: (data) => 
        set((state) => ({ settings: { ...state.settings, ...data } })),
      updateGeneral: (data) => 
        set((state) => ({ 
          settings: { ...state.settings, general: { ...state.settings.general, ...data } } 
        })),
      updateAppearance: (data) => 
        set((state) => ({ 
          settings: { ...state.settings, appearance: { ...state.settings.appearance, ...data } } 
        })),
      updatePerformance: (data) => 
        set((state) => ({ 
          settings: { ...state.settings, performance: { ...state.settings.performance, ...data } } 
        })),
      updateSecurity: (data) => 
        set((state) => ({ 
          settings: { ...state.settings, security: { ...state.settings.security, ...data } } 
        })),
      updateIntegrations: (data) => 
        set((state) => ({ 
          settings: { ...state.settings, integrations: { ...state.settings.integrations, ...data } } 
        })),
    }),
    { name: 'settings-storage' }
  )
);

// Plugin Store
interface PluginState {
  plugins: Plugin[];
  togglePlugin: (id: string) => void;
  updatePluginStatus: (id: string, status: string) => void;
}

export const usePluginStore = create<PluginState>()(
  persist(
    (set) => ({
      plugins: [
        { id: 'outlook', name: 'Outlook', icon: 'Mail', connected: false, status: 'Disconnected', description: 'Connect to your Desktop Outlook to read and draft emails.' },
        { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', connected: false, status: 'Disconnected', description: 'Quick-launch and send messages via WhatsApp Desktop.' },
        { id: 'phonelink', name: 'Phone Link', icon: 'Smartphone', connected: false, status: 'Disconnected', description: 'Control your Android/iOS device via Windows Phone Link.' },
        { id: 'chrome', name: 'Chrome', icon: 'Globe', connected: false, status: 'Disconnected', description: 'Automate web browsing and data extraction in Chrome.' },
        { id: 'edge', name: 'Edge', icon: 'Layout', connected: false, status: 'Disconnected', description: 'Control and browse using Microsoft Edge natively.' },
      ],
      togglePlugin: (id) => set((state) => ({
        plugins: state.plugins.map(p => p.id === id ? { ...p, connected: !p.connected, status: !p.connected ? 'Connected' : 'Disconnected' } : p)
      })),
      updatePluginStatus: (id, status) => set((state) => ({
        plugins: state.plugins.map(p => p.id === id ? { ...p, status } : p)
      })),
    }),
    { name: 'plugin-storage' }
  )
);
