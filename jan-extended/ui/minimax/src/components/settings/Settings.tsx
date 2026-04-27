import React, { useState } from 'react';
import { 
  Settings as SettingsIcon,
  User,
  Palette,
  Zap,
  Shield,
  Globe,
  Bell,
  HardDrive,
  Key,
  Monitor,
  Moon,
  Sun,
  Volume2,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  ExternalLink,
  Info,
  ChevronRight,
  Save,
  RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettingsStore, useUserStore, useAppStore } from '@/stores';

type SettingsTab = 'general' | 'appearance' | 'performance' | 'security' | 'integrations' | 'about';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  
  const { settings, updateGeneral, updateAppearance, updatePerformance, updateSecurity, updateIntegrations } = useSettingsStore();
  const { user, updatePreferences } = useUserStore();
  const { addNotification } = useAppStore();

  const saveSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    addNotification('Settings saved successfully!', 'success');
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      addNotification('Settings reset to default', 'info');
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: SettingsIcon },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'performance' as const, label: 'Performance', icon: Zap },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'integrations' as const, label: 'Integrations', icon: Globe },
    { id: 'about' as const, label: 'About', icon: Info },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-slate-400">Customize your AI Desktop experience</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={resetSettings}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
          <button 
            onClick={saveSettings}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="card sticky top-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">General Settings</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Language</p>
                      <p className="text-sm text-slate-400">Select your preferred language</p>
                    </div>
                    <select
                      value={settings.general.language}
                      onChange={(e) => updateGeneral({ language: e.target.value })}
                      className="input-field w-48"
                    >
                      <option value="en">English</option>
                      <option value="zh">中文</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Timezone</p>
                      <p className="text-sm text-slate-400">Set your local timezone</p>
                    </div>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => updateGeneral({ timezone: e.target.value })}
                      className="input-field w-48"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Asia/Shanghai">Shanghai</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Date Format</p>
                      <p className="text-sm text-slate-400">Choose date display format</p>
                    </div>
                    <select
                      value={settings.general.dateFormat}
                      onChange={(e) => updateGeneral({ dateFormat: e.target.value })}
                      className="input-field w-48"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Time Format</p>
                      <p className="text-sm text-slate-400">12-hour or 24-hour format</p>
                    </div>
                    <select
                      value={settings.general.timeFormat}
                      onChange={(e) => updateGeneral({ timeFormat: e.target.value as '12h' | '24h' })}
                      className="input-field w-48"
                    >
                      <option value="12h">12-hour</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">Startup & Updates</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Auto-start on login</p>
                      <p className="text-sm text-slate-400">Launch AI Desktop when you log in</p>
                    </div>
                    <button
                      onClick={() => updateGeneral({ autoStart: !settings.general.autoStart })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.general.autoStart ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.general.autoStart ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Auto-update</p>
                      <p className="text-sm text-slate-400">Automatically download and install updates</p>
                    </div>
                    <button
                      onClick={() => updateGeneral({ autoUpdate: !settings.general.autoUpdate })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.general.autoUpdate ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.general.autoUpdate ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">Theme</h3>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {['dark', 'light', 'custom'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => updateAppearance({ theme: theme as any })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.appearance.theme === theme
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className={`w-12 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center ${
                        theme === 'dark' ? 'bg-slate-800' : theme === 'light' ? 'bg-white' : 'bg-gradient-to-br from-cyan-500 to-purple-600'
                      }`}>
                        {theme === 'dark' ? (
                          <Moon className="w-4 h-4 text-slate-400" />
                        ) : theme === 'light' ? (
                          <Sun className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <Palette className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <p className="text-sm text-white capitalize">{theme}</p>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Accent Color</p>
                    <p className="text-sm text-slate-400">Choose your accent color</p>
                  </div>
                  <div className="flex gap-2">
                    {['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateAppearance({ accentColor: color })}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                          settings.appearance.accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">Typography</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Font Family</p>
                      <p className="text-sm text-slate-400">Choose your preferred font</p>
                    </div>
                    <select
                      value={settings.appearance.fontFamily}
                      onChange={(e) => updateAppearance({ fontFamily: e.target.value })}
                      className="input-field w-48"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Font Size</p>
                      <p className="text-sm text-slate-400">Adjust text size ({settings.appearance.fontSize}px)</p>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="20"
                      value={settings.appearance.fontSize}
                      onChange={(e) => updateAppearance({ fontSize: parseInt(e.target.value) })}
                      className="w-48 accent-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">Display</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Compact Mode</p>
                      <p className="text-sm text-slate-400">Use smaller UI elements</p>
                    </div>
                    <button
                      onClick={() => updateAppearance({ compactMode: !settings.appearance.compactMode })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.appearance.compactMode ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.appearance.compactMode ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Animations</p>
                      <p className="text-sm text-slate-400">Enable smooth transitions</p>
                    </div>
                    <button
                      onClick={() => updateAppearance({ animations: !settings.appearance.animations })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.appearance.animations ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.appearance.animations ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Performance Settings */}
          {activeTab === 'performance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">Performance</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Max Concurrent Tasks</p>
                      <p className="text-sm text-slate-400">Number of tasks to run simultaneously</p>
</div>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.performance.maxConcurrentTasks}
                      onChange={(e) => updatePerformance({ maxConcurrentTasks: parseInt(e.target.value) })}
                      className="input-field w-24 text-center"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Cache Size (MB)</p>
                      <p className="text-sm text-slate-400">Maximum cache storage</p>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="2000"
                      step="100"
                      value={settings.performance.cacheSize}
                      onChange={(e) => updatePerformance({ cacheSize: parseInt(e.target.value) })}
                      className="w-48 accent-cyan-500"
                    />
                    <span className="text-white w-16 text-right">{settings.performance.cacheSize} MB</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Hardware Acceleration</p>
                      <p className="text-sm text-slate-400">Use GPU for better performance</p>
                    </div>
                    <button
                      onClick={() => updatePerformance({ enableHardwareAcceleration: !settings.performance.enableHardwareAcceleration })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.performance.enableHardwareAcceleration ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.performance.enableHardwareAcceleration ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Lazy Loading</p>
                      <p className="text-sm text-slate-400">Load content on demand</p>
                    </div>
                    <button
                      onClick={() => updatePerformance({ lazyLoading: !settings.performance.lazyLoading })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.performance.lazyLoading ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.performance.lazyLoading ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">Data Management</h3>
                <div className="flex gap-4">
                  <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                    <HardDrive className="w-5 h-5" />
                    Clear Cache
                  </button>
                  <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Clear Data
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">Authentication</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Require Authentication</p>
                      <p className="text-sm text-slate-400">Require password to open app</p>
                    </div>
                    <button
                      onClick={() => updateSecurity({ requireAuth: !settings.security.requireAuth })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.security.requireAuth ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.security.requireAuth ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Session Timeout (minutes)</p>
                      <p className="text-sm text-slate-400">Auto-lock after inactivity</p>
                    </div>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSecurity({ sessionTimeout: parseInt(e.target.value) })}
                      className="input-field w-24 text-center"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Encrypt Local Data</p>
                      <p className="text-sm text-slate-400">Protect saved files with encryption</p>
                    </div>
                    <button
                      onClick={() => updateSecurity({ encryptLocalData: !settings.security.encryptLocalData })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.security.encryptLocalData ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.security.encryptLocalData ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">Privacy</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Allow Telemetry</p>
                      <p className="text-sm text-slate-400">Send anonymous usage data</p>
                    </div>
                    <button
                      onClick={() => updateSecurity({ allowTelemetry: !settings.security.allowTelemetry })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.security.allowTelemetry ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.security.allowTelemetry ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Integrations Settings */}
          {activeTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">Cloud Storage</h3>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { id: 'none', name: 'None', icon: HardDrive },
                    { id: 'dropbox', name: 'Dropbox', icon: Globe },
                    { id: 'gdrive', name: 'Google Drive', icon: Globe },
                    { id: 'onedrive', name: 'OneDrive', icon: Globe },
                  ].map((service) => (
                    <button
                      key={service.id}
                      onClick={() => updateIntegrations({ cloudStorage: service.id as any })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.integrations.cloudStorage === service.id
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <service.icon className={`w-8 h-8 mx-auto mb-2 ${
                        settings.integrations.cloudStorage === service.id ? 'text-cyan-400' : 'text-slate-400'
                      }`} />
                      <p className={`text-sm ${
                        settings.integrations.cloudStorage === service.id ? 'text-white' : 'text-slate-400'
                      }`}>{service.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">API Keys</h3>
                <p className="text-slate-400 mb-4">Configure external API keys for enhanced functionality</p>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="OpenAI API Key"
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Anthropic API Key"
                    className="input-field"
                  />
                  <button className="btn-primary w-full">Save API Keys</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* About */}
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">AI Desktop</h3>
                <p className="text-slate-400 mb-6">Version 1.0.0</p>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  A powerful desktop application powered by AI, designed to enhance your productivity
                  and streamline your workflow across multiple domains.
                </p>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">System Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Platform</span>
                    <span className="text-white">Web (Electron)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">React Version</span>
                    <span className="text-white">18.2.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Build</span>
                    <span className="text-white">Production</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6">Links</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <span className="text-white">Documentation</span>
                    <ExternalLink className="w-5 h-5 text-slate-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <span className="text-white">Report an Issue</span>
                    <ExternalLink className="w-5 h-5 text-slate-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <span className="text-white">Privacy Policy</span>
                    <ExternalLink className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
