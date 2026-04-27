import React, { useState } from 'react';
import { 
  Monitor, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Terminal,
  File,
  FolderOpen,
  Globe,
  Code,
  Database,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Settings,
  History,
  TerminalIcon,
  Cpu,
  HardDrive,
  Network,
  Shield,
  Zap,
  ChevronRight,
  Copy,
  Download,
  Eye,
  MoreVertical,
  PlayCircle,
  StopCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComputerStore, useAppStore } from '@/stores';
import type { ComputerTask, TaskType, AutomationScript, TaskStep } from '@/types';

const ComputerExpert: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'automation' | 'terminal'>('tasks');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewScriptModal, setShowNewScriptModal] = useState(false);
  const [newTaskType, setNewTaskType] = useState<TaskType>('file_operations');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isTerminalExecuting, setIsTerminalExecuting] = useState(false);
  
  const { 
    tasks, 
    scripts,
    activeTask,
    addTask,
    updateTask,
    deleteTask,
    setActiveTask,
    addScript,
    updateScript,
    deleteScript
  } = useComputerStore();
  
  const { addNotification } = useAppStore();

  const taskTypes: { type: TaskType; label: string; icon: any; description: string }[] = [
    { type: 'file_operations', label: 'File Operations', icon: File, description: 'Copy, move, delete, organize files' },
    { type: 'web_browser', label: 'Web Browser', icon: Globe, description: 'Automate web browsing tasks' },
    { type: 'code_execution', label: 'Code Execution', icon: Code, description: 'Run code snippets and scripts' },
    { type: 'data_processing', label: 'Data Processing', icon: Database, description: 'Process and transform data' },
    { type: 'automation', label: 'Automation', icon: Zap, description: 'Create automated workflows' },
  ];

  const executeAITask = async (task: ComputerTask) => {
    const steps: TaskStep[] = [
      { id: '1', action: 'Analyzing', description: 'AI is analyzing task requirements...', status: 'in-progress' }
    ];

    updateTask(task.id, { steps, status: 'in-progress' });
    setActiveTask({ ...task, steps, status: 'in-progress' });

    try {
      // 1. Ask AI to generate PowerShell command
      const prompt = `You are a Computer Expert agent. You write PowerShell commands for Windows.
Task: ${task.description}
Respond ONLY with the exact PowerShell command to execute this task. No explanation, no markdown formatting. Just the raw command.`;

      const chatRes = await fetch('http://127.0.0.1:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const chatData = await chatRes.json();
      let command = chatData.choices[0].message.content.trim();
      
      // Remove any markdown code blocks if the AI ignored instructions
      command = command.replace(/^```powershell\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');

      steps[0].status = 'completed';
      steps.push({ id: '2', action: 'Executing', description: `Running: ${command.substring(0, 50)}...`, status: 'in-progress' });
      updateTask(task.id, { steps });

      // 2. Execute the command
      const termRes = await fetch('http://127.0.0.1:3000/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const termData = await termRes.json();

      steps[1].status = 'completed';
      
      if (termData.exit_code === 0 || termData.output) {
        updateTask(task.id, { 
          status: 'completed',
          completedAt: new Date().toISOString(),
          result: { success: true, message: `Output: ${termData.output.substring(0, 100)}...` }
        });
        addNotification('Task completed successfully!', 'success');
      } else {
        throw new Error(termData.error || 'Command failed');
      }
    } catch (error: any) {
      steps[steps.length - 1].status = 'failed';
      updateTask(task.id, { 
        status: 'failed',
        result: { success: false, message: error.message }
      });
      addNotification(`Task failed: ${error.message}`, 'error');
    }
  };

  const createNewTask = () => {
    if (!newTaskDescription.trim()) {
      addNotification('Please enter a task description', 'error');
      return;
    }

    const newTask: ComputerTask = {
      id: Date.now().toString(),
      type: newTaskType,
      description: newTaskDescription,
      status: 'pending',
      steps: [],
      createdAt: new Date().toISOString(),
    };

    addTask(newTask);
    setShowNewTaskModal(false);
    setNewTaskDescription('');
    addNotification('Task created!', 'success');
  };

  const createNewScript = () => {
    const newScript: AutomationScript = {
      id: Date.now().toString(),
      name: 'New Automation Script',
      description: 'Custom automation workflow',
      steps: [
        { action: 'open_app', target: 'notepad', value: '' },
        { action: 'type_text', target: 'Hello World', value: '' },
        { action: 'save_file', target: 'document.txt', value: '' },
      ],
      createdAt: new Date().toISOString(),
    };

    addScript(newScript);
    setShowNewScriptModal(false);
    addNotification('Automation script created!', 'success');
  };

  const executeTerminalCommand = async () => {
    if (!terminalInput.trim()) return;
    
    setIsTerminalExecuting(true);
    const command = terminalInput;
    setTerminalOutput(prev => [...prev, `$ ${command}`]);
    setTerminalInput('');
    
    try {
      const response = await fetch('http://127.0.0.1:3000/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data = await response.json();
      setTerminalOutput(prev => [...prev, data.output]);
    } catch (error: any) {
      setTerminalOutput(prev => [...prev, `Error: ${error.message}`]);
    }
    
    setIsTerminalExecuting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'in-progress':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      case 'in-progress': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-yellow-400 bg-yellow-400/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Computer Expert</h2>
          <p className="text-slate-400">Automate tasks and control your computer with AI</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowNewTaskModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl w-fit">
        {[
          { id: 'tasks' as const, label: 'Tasks', icon: Monitor },
          { id: 'automation' as const, label: 'Automation', icon: Zap },
          { id: 'terminal' as const, label: 'Terminal', icon: TerminalIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task Types Grid */}
      {activeTab === 'tasks' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {taskTypes.map((type) => (
            <motion.div
              key={type.type}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card hover:border-orange-500/50 transition-all cursor-pointer group"
              onClick={() => {
                setNewTaskType(type.type);
                setShowNewTaskModal(true);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 group-hover:scale-110 transition-transform">
                  <type.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{type.label}</h3>
                  <p className="text-sm text-slate-400">{type.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Tasks */}
          {activeTab === 'tasks' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Active Tasks</h3>
                <span className="text-sm text-slate-400">{tasks.filter(t => t.status === 'in-progress').length} running</span>
              </div>
              
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Monitor className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Tasks Yet</h3>
                  <p className="text-slate-400">Create a new task or select a task type above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        activeTask?.id === task.id
                          ? 'bg-orange-500/10 border-orange-500/50'
                          : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                      }`}
                      onClick={() => setActiveTask(task)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(task.status)}
                          <div>
                            <p className="text-white font-medium">{task.description}</p>
                            <p className="text-xs text-slate-400 capitalize">{task.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          {task.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                executeAITask(task);
                              }}
                              className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {task.status === 'in-progress' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTask(task.id, { status: 'failed' });
                                addNotification('Task stopped', 'info');
                              }}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                              <Square className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      {task.steps.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {task.steps.map((step) => (
                            <div key={step.id} className="flex items-center gap-3">
                              {getStatusIcon(step.status)}
                              <div className="flex-1">
                                <p className="text-sm text-white">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Automation Scripts */}
          {activeTab === 'automation' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Automation Scripts</h3>
                <button 
                  onClick={() => setShowNewScriptModal(true)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Script
                </button>
              </div>

              {scripts.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Scripts Yet</h3>
                  <p className="text-slate-400">Create automation scripts to streamline your workflow</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scripts.map((script) => (
                    <div key={script.id} className="p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-orange-500/20">
                            <Zap className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{script.name}</h4>
                            <p className="text-sm text-slate-400">{script.description}</p>
                            <p className="text-xs text-slate-500 mt-2">{script.steps.length} steps</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                            <PlayCircle className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-slate-600 text-slate-400 hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Terminal */}
          {activeTab === 'terminal' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TerminalIcon className="w-5 h-5 text-green-400" />
                  Terminal
                </h3>
                <button
                  onClick={() => setTerminalOutput([])}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm h-80 overflow-y-auto">
                <div className="text-slate-400 mb-2">AI Desktop Terminal v1.0.0</div>
                <div className="text-slate-400 mb-4">Type 'help' for available commands</div>
                
                {terminalOutput.map((line, i) => (
                  <div key={i} className={line.startsWith('$') ? 'text-green-400' : 'text-slate-300'}>
                    {line}
                  </div>
                ))}
                
                {isTerminalExecuting && (
                  <div className="text-blue-400 animate-pulse">Executing...</div>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && executeTerminalCommand()}
                  placeholder="Enter command..."
                  className="flex-1 input-field font-mono text-sm"
                />
                <button
                  onClick={executeTerminalCommand}
                  disabled={isTerminalExecuting}
                  className="btn-primary flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Run
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Tasks</span>
                <span className="text-white font-semibold">{tasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Completed</span>
                <span className="text-green-400 font-semibold">{tasks.filter(t => t.status === 'completed').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">In Progress</span>
                <span className="text-blue-400 font-semibold">{tasks.filter(t => t.status === 'in-progress').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Scripts</span>
                <span className="text-white font-semibold">{scripts.length}</span>
              </div>
            </div>
          </motion.div>

          {/* System Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">System Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-sm text-white">CPU Usage</p>
                  <div className="w-32 h-2 bg-slate-700 rounded-full mt-1">
                    <div className="w-3/4 h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-white">Memory</p>
                  <div className="w-32 h-2 bg-slate-700 rounded-full mt-1">
                    <div className="w-1/2 h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Network className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-white">Network</p>
                  <p className="text-xs text-slate-400">Connected</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <span className="text-sm">Restart System</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm">Security Scan</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors">
                <Database className="w-5 h-5 text-purple-400" />
                <span className="text-sm">Backup Data</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* New Task Modal */}
      <AnimatePresence>
        {showNewTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewTaskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-6">Create New Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Task Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {taskTypes.map((type) => (
                      <button
                        key={type.type}
                        onClick={() => setNewTaskType(type.type)}
                        className={`p-3 rounded-lg border transition-all ${
                          newTaskType === type.type
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <type.icon className={`w-5 h-5 mx-auto mb-1 ${
                          newTaskType === type.type ? 'text-orange-400' : 'text-slate-400'
                        }`} />
                        <p className={`text-xs ${
                          newTaskType === type.type ? 'text-white' : 'text-slate-400'
                        }`}>{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Description</label>
                  <textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Describe what you want to accomplish..."
                    className="input-field min-h-24 resize-none"
                  />
                </div>

                <button onClick={createNewTask} className="w-full btn-primary">
                  Create Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Script Modal */}
      <AnimatePresence>
        {showNewScriptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewScriptModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-6">Create Automation Script</h3>
              <p className="text-slate-400 mb-6">
                Create a custom automation script with multiple steps.
              </p>
              <button onClick={createNewScript} className="w-full btn-primary">
                Create Script
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComputerExpert;
