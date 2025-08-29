import React, { useEffect, useRef, useState } from 'react';
import { useMarkAllRead, useMarkRead, useNotifications, useUnreadCount } from '../../hooks/useNotifications';

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { data: notifications = [], refetch } = useNotifications(false, 30000);
  const { data: unreadCount = 0 } = useUnreadCount(30000);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAll = async () => {
    await markAll.mutateAsync();
    refetch();
  };

  const handleMarkOne = async (id: number) => {
    await markRead.mutateAsync(id);
    refetch();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        className="relative p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200 rounded-lg hover:bg-primary-50"
        onClick={() => setOpen(!open)}
      >
        <span className="sr-only">View notifications</span>
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] leading-[18px] rounded-full text-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="text-sm font-semibold text-gray-800">Notifications</div>
            <button
              className="text-xs text-primary-600 hover:text-primary-700"
              onClick={handleMarkAll}
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-96 overflow-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`px-3 py-3 border-b last:border-b-0 ${n.readFlag ? 'bg-white' : 'bg-primary-50/40'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{n.title}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{n.message}</div>
                      <div className="text-[11px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    {!n.readFlag && (
                      <button
                        className="text-xs text-primary-600 hover:text-primary-700"
                        onClick={() => handleMarkOne(n.id)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
