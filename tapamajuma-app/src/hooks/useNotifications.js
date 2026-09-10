import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const storageKey = user?.id ? `last_read_notif_${user.id}` : null;

  const calculateUnread = useCallback((items) => {
    if (!storageKey) return 0;
    const lastReadTime = localStorage.getItem(storageKey);
    if (!lastReadTime) return items.length;

    const lastDate = new Date(lastReadTime).getTime();
    return items.filter((item) => {
      const itemDate = new Date(item.created_at).getTime();
      return itemDate > lastDate;
    }).length;
  }, [storageKey]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await api.get("/api/notifications");
      const items = res.data.data || [];
      setNotifications(items);
      setUnreadCount(calculateUnread(items));
    } catch (err) {
      console.error("Gagal mengambil notifikasi:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, calculateUnread]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, new Date().toISOString());
    }
    setUnreadCount(0);
  }, [storageKey]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAllAsRead,
  };
}
