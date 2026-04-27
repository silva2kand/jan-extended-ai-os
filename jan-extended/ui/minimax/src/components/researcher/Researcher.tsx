import React, { useState } from 'react';
import { 
  Search, 
  Globe, 
  FileText, 
  Bookmark, 
  Tag, 
  Clock,
  Star,
  Trash2,
  Plus,
  Filter,
  SortAsc,
  ExternalLink,
  Copy,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useResearchStore, useAppStore } from '@/stores';
import type { ResearchTopic, SearchResult, ResearchNote } from '@/types';

const Researcher: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'topics' | 'notes'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ResearchTopic | null>(null);
  
  const { 
    topics, 
    searches,
    activeTopic,
    addTopic,
    updateTopic,
    deleteTopic,
    setActiveTopic,
    addSearch
  } = useResearchStore();
  
  const { addNotification } = useAppStore();

  // Demo search results
  const demoResults: SearchResult[] = [
    {
      id: '1',
      title: 'Introduction to Machine Learning',
      url: 'https://example.com/ml-intro',
      snippet: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience...',
      source: 'Tech Encyclopedia',
      publishedDate: '2024-01-15',
      relevance: 95
    },
    {
      id: '2',
      title: 'Deep Learning Fundamentals',
      url: 'https://example.com/deep-learning',
      snippet: 'Deep learning is part of a broader family of machine learning methods based on artificial neural networks...',
      source: 'AI Research Hub',
      publishedDate: '2024-02-20',
      relevance: 88
    },
    {
      id: '3',
      title: 'Natural Language Processing Guide',
      url: 'https://example.com/nlp',
      snippet: 'NLP is a subfield of linguistics, computer science, and AI concerned with interactions between computers...',
      source: 'Developer Docs',
      publishedDate: '2024-03-10',
      relevance: 82
    },
    {
      id: '4',
      title: 'Computer Vision Applications',
      url: 'https://example.com/cv-apps',
      snippet: 'Computer vision is an interdisciplinary field that deals with how computers can gain understanding from digital images...',
      source: 'Tech Weekly',
      publishedDate: '2024-01-25',
      relevance: 75
    },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results = demoResults.map(r => ({
      ...r,
      snippet: r.snippet.replace('...', ` (related to "${searchQuery}")...`),
      relevance: Math.min(100, r.relevance + Math.floor(Math.random() * 20))
    }));
    
    setSearchResults(results);
    setIsSearching(false);
    
    addSearch({
      id: Date.now().toString(),
      query: searchQuery,
      filters: {},
      results,
      timestamp: new Date().toISOString()
    });
    
    addNotification(`Found ${results.length} results for "${searchQuery}"`, 'success');
  };

  const handleSaveTopic = () => {
    if (!selectedTopic || !selectedTopic.title) return;
    
    addTopic({
      ...selectedTopic,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    addNotification('Topic saved successfully!', 'success');
    setSelectedTopic(null);
  };

  const createNewTopic = () => {
    setSelectedTopic({
      id: '',
      title: '',
      description: '',
      keywords: [],
      sources: [],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for topics, articles, research papers..."
              className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl 
                       text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                       focus:ring-cyan-500 focus:border-transparent transition-all text-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="btn-primary px-8 flex items-center gap-2"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Search
          </button>
        </div>
        
        {/* Quick Filters */}
        <div className="flex gap-3 mt-4">
          {['All', 'Articles', 'Papers', 'Websites', 'Books'].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 rounded-lg text-sm bg-slate-700/50 text-slate-300 
                       hover:bg-slate-600 hover:text-white transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl w-fit">
        {[
          { id: 'search' as const, label: 'Search Results', icon: Search },
          { id: 'topics' as const, label: 'My Topics', icon: Bookmark },
          { id: 'notes' as const, label: 'Notes', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Results */}
          {activeTab === 'search' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {searchResults.length === 0 ? (
                <div className="card text-center py-12">
                  <Globe className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Start Your Research</h3>
                  <p className="text-slate-400">Enter a search query to find relevant sources and articles</p>
                </div>
              ) : (
                searchResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {result.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                              {result.relevance}% match
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{result.source}</p>
                        <p className="text-slate-300 mt-3 text-sm leading-relaxed">{result.snippet}</p>
                        <div className="flex items-center gap-4 mt-4">
                          <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                            <ExternalLink className="w-4 h-4" />
                            Open
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTopic(prev => prev ? {
                                ...prev,
                                sources: [...prev.sources, {
                                  id: result.id,
                                  title: result.title,
                                  url: result.url,
                                  type: 'web',
                                  relevance: result.relevance,
                                  accessedAt: new Date().toISOString()
                                }]
                              } : null);
                              addNotification('Source added!', 'success');
                            }}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                          >
                            <Bookmark className="w-4 h-4" />
                            Save
                          </button>
                          <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Topics */}
          {activeTab === 'topics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Research Topics</h2>
                <button onClick={createNewTopic} className="btn-primary flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  New Topic
                </button>
              </div>
              
              {topics.length === 0 ? (
                <div className="card text-center py-12">
                  <Bookmark className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Topics Yet</h3>
                  <p className="text-slate-400">Save search results as topics to organize your research</p>
                </div>
              ) : (
                topics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card hover:border-cyan-500/50 transition-all cursor-pointer"
                    onClick={() => setActiveTopic(topic)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{topic.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{topic.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <FileText className="w-3 h-3" />
                            {topic.sources.length} sources
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Tag className="w-3 h-3" />
                            {topic.keywords.length} keywords
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(topic.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTopic(topic.id);
                          addNotification('Topic deleted', 'info');
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Notes */}
          {activeTab === 'notes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Research Notes</h2>
                <button className="btn-primary flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Note
                </button>
              </div>
              <div className="space-y-4">
                {activeTopic?.notes.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No notes yet. Select a topic to view notes.</p>
                ) : (
                  activeTopic?.notes.map((note) => (
                    <div key={note.id} className="p-4 bg-slate-700/30 rounded-xl">
                      <p className="text-white">{note.content}</p>
                      <div className="flex items-center gap-2 mt-3">
                        {note.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Topic Editor */}
          {selectedTopic && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Edit Topic</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Title</label>
                  <input
                    type="text"
                    value={selectedTopic.title}
                    onChange={(e) => setSelectedTopic({ ...selectedTopic, title: e.target.value })}
                    className="input-field"
                    placeholder="Topic title..."
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Description</label>
                  <textarea
                    value={selectedTopic.description}
                    onChange={(e) => setSelectedTopic({ ...selectedTopic, description: e.target.value })}
                    className="input-field min-h-24 resize-none"
                    placeholder="Describe your research topic..."
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Keywords</label>
                  <input
                    type="text"
                    value={selectedTopic.keywords.join(', ')}
onChange={(e) => setSelectedTopic({ 
                      ...selectedTopic, 
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                    })}
                    className="input-field"
                    placeholder="keyword1, keyword2, ..."
                  />
                </div>
                <button onClick={handleSaveTopic} className="w-full btn-primary flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Topic
                </button>
              </div>
            </motion.div>
          )}

          {/* Recent Searches */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Searches</h3>
              <button className="text-sm text-cyan-400 hover:text-cyan-300">Clear</button>
            </div>
            <div className="space-y-2">
              {searches.slice(0, 5).map((search) => (
                <button
                  key={search.id}
                  onClick={() => {
                    setSearchQuery(search.query);
                    handleSearch();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
                >
                  <Clock className="w-4 h-4 text-slate-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{search.query}</p>
                    <p className="text-xs text-slate-500">{search.results.length} results</p>
                  </div>
                </button>
              ))}
              {searches.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No recent searches</p>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Research Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Topics</span>
                <span className="text-white font-semibold">{topics.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Saved Sources</span>
                <span className="text-white font-semibold">
                  {topics.reduce((acc, t) => acc + t.sources.length, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Searches</span>
                <span className="text-white font-semibold">{searches.length}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Researcher;
