import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onMessage } from "firebase/messaging";
import { useNotifications } from "../context/NotificationContext";
import { messaging } from "../lib/firebase";
import notificationPath from "../lib/notificationPath";


// listen to foreground notifications and show toast and browser notification
export default function useListener(user) {
    const { addNotification } = useNotifications();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !messaging) return;

        const unsubscribe = onMessage(messaging, (payload) => {
          
            const { title, body } = payload.notification || {};

            if (title) {
                addNotification({
                    title,
                    body,
                    data: payload.data
                });

                if (Notification.permission === "granted") {
                    const browserNotification = new Notification(title, {
                        body,
                        icon: "/logo.png",
                        data: payload.data,
                    });

                    browserNotification.onclick = (event) => {
                        event.preventDefault();
                        window.focus();
                        const path = notificationPath(payload.data);
                        if (path) navigate(path);
                    };
                }
            }
        });

        return unsubscribe;
    }, [user, navigate]);
}