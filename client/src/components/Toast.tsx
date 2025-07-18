import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from "react-feather"
import { useEffect, useState } from "react"

export type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastProps = {
  message: string
  type?: ToastType
  onClose?: () => void
  duration?: number // in ms, default 4000
  title?: string
}

const Toast = ({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 4000, 
  title 
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Configure styles based on toast type
  const styles = {
    success: {
      borderColor: 'border-green-200 dark:border-green-800/60',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      icon: CheckCircle,
      defaultTitle: 'Success'
    },
    error: {
      borderColor: 'border-red-200 dark:border-red-800/60',
      bgColor: 'bg-red-50 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      icon: AlertCircle,
      defaultTitle: 'Error'
    },
    info: {
      borderColor: 'border-blue-200 dark:border-blue-800/60',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: Info,
      defaultTitle: 'Information'
    },
    warning: {
      borderColor: 'border-yellow-200 dark:border-yellow-800/60',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      icon: AlertTriangle,
      defaultTitle: 'Warning'
    }
  };
  
  const { borderColor, bgColor, iconColor, icon: Icon, defaultTitle } = styles[type];
  const toastTitle = title || defaultTitle;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Give time for the fade-out animation before calling onClose
      const closeTimer = setTimeout(() => {
        if (onClose) onClose();
      }, 300);
      return () => clearTimeout(closeTimer);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div className={`absolute top-6 right-6 pointer-events-auto transform transition-all duration-300 z-40 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`flex items-start gap-3 bg-white dark:bg-surface-800 border ${borderColor} shadow-lg rounded-lg p-4 max-w-md`}>
        <div className={`p-2 ${bgColor} rounded-full flex-shrink-0`}>
          <Icon className={iconColor} size={20} />
        </div>
        
        <div className="flex-1 pr-6">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100">{toastTitle}</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{message}</p>
        </div>
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;