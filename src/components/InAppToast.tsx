/**
 * In-App Toast Notifications
 * Custom toast system for real-time notifications
 * Works everywhere - no dependency on push notifications
 */

import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Image as ImageIcon, Heart, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastNotification {
  id: string;
  type: 'message' | 'memory' | 'milestone' | 'prompt';
  title: string;
  body: string;
  avatar?: string;
  thumbnail?: string;
  timestamp: Date;
  onClick?: () => void;
  onClose?: () => void;
  duration?: number; // ms, default 5000
}

interface InAppToastContainerProps {
  notifications: ToastNotification[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

export function InAppToastContainer({
  notifications,
  onClose,
  position = 'top-right',
}: InAppToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none`}
    >
      <AnimatePresence>
        {notifications.map((notification) => (
          <InAppToast
            key={notification.id}
            notification={notification}
            onClose={() => onClose(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface InAppToastProps {
  notification: ToastNotification;
  onClose: () => void;
}

function InAppToast({ notification, onClose }: InAppToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const duration = notification.duration || 5000;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    if (notification.onClose) {
      notification.onClose();
    }
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClick = () => {
    if (notification.onClick) {
      notification.onClick();
      handleClose();
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'memory':
        return <ImageIcon className="w-5 h-5" />;
      case 'milestone':
        return <Heart className="w-5 h-5" />;
      case 'prompt':
        return <FileText className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'message':
        return 'bg-blue-600 text-white';
      case 'memory':
        return 'bg-purple-600 text-white';
      case 'milestone':
        return 'bg-pink-600 text-white';
      case 'prompt':
        return 'bg-green-600 text-white';
      default:
        return 'bg-[#36453B] text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: isExiting ? 0 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="pointer-events-auto"
    >
      <div
        className={`
          bg-white dark:bg-gray-800 
          rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
          overflow-hidden
          ${notification.onClick ? 'cursor-pointer hover:shadow-xl' : ''}
          transition-shadow
        `}
        onClick={handleClick}
      >
        <div className="flex items-start gap-3 p-4">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getColorClasses()}`}>
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm leading-tight">
                {notification.title}
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {notification.body}
            </p>

            {/* Thumbnail */}
            {notification.thumbnail && (
              <div className="mt-2">
                <img
                  src={notification.thumbnail}
                  alt="Preview"
                  className="w-full h-20 object-cover rounded"
                />
              </div>
            )}

            {/* Avatar */}
            {notification.avatar && (
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={notification.avatar}
                  alt="Sender"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(notification.timestamp)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {duration > 0 && (
          <motion.div
            className={`h-1 ${getColorClasses()}`}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        )}
      </div>
    </motion.div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Hook to manage toast notifications
 */
export function useInAppToasts() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setToasts(prev => [...prev, newToast]);

    // Play sound and vibrate
    playNotificationSound();
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }

    return newToast.id;
  };

  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Pleasant notification tone
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  return {
    toasts,
    showToast,
    closeToast,
    clearAll,
  };
}
