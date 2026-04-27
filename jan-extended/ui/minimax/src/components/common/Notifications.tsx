import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAppStore } from '@/stores';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications: React.FC = () => {
  const { notifications, removeNotification } = useAppStore();

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0].id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, removeNotification]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500/50';
      case 'error':
        return 'border-red-500/50';
      default:
        return 'border-blue-500/50';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`bg-slate-800/95 backdrop-blur-xl border ${getBorderColor(notification.type)} 
                       rounded-xl p-4 shadow-2xl min-w-80 max-w-md`}
          >
            <div className="flex items-start gap-3">
              {getIcon(notification.type)}
              <p className="flex-1 text-sm text-white">{notification.message}</p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
