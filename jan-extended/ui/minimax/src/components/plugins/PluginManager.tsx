import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Smartphone, Globe, Layout, Link2, Shield, Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { usePluginStore } from '@/stores';

const PluginManager: React.FC = () => {
  const { plugins, togglePlugin } = usePluginStore();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail': return <Mail className="w-6 h-6" />;
      case 'MessageCircle': return <MessageCircle className="w-6 h-6" />;
      case 'Smartphone': return <Smartphone className="w-6 h-6" />;
      case 'Globe': return <Globe className="w-6 h-6" />;
      case 'Layout': return <Layout className="w-6 h-6" />;
      default: return <Link2 className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Plugin Channels</h2>
        <p className="text-slate-400">Connect and manage external application bridges</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((plugin) => (
          <motion.div
            key={plugin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card group hover:border-cyan-500/50 transition-all ${plugin.connected ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-slate-800/50'}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                plugin.connected ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-700 text-slate-400'
              }`}>
                {getIcon(plugin.icon)}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                  plugin.connected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-700/50 text-slate-500 border border-slate-600/30'
                }`}>
                  {plugin.status}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{plugin.name}</h3>
            <p className="text-sm text-slate-400 mb-6 min-h-[40px]">
              {plugin.description}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => togglePlugin(plugin.id)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  plugin.connected 
                    ? 'bg-slate-700 hover:bg-red-500/10 hover:text-red-400 text-slate-300' 
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                }`}
              >
                {plugin.connected ? <XCircle className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                {plugin.connected ? 'Disconnect' : 'Connect Channel'}
              </button>
              <button className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-400 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {plugin.connected && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-[10px] text-cyan-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>AI Agent has full read/write permissions</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* Add Custom Plugin Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-slate-800/30 border-dashed border-2 border-slate-700 flex flex-col items-center justify-center py-10 hover:border-cyan-500/50 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
            <Link2 className="w-6 h-6 text-slate-500 group-hover:text-cyan-400" />
          </div>
          <span className="text-sm font-semibold text-slate-500 group-hover:text-cyan-400">Add Custom Channel</span>
        </motion.div>
      </div>

      {/* Connection Info */}
      <div className="card bg-slate-900/50 border-slate-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">Secure Channel Bridge</h4>
            <p className="text-sm text-slate-400 max-w-2xl">
              Plugin Channels use encrypted local pipes to communicate with desktop applications. 
              Data never leaves your machine. The AI OS provides an isolated environment for each connector 
              to ensure your privacy and security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginManager;
