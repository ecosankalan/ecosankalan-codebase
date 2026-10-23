import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNotifications } from "../../context/NotificationContext";
import notificationPath from "../../lib/notificationPath";
import "../../styles/NotificationDropdown.css";

export default function NotificationDropdown({ onClose }) {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const navigate = useNavigate();
  const { t } = useTranslation();
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleNotificationClick = (notification) => {

    markAsRead(notification.id);

    const path = notificationPath(notification.data);
    if (path) navigate(path);

    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="notification-dropdown"
    >

      <div className="notification-header">

        <h3>{t('notif.title')}</h3>

        {notifications.length > 0 && (
          <button
            className="mark-all-btn"
            onClick={markAllAsRead}
          >
            {t('notif.markAll')}
          </button>
        )}

      </div>

      {notifications.length === 0 ? (

        <div className="notification-empty">
          {t('notif.empty')}
        </div>

      ) : (

        notifications.map((notification) => (

          <div
            key={notification.id}
            className={`notification-item ${
              notification.read
                ? ""
                : "notification-unread"
            }`}
            onClick={() =>
              handleNotificationClick(notification)
            }
          >

            <div className="notification-title">
              {notification.title}
            </div>

            <div className="notification-body">
              {notification.body}
            </div>

            <div className="notification-time">
              {formatTime(notification.receivedAt, t)}
            </div>

          </div>

        ))

      )}

    </div>
  );
}

function formatTime(date, t) {

  const diff =
    Math.floor((Date.now() - new Date(date)) / 1000);

  if (diff < 60) return t('notif.justNow');

  if (diff < 3600)
    return t('notif.minAgo', { count: Math.floor(diff / 60) });

  if (diff < 86400)
    return t('notif.hrAgo', { count: Math.floor(diff / 3600) });

  return t('notif.dayAgo', { count: Math.floor(diff / 86400) });
}
