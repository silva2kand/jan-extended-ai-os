import React, { useState, useEffect } from 'react';
import { Search, Download, Box, Globe, Shield, Zap, Info, Loader2, CheckCircle, ExternalLink, Play, Cpu, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores';

const ModelHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'library'>('search');
  const [localModels, setLocalModels] = useState<any[]>([]);
  const [loadingModel, setLoadingModel] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [models, setModels] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { addNotification } = useAppStore();

  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [hardwareInfo, setHardwareInfo] = useState<any>(null);

  useEffect(() => {
    fetchLocalModels();
    fetchHardwareInfo();
  }, [activeTab]);

  const fetchHardwareInfo = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/hardware-info');
      const data = await response.json();
      if (data.success) {
        setHardwareInfo(data);
      }
    } catch (e) {
      console.error("Could not fetch hardware info", e);
    }
  };

  const getHardwareMatch = (modelId: string, hw: any) => {
    if (!hw) return { status: 'unknown', text: 'Hardware Unknown', color: 'bg-slate-700 text-slate-300' };
    
    const idLower = modelId.toLowerCase();
    let requiredRam = 8; 
    
    if (idLower.includes('70b') || idLower.includes('72b')) requiredRam = 32;
    else if (idLower.includes('34b') || idLower.includes('8x7b')) requiredRam = 24;
    else if (idLower.includes('13b') || idLower.includes('14b') || idLower.includes('12b')) requiredRam = 12;
    else if (idLower.includes('7b') || idLower.includes('8b')) requiredRam = 8;
    else if (idLower.includes('3b') || idLower.includes('1.5b') || idLower.includes('1b')) requiredRam = 4;

    const totalAvailableRam = hw.ram_total_gb; // We can be conservative and just check sys ram, or add vram.
    
    if (totalAvailableRam >= requiredRam + 4) return { status: 'perfect', text: 'Perfect Match', color: 'bg-green-500/20 text-green-400 border border-green-500/30' };
    if (totalAvailableRam >= requiredRam) return { status: 'okay', text: 'Should Work', color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' };
    return { status: 'warning', text: `Heavy (${requiredRam}GB+ Req)`, color: 'bg-red-500/20 text-red-400 border border-red-500/30' };
  };

  const fetchLocalModels = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/list-local-models');
      const data = await response.json();
      setLocalModels(data.models);
      setActiveModelId(data.active_model);
    } catch (error) {
      addNotification('Failed to load library', 'error');
    }
  };

  const loadModel = async (modelId: string) => {
    setLoadingModel(modelId);
    try {
      await fetch('http://127.0.0.1:3000/load-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_id: modelId })
      });
      addNotification(`Model ${modelId} loaded and ready!`, 'success');
      fetchLocalModels();
    } catch (error) {
      addNotification('Failed to load model', 'error');
    } finally {
      setLoadingModel(null);
    }
  };

  const searchHuggingFace = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://huggingface.co/api/models?search=${query}&filter=gguf&limit=10&sort=downloads&direction=-1`);
      const data = await response.json();
      setModels(data);
    } catch (error: any) {
      addNotification('Failed to search Hugging Face', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const downloadModel = async (modelId: string) => {
    setDownloadingModel(modelId);
    setDownloadProgress(0);
    addNotification(`Starting download: ${modelId}`, 'info');
    
    // Simulate progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    try {
      const response = await fetch('http://127.0.0.1:3000/download-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_id: modelId })
      });
      const data = await response.json();
      
      clearInterval(interval);
      setDownloadProgress(100);
      
      if (data.success) {
        addNotification(`Model downloaded successfully!`, 'success');
      } else {
        addNotification(`Download failed: ${data.error}`, 'error');
      }
    } catch (error: any) {
      clearInterval(interval);
      addNotification('Failed to trigger download', 'error');
    } finally {
      setTimeout(() => {
        setDownloadingModel(null);
        setDownloadProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Model Hub</h2>
          <p className="text-slate-400">Search and download AI models from Hugging Face</p>
        </div>
        
        {hardwareInfo && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-slate-400">CPU</p>
                <p className="text-white font-medium truncate max-w-[150px]" title={hardwareInfo.cpu}>{hardwareInfo.cpu}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
              <Server className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-slate-400">RAM</p>
                <p className="text-white font-medium">{hardwareInfo.ram_total_gb} GB</p>
              </div>
            </div>
            {hardwareInfo.gpu_name !== "Unknown GPU" && (
              <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
                <Zap className="w-4 h-4 text-yellow-400" />
                <div>
                  <p className="text-slate-400">GPU</p>
                  <p className="text-white font-medium truncate max-w-[120px]" title={hardwareInfo.gpu_name}>{hardwareInfo.gpu_name}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-4 px-2 font-semibold transition-all ${activeTab === 'search' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Hugging Face Search
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`pb-4 px-2 font-semibold transition-all ${activeTab === 'library' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          My Library ({localModels.length})
        </button>
      </div>

      {activeTab === 'search' ? (
        <>
          {/* Search Bar */}
          <div className="card bg-slate-800/50">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchHuggingFace()}
                  placeholder="Search models (e.g., Llama 3, Mistral, Qwen)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-lg text-white focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
              <button
                onClick={searchHuggingFace}
                disabled={isSearching}
                className="btn-primary px-8 flex items-center gap-2"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Search
              </button>
            </div>
          </div>

          {/* Search Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.length === 0 && !isSearching && (
              <div className="lg:col-span-3 card py-20 text-center">
                <Box className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                <h3 className="text-xl font-semibold text-white">No models searched</h3>
                <p className="text-slate-500">Search for "Llama" or "Mistral" to get started</p>
              </div>
            )}

            {models.map((model) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card hover:border-cyan-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Box className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                      {model.downloads.toLocaleString()} downloads
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 truncate" title={model.id}>
                  {model.id.split('/')[1] || model.id}
                </h3>
                <p className="text-sm text-slate-400 mb-4 h-10 overflow-hidden line-clamp-2">
                  {model.id.split('/')[0]} • {model.pipeline_tag || 'LLM'}
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Zap className="w-3 h-3 text-yellow-500" /> Fast & Verified
                  </div>
                  {hardwareInfo && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getHardwareMatch(model.id, hardwareInfo).color}`}>
                      {getHardwareMatch(model.id, hardwareInfo).text}
                    </span>
                  )}
                </div>

                {downloadingModel === model.id && (
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Downloading...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress}%` }}
                        className="h-full bg-cyan-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => downloadModel(model.id)}
                    disabled={downloadingModel === model.id}
                    className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2"
                  >
                    {downloadingModel === model.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {downloadingModel === model.id ? 'Downloading...' : 'Download'}
                  </button>
                  <a
                    href={`https://huggingface.co/${model.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        /* Library View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localModels.length === 0 ? (
            <div className="lg:col-span-3 card py-20 text-center">
              <Box className="w-16 h-16 mx-auto text-slate-700 mb-4" />
              <h3 className="text-xl font-semibold text-white">Library is empty</h3>
              <p className="text-slate-500">Download some models from the search tab</p>
            </div>
          ) : (
            localModels.map((model) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`card ${activeModelId === model.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700/50 bg-slate-800/50'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeModelId === model.id ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-slate-700'}`}>
                    {activeModelId === model.id ? <Zap className="w-6 h-6 text-white animate-pulse" /> : <CheckCircle className="w-6 h-6 text-slate-400" />}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${
                    activeModelId === model.id 
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' 
                      : 'bg-green-500/20 text-green-400 border-green-500/30'
                  }`}>
                    {activeModelId === model.id ? 'Active' : 'Ready to Load'}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 truncate">{model.name}</h3>
                <p className="text-xs text-slate-500 mb-6 truncate">{model.path}</p>

                <button
                  onClick={() => loadModel(model.id)}
                  disabled={loadingModel === model.id || activeModelId === model.id}
                  className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl font-semibold transition-all ${
                    activeModelId === model.id 
                      ? 'bg-slate-700 text-slate-400 cursor-default' 
                      : 'btn-primary'
                  }`}
                >
                  {loadingModel === model.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : activeModelId === model.id ? (
                    <Zap className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  {activeModelId === model.id ? 'Currently Active' : 'Load Model'}
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ModelHub;
