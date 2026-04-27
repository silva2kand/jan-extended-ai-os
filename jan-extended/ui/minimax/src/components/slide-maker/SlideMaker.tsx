import React, { useState } from 'react';
import { 
  Presentation, 
  Plus, 
  Trash2, 
  Copy, 
  Eye,
  Download,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Layout,
  Palette,
  Type,
  Image,
  BarChart3,
  Quote,
  ChevronLeft,
  ChevronRight,
  Grid,
  MousePointer,
  Move,
  Save,
  Share2,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSlideStore, useAppStore } from '@/stores';
import type { Presentation as PresentationType, Slide, SlideTheme, SlideType } from '@/types';

const SlideMaker: React.FC = () => {
  const [activePresentation, setActivePresentation] = useState<PresentationType | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNewPresentationModal, setShowNewPresentationModal] = useState(false);
  const [presentationTitle, setPresentationTitle] = useState('');
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  
  const { 
    presentations, 
    addPresentation, 
    updatePresentation, 
    deletePresentation,
    setActivePresentation: setStoreActivePresentation,
    addSlide,
    updateSlide,
    deleteSlide,
    reorderSlides
  } = useSlideStore();
  
  const { addNotification } = useAppStore();

  const slideTypes: { type: SlideType; label: string; icon: any }[] = [
    { type: 'title', label: 'Title', icon: Type },
    { type: 'content', label: 'Content', icon: Layout },
    { type: 'image', label: 'Image', icon: Image },
    { type: 'chart', label: 'Chart', icon: BarChart3 },
    { type: 'quote', label: 'Quote', icon: Quote },
    { type: 'section', label: 'Section', icon: Layers },
  ];

  const themes: SlideTheme[] = [
    { primaryColor: '#0ea5e9', secondaryColor: '#8b5cf6', accentColor: '#10b981', backgroundColor: '#0f172a', fontFamily: 'Inter', fontSize: 16 },
    { primaryColor: '#8b5cf6', secondaryColor: '#ec4899', accentColor: '#f59e0b', backgroundColor: '#1e1b4b', fontFamily: 'Poppins', fontSize: 16 },
    { primaryColor: '#10b981', secondaryColor: '#0ea5e9', accentColor: '#f59e0b', backgroundColor: '#064e3b', fontFamily: 'Roboto', fontSize: 16 },
    { primaryColor: '#f59e0b', secondaryColor: '#ef4444', accentColor: '#8b5cf6', backgroundColor: '#1c1917', fontFamily: 'Open Sans', fontSize: 16 },
    { primaryColor: '#ec4899', secondaryColor: '#8b5cf6', accentColor: '#06b6d4', backgroundColor: '#2e1065', fontFamily: 'Montserrat', fontSize: 16 },
  ];

  const createNewPresentation = () => {
    if (!presentationTitle.trim()) {
      addNotification('Please enter a presentation title', 'error');
      return;
    }

    const newPresentation: PresentationType = {
      id: Date.now().toString(),
      title: presentationTitle,
      description: '',
      theme: themes[0],
      slides: [
        {
          id: Date.now().toString(),
          type: 'title',
          title: 'Welcome',
          content: {
            title: presentationTitle,
            subtitle: 'Created with AI Desktop',
          },
          layout: { columns: 1, alignment: 'center', spacing: 'normal' },
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addPresentation(newPresentation);
    setActivePresentation(newPresentation);
    setStoreActivePresentation(newPresentation);
    setSelectedSlideId(newPresentation.slides[0].id);
    setShowNewPresentationModal(false);
    setPresentationTitle('');
    addNotification('Presentation created!', 'success');
  };

  const addNewSlide = (type: SlideType) => {
    if (!activePresentation) return;

    const newSlide: Slide = {
      id: Date.now().toString(),
      type,
      title: type === 'title' ? 'New Slide' : `Slide ${activePresentation.slides.length + 1}`,
      content: {
        title: '',
        subtitle: '',
        text: '',
        bullets: ['Point 1', 'Point 2', 'Point 3'],
      },
      layout: { columns: 1, alignment: 'left', spacing: 'normal' },
    };

    addSlide(activePresentation.id, newSlide);
    setActivePresentation({
      ...activePresentation,
      slides: [...activePresentation.slides, newSlide],
    });
    setSelectedSlideId(newSlide.id);
    addNotification('Slide added!', 'success');
  };

  const deleteSelectedSlide = () => {
    if (!activePresentation || activePresentation.slides.length <= 1) {
      addNotification('Cannot delete the last slide', 'error');
      return;
    }

    const newSlides = activePresentation.slides.filter(s => s.id !== selectedSlideId);
    deleteSlide(activePresentation.id, selectedSlideId!);
    setActivePresentation({ ...activePresentation, slides: newSlides });
    setSelectedSlideId(newSlides[0].id);
    addNotification('Slide deleted', 'info');
  };

  const applyTheme = (theme: SlideTheme) => {
    if (!activePresentation) return;
    updatePresentation(activePresentation.id, { theme });
    setActivePresentation({ ...activePresentation, theme });
    setShowThemeEditor(false);
    addNotification('Theme applied!', 'success');
  };

  const selectedSlide = activePresentation?.slides.find(s => s.id === selectedSlideId);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Slide Maker</h2>
          <p className="text-slate-400">Create stunning presentations with AI</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowThemeEditor(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Palette className="w-5 h-5" />
            Themes
          </button>
          <button 
            onClick={() => setShowNewPresentationModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Presentation
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Slides Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 card flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Slides</h3>
            <div className="flex gap-1">
              <button 
                onClick={() => addNewSlide('content')}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Slide Thumbnails */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {activePresentation?.slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedSlideId(slide.id)}
                className={`relative p-2 rounded-xl cursor-pointer transition-all group ${
                  selectedSlideId === slide.id
                    ? 'bg-cyan-500/20 border-2 border-cyan-500'
                    : 'bg-slate-700/30 hover:bg-slate-700/50 border-2 border-transparent'
                }`}
              >
                <div className="aspect-video bg-slate-800 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  <span className="text-2xl font-bold text-slate-600">
                    {index + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">{slide.title}</p>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(activePresentation!.id, slide.id);
                      setActivePresentation({
                        ...activePresentation!,
                        slides: activePresentation!.slides.filter(s => s.id !== slide.id)
                      });
                    }}
                    className="p-1 rounded bg-red-500/80 text-white hover:bg-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add Slide Buttons */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Add Slide</p>
            <div className="grid grid-cols-3 gap-2">
              {slideTypes.slice(0, 6).map((type) => (
                <button
                  key={type.type}
                  onClick={() => addNewSlide(type.type)}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
                  title={type.label}
                >
                  <type.icon className="w-4 h-4 mx-auto" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Editor Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-6 flex flex-col"
        >
          {activePresentation && selectedSlide ? (
            <>
              {/* Toolbar */}
              <div className="card mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                    <MousePointer className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                    <Move className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-slate-600 mx-2" />
                  <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                    <Type className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                    <Image className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                    <BarChart3 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4" />
                    AI Enhance
                  </button>
                </div>
              </div>

              {/* Slide Preview */}
              <div className="card flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 min-h-96">
                <div 
                  className="w-full max-w-3xl aspect-video rounded-xl shadow-2xl overflow-hidden relative"
                  style={{ backgroundColor: activePresentation.theme.backgroundColor }}
                >
                  {/* Slide Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    {selectedSlide.type === 'title' && (
                      <>
                        <h1 
                          className="text-4xl font-bold mb-4"
                          style={{ color: activePresentation.theme.primaryColor }}
                        >
                          {selectedSlide.content.title || 'Slide Title'}
                        </h1>
                        <p 
                          className="text-xl"
                          style={{ color: activePresentation.theme.secondaryColor }}
                        >
                          {selectedSlide.content.subtitle || 'Subtitle'}
                        </p>
                      </>
                    )}
                    
                    {selectedSlide.type === 'content' && (
                      <>
                        <h2 
                          className="text-3xl font-bold mb-6"
                          style={{ color: activePresentation.theme.primaryColor }}
                        >
                          {selectedSlide.content.title || 'Content Title'}
                        </h2>
                        <ul className="text-left space-y-3 w-full max-w-2xl">
                          {selectedSlide.content.bullets?.map((bullet, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span 
                                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                                style={{ backgroundColor: activePresentation.theme.accentColor }}
                              />
                              <span className="text-white text-lg">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {selectedSlide.type === 'quote' && (
                      <>
                        <Quote className="w-16 h-16 mb-6" style={{ color: activePresentation.theme.primaryColor }} />
                        <p 
                          className="text-2xl font-medium italic mb-4"
                          style={{ color: activePresentation.theme.secondaryColor }}
                        >
                          "{selectedSlide.content.quote || 'Your quote here'}"
                        </p>
                        <p className="text-white">
                          — {selectedSlide.content.attribution || 'Attribution'}
                        </p>
                      </>
                    )}

                    {selectedSlide.type === 'section' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <h2 
                          className="text-5xl font-bold"
                          style={{ color: activePresentation.theme.primaryColor }}
                        >
                          {selectedSlide.content.title || 'Section'}
                        </h2>
                      </div>
                    )}
                  </div>

                  {/* Slide Number */}
                  <div className="absolute bottom-4 right-4 text-sm text-slate-400">
                    {activePresentation.slides.findIndex(s => s.id === selectedSlideId) + 1} / {activePresentation.slides.length}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="card mt-4 flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    const idx = activePresentation.slides.findIndex(s => s.id === selectedSlideId);
                    if (idx > 0) setSelectedSlideId(activePresentation.slides[idx - 1].id);
                  }}
                  disabled={activePresentation.slides.findIndex(s => s.id === selectedSlideId) === 0}
                  className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-white font-medium">
                  {activePresentation.slides.findIndex(s => s.id === selectedSlideId) + 1} of {activePresentation.slides.length}
                </span>
                
                <button
                  onClick={() => {
                    const idx = activePresentation.slides.findIndex(s => s.id === selectedSlideId);
                    if (idx < activePresentation.slides.length - 1) setSelectedSlideId(activePresentation.slides[idx + 1].id);
                  }}
                  disabled={activePresentation.slides.findIndex(s => s.id === selectedSlideId) === activePresentation.slides.length - 1}
                  className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-slate-600 mx-4" />

                <button
                  onClick={() => {
                    setCurrentSlideIndex(0);
                    setIsPlaying(true);
                  }}
                  className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <Play className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="card flex-1 flex flex-col items-center justify-center">
              <Presentation className="w-20 h-20 text-slate-600 mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-2">No Presentation Selected</h3>
              <p className="text-slate-400 mb-6">Create a new presentation or select one to edit</p>
              <button 
                onClick={() => setShowNewPresentationModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Presentation
              </button>
            </div>
          )}
        </motion.div>

        {/* Properties Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 card flex flex-col"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>
          
          {selectedSlide ? (
            <div className="space-y-4 flex-1">
              {/* Slide Title */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Slide Title</label>
                <input
                  type="text"
                  value={selectedSlide.title}
                  onChange={(e) => {
                    updateSlide(activePresentation!.id, selectedSlide.id, { title: e.target.value });
                    setActivePresentation({
                      ...activePresentation!,
                      slides: activePresentation!.slides.map(s => 
                        s.id === selectedSlide.id ? { ...s, title: e.target.value } : s
                      )
                    });
                  }}
                  className="input-field text-sm"
                />
              </div>

              {/* Content */}
              {selectedSlide.type === 'title' && (
                <>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Main Title</label>
                    <input
                      type="text"
                      value={selectedSlide.content.title || ''}
                      onChange={(e) => {
                        updateSlide(activePresentation!.id, selectedSlide.id, { 
                          content: { ...selectedSlide.content, title: e.target.value }
                        });
                        setActivePresentation({
                          ...activePresentation!,
                          slides: activePresentation!.slides.map(s => 
                            s.id === selectedSlide.id ? { 
                              ...s, 
                              content: { ...s.content, title: e.target.value }
                            } : s
                          )
                        });
                      }}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Subtitle</label>
                    <input
                      type="text"
                      value={selectedSlide.content.subtitle || ''}
                      onChange={(e) => {
                        updateSlide(activePresentation!.id, selectedSlide.id, { 
                          content: { ...selectedSlide.content, subtitle: e.target.value }
                        });
                        setActivePresentation({
                          ...activePresentation!,
                          slides: activePresentation!.slides.map(s => 
                            s.id === selectedSlide.id ? { 
                              ...s, 
                              content: { ...s.content, subtitle: e.target.value }
                            } : s
                          )
                        });
                      }}
                      className="input-field text-sm"
                    />
                  </div>
                </>
              )}

              {selectedSlide.type === 'content' && (
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Bullets</label>
                  <div className="space-y-2">
                    {selectedSlide.content.bullets?.map((bullet, i) => (
                      <input
                        key={i}
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const newBullets = [...(selectedSlide.content.bullets || [])];
                          newBullets[i] = e.target.value;
                          updateSlide(activePresentation!.id, selectedSlide.id, { 
                            content: { ...selectedSlide.content, bullets: newBullets }
                          });
                          setActivePresentation({
                            ...activePresentation!,
                            slides: activePresentation!.slides.map(s => 
                              s.id === selectedSlide.id ? { 
                                ...s, 
                                content: { ...s.content, bullets: newBullets }
                              } : s
                            )
                          });
                        }}
                        className="input-field text-sm"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedSlide.type === 'quote' && (
                <>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Quote</label>
                    <textarea
                      value={selectedSlide.content.quote || ''}
                      onChange={(e) => {
                        updateSlide(activePresentation!.id, selectedSlide.id, { 
                          content: { ...selectedSlide.content, quote: e.target.value }
                        });
                      }}
                      className="input-field text-sm min-h-24 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Attribution</label>
                    <input
                      type="text"
                      value={selectedSlide.content.attribution || ''}
                      onChange={(e) => {
                        updateSlide(activePresentation!.id, selectedSlide.id, { 
                          content: { ...selectedSlide.content, attribution: e.target.value }
                        });
                      }}
                      className="input-field text-sm"
                    />
                  </div>
                </>
              )}

              {/* Layout Options */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Alignment</label>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => {
                        updateSlide(activePresentation!.id, selectedSlide.id, { 
                          layout: { ...selectedSlide.layout, alignment: align }
                        });
                      }}
                      className={`flex-1 p-2 rounded-lg text-xs capitalize transition-colors ${
                        selectedSlide.layout.alignment === align
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-slate-700/50 text-slate-400 hover:text-white'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delete Slide */}
              <div className="pt-4 border-t border-slate-700 mt-auto">
                <button
                  onClick={deleteSelectedSlide}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-500/20 
                           text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Slide
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">Select a slide to edit</p>
          )}
        </motion.div>
      </div>

      {/* New Presentation Modal */}
      <AnimatePresence>
        {showNewPresentationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewPresentationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-6">Create New Presentation</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Presentation Title</label>
                  <input
                    type="text"
                    value={presentationTitle}
                    onChange={(e) => setPresentationTitle(e.target.value)}
                    placeholder="My Presentation"
                    className="input-field"
                    autoFocus
                  />
                </div>
                <button onClick={createNewPresentation} className="w-full btn-primary">
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Editor Modal */}
      <AnimatePresence>
        {showThemeEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowThemeEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-6">Choose Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                {themes.map((theme, index) => (
                  <button
                    key={index}
                    onClick={() => applyTheme(theme)}
                    className="p-4 rounded-xl border border-slate-600 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all text-left"
                  >
                    <div 
                      className="h-24 rounded-lg mb-3"
                      style={{ backgroundColor: theme.backgroundColor }}
                    >
                      <div className="flex items-center justify-center h-full gap-2">
                        <div 
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <div 
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: theme.secondaryColor }}
                        />
                        <div 
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                      </div>
                    </div>
                    <p className="text-white font-medium">{theme.fontFamily}</p>
                    <p className="text-xs text-slate-400">Theme {index + 1}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlideMaker;
