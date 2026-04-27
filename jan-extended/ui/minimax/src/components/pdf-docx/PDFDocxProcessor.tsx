import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Scissors, 
  GitMerge, 
  FileType,
  Trash2,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  FolderOpen,
  RefreshCw,
  Settings,
  Copy,
  File
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentStore, useAppStore } from '@/stores';
import type { Document, ConversionTask, MergeTask, SplitTask } from '@/types';

type TabType = 'convert' | 'merge' | 'split' | 'extract';

const PDFDocxProcessor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('convert');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<'pdf' | 'docx' | 'txt'>('docx');
  const [mergeFiles, setMergeFiles] = useState<Document[]>([]);
  const [splitRanges, setSplitRanges] = useState('');
  
  const { 
    documents, 
    conversions, 
    merges, 
    splits,
    addDocument,
    removeDocument,
    addConversion,
    updateConversion,
    addMerge,
    updateMerge,
    addSplit,
    updateSplit
  } = useDocumentStore();
  
  const { addNotification } = useAppStore();

  // File upload handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.name.endsWith('.docx') ||
      file.type === 'text/plain'
    );
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      addNotification(`Uploaded ${validFiles.length} file(s)`, 'success');
    }
  }, [addNotification]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      addNotification(`Uploaded ${files.length} file(s)`, 'success');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Conversion handlers
  const handleConvert = async () => {
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      const taskId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const task: ConversionTask = {
        id: taskId,
        sourceFile: {
          id: taskId,
          name: file.name,
          type: file.name.endsWith('.pdf') ? 'pdf' : 'docx',
          size: file.size,
          uploadedAt: new Date().toISOString(),
          processed: false
        },
        targetFormat,
        status: 'pending',
        progress: 0
      };
      
      addConversion(task);
      
      // Simulate conversion process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updateConversion(taskId, { progress: i, status: i < 100 ? 'processing' : 'completed' });
      }
      
      addDocument({
        ...task.sourceFile,
        id: Date.now().toString(),
        processed: true,
        name: file.name.replace(/\.(pdf|docx)$/i, `.${targetFormat}`)
      });
    }

    addNotification('Conversion completed!', 'success');
    setSelectedFiles([]);
  };

  // Merge handlers
  const handleMerge = async () => {
    if (mergeFiles.length < 2) {
      addNotification('Please select at least 2 files to merge', 'error');
      return;
    }

    const taskId = Date.now().toString();
    const task: MergeTask = {
      id: taskId,
      files: mergeFiles,
      outputName: 'merged-document.pdf',
      status: 'pending',
      progress: 0
    };

    addMerge(task);

    // Simulate merge process
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 150));
      updateMerge(taskId, { progress: i, status: i < 100 ? 'processing' : 'completed' });
    }

    addNotification('Documents merged successfully!', 'success');
    setMergeFiles([]);
  };

  // Split handlers
  const handleSplit = async () => {
    if (mergeFiles.length !== 1) {
      addNotification('Please select exactly 1 PDF file to split', 'error');
      return;
    }

    const taskId = Date.now().toString();
    const task: SplitTask = {
      id: taskId,
      sourceFile: mergeFiles[0],
      splitOptions: {
        byPages: true,
        pageRanges: splitRanges.split(',').map(r => r.trim()).filter(Boolean)
      },
      status: 'pending',
      progress: 0
    };

    addSplit(task);

    // Simulate split process
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 150));
      updateSplit(taskId, { progress: i, status: i < 100 ? 'processing' : 'completed' });
    }

    addNotification('Document split successfully!', 'success');
    setMergeFiles([]);
    setSplitRanges('');
  };

  const handleExtractText = async () => {
    if (selectedFiles.length === 0) {
      addNotification('Please select a file to extract text from', 'error');
      return;
    }
    
    addNotification('Extracting text...', 'info');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);
      
      const response = await fetch('http://localhost:3000/extract-text', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        addNotification('Text extracted successfully! Added to context.', 'success');
        // Actually copy to clipboard for user convenience too
        navigator.clipboard.writeText(data.text);
        addNotification('Text copied to clipboard!', 'info');
        
        // Let's add it as a new document text blob just so they can see it
        const taskId = Date.now().toString();
        addDocument({
            id: taskId,
            name: selectedFiles[0].name.replace(/\.(pdf|docx)$/i, '_extracted.txt'),
            type: 'txt',
            size: data.text.length,
            uploadedAt: new Date().toISOString(),
            processed: true
        });
      } else {
        addNotification(`Extraction failed: ${data.error}`, 'error');
      }
    } catch (error: any) {
      addNotification(`Extraction failed: ${error.message}`, 'error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const tabs = [
    { id: 'convert' as TabType, label: 'Convert', icon: RefreshCw },
    { id: 'merge' as TabType, label: 'Merge', icon: GitMerge },
    { id: 'split' as TabType, label: 'Split', icon: Scissors },
    { id: 'extract' as TabType, label: 'Extract', icon: Copy },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card border-2 border-dashed transition-all duration-300 ${
              dragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600 hover:border-slate-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center py-12">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 
                            flex items-center justify-center mb-6 ${dragActive ? 'animate-bounce' : ''}`}>
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {dragActive ? 'Drop files here!' : 'Drag & Drop Files'}
              </h3>
              <p className="text-slate-400 mb-6">or</p>
              <label className="btn-primary cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Browse Files
                </span>
              </label>
              <p className="text-xs text-slate-500 mt-4">Supports PDF, DOCX, DOC, TXT</p>
            </div>
          </motion.div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <File className="w-5 h-5 text-cyan-400" />
                  Selected Files ({selectedFiles.length})
                </h3>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Convert Options */}
          {activeTab === 'convert' && selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Conversion Options</h3>
              <div className="grid grid-cols-3 gap-4">
                {(['pdf', 'docx', 'txt'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setTargetFormat(format)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      targetFormat === format
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <FileType className={`w-8 h-8 mx-auto mb-2 ${
                      targetFormat === format ? 'text-cyan-400' : 'text-slate-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      targetFormat === format ? 'text-white' : 'text-slate-400'
                    }`}>
                      {format.toUpperCase()}
                    </p>
                  </button>
                ))}
              </div>
              <button
                onClick={handleConvert}
                className="w-full btn-primary mt-6 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Start Conversion
              </button>
            </motion.div>
          )}

          {/* Merge Options */}
          {activeTab === 'merge' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Merge Documents</h3>
              <p className="text-slate-400 mb-4">
                Select 2 or more PDF/DOCX files to merge into a single document.
              </p>
              {mergeFiles.length >= 2 && (
                <button
                  onClick={handleMerge}
                  className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
                >
                  <GitMerge className="w-5 h-5" />
                  Merge Files
                </button>
              )}
            </motion.div>
          )}

          {/* Split Options */}
          {activeTab === 'split' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Split Document</h3>
              <p className="text-slate-400 mb-4">
                Enter page ranges to split (e.g., 1-3, 4-6, 7-10)
              </p>
              <input
                type="text"
                value={splitRanges}
                onChange={(e) => setSplitRanges(e.target.value)}
                placeholder="e.g., 1-3, 4-6, 7-10"
                className="input-field mb-4"
              />
              {mergeFiles.length === 1 && (
                <button
                  onClick={handleSplit}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Scissors className="w-5 h-5" />
                  Split Document
                </button>
              )}
            </motion.div>
          )}

          {/* Extract Options */}
          {activeTab === 'extract' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Extract Text</h3>
              <p className="text-slate-400 mb-4">
                Extract text content from PDF or DOCX files.
              </p>
              <button
                onClick={handleExtractText}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Extract Text
              </button>
            </motion.div>
          )}

          {/* Active Tasks */}
          {(conversions.length > 0 || merges.length > 0 || splits.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Active Tasks</h3>
              <div className="space-y-4">
                {[...conversions, ...merges, ...splits].slice(0, 5).map((task: any) => (
                  <div key={task.id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-xl">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <p className="text-sm text-white">{task.sourceFile?.name || task.outputName || 'Task'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{task.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar - Recent Documents */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Documents</h3>
              <button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {documents.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No documents yet</p>
              ) : (
                documents.slice(0, 10).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/30 transition-colors cursor-pointer group"
                    onClick={() => {
                      if (activeTab === 'merge' || activeTab === 'split') {
                        setMergeFiles([...mergeFiles, doc]);
                      }
                    }}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      doc.type === 'pdf' ? 'bg-red-500/20' : 'bg-blue-500/20'
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        doc.type === 'pdf' ? 'text-red-400' : 'text-blue-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(doc.size)}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-slate-600 text-slate-400 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-600 text-slate-400 hover:text-white">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Documents</span>
                <span className="text-white font-semibold">{documents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Conversions</span>
                <span className="text-white font-semibold">{conversions.filter((c: any) => c.status === 'completed').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Merged</span>
                <span className="text-white font-semibold">{merges.filter((m: any) => m.status === 'completed').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Split</span>
                <span className="text-white font-semibold">{splits.filter((s: any) => s.status === 'completed').length}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PDFDocxProcessor;
