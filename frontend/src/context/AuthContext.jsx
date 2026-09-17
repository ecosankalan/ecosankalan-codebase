/**
 * context/AuthContext.jsx
 * Authentication context — Appwrite integration.
 *
 * Uses @appwrite.io/react's useAuth() for Appwrite session state,
 * and syncs with MongoDB via the backend /auth/sync endpoint.
 *
 * Provides: user (MongoDB profile), loading, logout(), updateUser()
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth as useAppwriteAuth } from '@appwrite.io/react';
import { Account } from 'appwrite';
import appwriteClient from '../lib/appwrite';
import { syncUser } from '../services/api';
import { removeFCMToken } from '../services/notificationService';

const AuthContext = createContext();

/**
 * Read stored MongoDB user from localStorage for instant UI on page load.
 * Will be re-validated against the backend on mount.
 */
const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // Appwrite auth state from the React SDK
  const {
    user: appwriteUser,
    isLoading: appwriteLoading,
    refresh: refreshAppwriteUser,
  } = useAppwriteAuth();

  // MongoDB user profile (application data)
  const [mongoUser, setMongoUser] = useState(getStoredUser);
  const [syncing, setSyncing] = useState(false);

  // Shared Appwrite Account instance (same client used by the API interceptor)
  const account = new Account(appwriteClient);

  /**
   * Sync Appwrite identity with MongoDB backend.
   * Called after login/signup and on initial mount when Appwrite session exists.
   */
  const syncWithBackend = useCallback(async () => {
    if (!appwriteUser) {
      setMongoUser(null);
      localStorage.removeItem('user');
      return;
    }

    setSyncing(true);
    try {
      const res = await syncUser();
      if (res.data && res.data.user) {
        setMongoUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to sync user with backend:', err);
      // If sync fails (e.g., backend down), clear local state
      setMongoUser(null);
      localStorage.removeItem('user');
    } finally {
      setSyncing(false);
    }
  }, [appwriteUser]);

  // Sync when Appwrite user changes (login/logout)
  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  /**
   * Logout: destroys Appwrite session and clears local state.
   */
  const logout = useCallback(async () => {
    try {
      // Deregister FCM token before logout
      const fcmToken = localStorage.getItem('fcm_token');
      if (fcmToken) {
        removeFCMToken(fcmToken).catch(() => {});
      }
    } catch {
      // Ignore FCM errors
    }

    try {
      await account.deleteSession('current');
    } catch {
      // Session may already be expired
    }

    // Clear local state
    localStorage.removeItem('fcm_token');
    localStorage.removeItem('fcm_device_id');
    localStorage.removeItem('user');
    setMongoUser(null);
    await refreshAppwriteUser();
  }, [account, refreshAppwriteUser]);

  /**
   * Update MongoDB user profile in local state.
   */
  const updateUser = useCallback((userData) => {
    setMongoUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isLoading = appwriteLoading || syncing;

  return (
    <AuthContext.Provider
      value={{
        user: mongoUser,
        isLoading,
        logout,
        updateUser,
        // Expose Appwrite user for components that need it
        appwriteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
