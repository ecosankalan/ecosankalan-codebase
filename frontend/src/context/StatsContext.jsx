import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getWasteStats } from '../services/api';
import { useAuth } from './AuthContext';

const StatsContext = createContext();

export const StatsProvider = ({ children }) => {
  const { user } = useAuth();
  const inFlightRef = useRef({}); // dedupe: StrictMode double-mount + rapid nav must not 429 the API
  
  const [statsData, setStatsData] = useState({
    week: null,
    month: null,
    all: null,
  });
  
  const [loading, setLoading] = useState(false);

  const fetchStatsForRange = useCallback(async (range, force = false) => {
    if (!user) return null;
    
    // Use cached data if available and not forced
    if (statsData[range] && !force) {
      return statsData[range];
    }

    // Dedupe concurrent callers (StrictMode / multi-widget mounts)
    if (inFlightRef.current[range]) {
      return inFlightRef.current[range];
    }

    setLoading(true);
    const p = (async () => {
      try {
        const res = await getWasteStats(range);
        setStatsData(prev => ({ ...prev, [range]: res.data }));
        return res.data;
      } catch (err) {
        // 429 (rate limit) is transient under rapid nav — keep stale data quietly
        if (err?.status !== 429) {
          console.error(`Failed to fetch stats for range ${range}:`, err);
        }
        return null;
      } finally {
        delete inFlightRef.current[range];
        setLoading(false);
      }
    })();
    inFlightRef.current[range] = p;
    return p;
  }, [user, statsData]);

  const refreshAllStats = useCallback(async () => {
    if (!user) return;
    if (inFlightRef.current.refreshAll) {
      return inFlightRef.current.refreshAll;
    }

    // Refetch the ranges we commonly use to keep them fresh
    const p = (async () => {
      try {
        const [weekRes, allRes] = await Promise.allSettled([
          getWasteStats('week'),
          getWasteStats('all')
        ]);

        setStatsData(prev => ({
          ...prev,
          week: weekRes.status === 'fulfilled' ? weekRes.value.data : prev.week,
          all: allRes.status === 'fulfilled' ? allRes.value.data : prev.all,
          month: null, // Clear month cache so it refetches next time it's needed
        }));
      } catch (err) {
        if (err?.status !== 429) {
          console.error('Failed to refresh stats:', err);
        }
      } finally {
        delete inFlightRef.current.refreshAll;
      }
    })();
    inFlightRef.current.refreshAll = p;
    return p;
  }, [user]);

  // Initial load when user signs in
  useEffect(() => {
    if (user) {
      refreshAllStats();
    } else {
      setStatsData({ week: null, month: null, all: null });
    }
  }, [user, refreshAllStats]);

  return (
    <StatsContext.Provider value={{ statsData, loading, fetchStatsForRange, refreshAllStats }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => useContext(StatsContext);
