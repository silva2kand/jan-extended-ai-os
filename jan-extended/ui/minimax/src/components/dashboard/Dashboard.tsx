import React from 'react';
import { 
  FileText, 
  Search, 
  FileEdit, 
  Presentation, 
  Monitor,
  TrendingUp,
  Activity,
  Clock,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProjectStore, useAppStore } from '@/stores';

const modules = [
  {
    path: '/pdf-docx',
    icon: FileText,
    title: 'PDF & DOCX',
    description: 'Convert, merge, split, and process documents',
    color: 'from-red-500 to-orange-500',
    stats: '1,234 documents processed',
  },
  {
    path: '/researcher',
    icon: Search,
    title: 'Researcher',
    description: 'Search, analyze, and gather research data',
    color: 'from-blue-500 to-cyan-500',
    stats: '89 research topics',
  },
  {
    path: '/report-writer',
    icon: FileEdit,
    title: 'Report Writer',
    description: 'Create professional reports and documents',
    color: 'from-green-500 to-emerald-500',
    stats: '45 reports created',
  },
  {
    path: '/slide-maker',
    icon: Presentation,
    title: 'Slide Maker',
    description: 'Design stunning presentations',
    color: 'from-purple-500 to-pink-500',
    stats: '23 presentations',
  },
  {
    path: '/computer-expert',
    icon: Monitor,
    title: 'Computer Expert',
    description: 'Automate tasks and computer operations',
    color: 'from-orange-500 to-amber-500',
    stats: '156 tasks automated',
  },
];

const recentActivity = [
  { id: 1, action: 'Converted PDF to DOCX', time: '2 minutes ago', icon: FileText, color: 'text-red-400' },
  { id: 2, action: 'Completed research on AI trends', time: '15 minutes ago', icon: Search, color: 'text-blue-400' },
  { id: 3, action: 'Generated Q4 Report', time: '1 hour ago', icon: FileEdit, color: 'text-green-400' },
  { id: 4, action: 'Created sales presentation', time: '2 hours ago', icon: Presentation, color: 'text-purple-400' },
  { id: 5, action: 'Automated backup process', time: '3 hours ago', icon: Monitor, color: 'text-orange-400' },
];

const stats = [
  { label: 'Total Documents', value: '1,847', icon: FileText, change: '+12%', color: 'text-red-400' },
  { label: 'Research Hours', value: '342h', icon: Search, change: '+8%', color: 'text-blue-400' },
  { label: 'Reports Generated', value: '127', icon: FileEdit, change: '+23%', color: 'text-green-400' },
  { label: 'Tasks Automated', value: '1,293', icon: Monitor, change: '+45%', color: 'text-orange-400' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { projects } = useProjectStore();
  const { addNotification } = useAppStore();

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card group hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-slate-700/50 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-sm text-green-400">
                <TrendingUp className="w-4 h-4" />
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Welcome to AI Desktop!</h3>
              <p className="text-slate-400">Your all-in-one productivity suite powered by AI</p>
            </div>
          </div>
          <button 
            onClick={() => addNotification('New project created!', 'success')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      </motion.div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={() => navigate(module.path)}
              className="card cursor-pointer group hover:scale-105 transition-all duration-300 
                        hover:shadow-xl hover:shadow-cyan-500/10"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} 
                            flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <module.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{module.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{module.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{module.stats}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 
                                     group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity & Quick Start */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Recent Activity
            </h3>
            <button className="text-sm text-cyan-400 hover:text-cyan-300">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
                <div className={`p-2 rounded-lg bg-slate-700/50 ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Start Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Quick Start Guide
          </h3>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Upload Documents', desc: 'Drag & drop or select files to process' },
              { step: 2, title: 'Choose Action', desc: 'Convert, merge, split, or analyze' },
              { step: 3, title: 'AI Processing', desc: 'Our AI handles the complex work' },
              { step: 4, title: 'Download Results', desc: 'Get your processed files instantly' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 
                              flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
