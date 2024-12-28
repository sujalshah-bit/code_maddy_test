import React, { useEffect, useState } from 'react';
import { useAppStore, useNotificationActions } from '../stores/appStore';

const Toast = () => {
    const {notifications} = useAppStore();
    const {  clearNotification } = useNotificationActions();

  // Combine all notifications and sort by timestamp
  const allNotifications = [
    ...notifications.errors.map(n => ({ ...n, type: 'errors' })),
    ...notifications.success.map(n => ({ ...n, type: 'success' })),
    ...notifications.info.map(n => ({ ...n, type: 'info' })),
    ...notifications.warning.map(n => ({ ...n, type: 'warning' })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {allNotifications.map((notification) => (
        <ToastMessage
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => clearNotification(notification.id, notification.type)}
        />
      ))}
    </div>
  );
};

const ToastMessage = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    errors: 'bg-red-500',
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-600',
  }[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`}>
        {type === 'error' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span>{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="ml-2 hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast; 