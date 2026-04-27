import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, RefreshCw, FileText, CheckCircle, Clock, AlertCircle, HardDrive, Shield } from 'lucide-react';
import { useAppStore } from '@/stores';

const KnowledgeBase: React.FC = () => {
  const { addNotification } = useAppStore();
  const [status, setStatus] = useState<any>(null);
  const [isIndexing, setIsIndexing] = useState(false);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3000/memory/status');
      const data = await res.json();
      if (data.success) {
        setStatus(data);
        setIsIndexing(data.is_indexing);
      }
    } catch (e) {}
  };

  const startIndexing = async () => {
    setIsIndexing(true);
    addNotification('Started indexing your Documents folder...', 'info');
    try {
      const res = await fetch('http://127.0.0.1:3000/memory/index', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addNotification(data.message, 'success');
      }
    } catch (e) {
      addNotification('Indexing failed.', 'error');
    } finally {
      setIsIndexing(false);
      fetchStatus();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Knowledge Base (RAG)</h2>
          <p className="text-slate-400">Local document indexing for AI long-term memory</p>
        </div>
        <button
          onClick={startIndexing}
          disabled={isIndexing}
          className={`btn-primary flex items-center gap-2 ${isIndexing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isIndexing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {isIndexing ? 'Indexing...' : 'Refresh Memory'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-cyan-500/5 border-cyan-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl">
              <Database className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Memory Fragments</p>
              <h3 className="text-2xl font-bold text-white">{status?.count || 0}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-cyan-400/70">
            <CheckCircle className="w-3 h-3" />
            <span>Semantic Vector DB Active</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Auto-Scan Directory</p>
              <h3 className="text-lg font-bold text-white truncate">~/Documents</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>Last scan: {status?.is_indexing ? 'Running now...' : 'Recent'}</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Privacy Status</p>
              <h3 className="text-lg font-bold text-white">100% Offline</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400/70">
            <HardDrive className="w-3 h-3" />
            <span>Encrypted Local Storage</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="card bg-slate-900/50">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-500 mt-1" />
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-bold">How Memory Works</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                The Knowledge Base scans your documents and breaks them into small semantic "chunks". 
                When you ask a question, the AI performs a high-speed mathematical search through these chunks 
                to find the most relevant context. This allows the AI to answer questions about your specific projects, 
                emails, and files without any data ever leaving your computer.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-xs font-bold text-white mb-1">Supported Formats</p>
                <p className="text-[10px] text-slate-500">PDF, DOCX, TXT, MD, LOG</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-xs font-bold text-white mb-1">Vector Model</p>
                <p className="text-[10px] text-slate-500">all-MiniLM-L6-v2 (Natively Optimized)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
