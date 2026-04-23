/**
 * HackathonContext
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for the organizer's hackathon scope.
 * Provides:
 *   - allHackathons  → full list owned by this organizer
 *   - activeHackathon → the currently selected one
 *   - setActiveHackathon → switch context (persisted to localStorage)
 *   - updateHackathon → persist edits to DB + sync local state
 *   - deleteHackathon → cascade-safe delete with state cleanup
 *   - loadingHackathons
 *   - refreshHackathons → re-fetch after create/update
 *
 * Architecture decisions:
 *   - Persists selected ID in localStorage so page refresh keeps context
 *   - Falls back to most-recent hackathon if stored ID is gone (deleted)
 *   - DELETE uses the DB `ON DELETE CASCADE` for child records
 *     (submissions → project_analyses, registrations all cascade)
 *   - RLS on backend enforces organizer_id = auth.uid() for UPDATE/DELETE
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { insforge } from './lib/insforge';

const HackathonContext = createContext(null);

const STORAGE_KEY = 'hackloom_active_hackathon_id';

export function HackathonProvider({ user, children }) {
  const [allHackathons, setAllHackathons] = useState([]);
  const [activeHackathon, setActiveHackathonState] = useState(null);
  const [loadingHackathons, setLoadingHackathons] = useState(true);

  // ── Fetch all hackathons for this organizer ──────────────────
  const refreshHackathons = useCallback(async () => {
    if (!user) return;
    setLoadingHackathons(true);
    try {
      const { data, error } = await insforge.database
        .from('hackathons')
        .select()
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list = data || [];
      setAllHackathons(list);

      // Restore persisted selection, validate it still exists
      const storedId = localStorage.getItem(STORAGE_KEY);
      const stored = list.find(h => h.id === storedId);

      if (stored) {
        setActiveHackathonState(stored);
      } else if (list.length > 0) {
        // Default to most recent
        setActiveHackathonState(list[0]);
        localStorage.setItem(STORAGE_KEY, list[0].id);
      } else {
        setActiveHackathonState(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error('[HackathonContext] refreshHackathons failed:', err);
    } finally {
      setLoadingHackathons(false);
    }
  }, [user]);

  useEffect(() => {
    refreshHackathons();
  }, [refreshHackathons]);

  // ── Switch active hackathon ──────────────────────────────────
  const setActiveHackathon = useCallback((hackathon) => {
    setActiveHackathonState(hackathon);
    if (hackathon) {
      localStorage.setItem(STORAGE_KEY, hackathon.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // ── Update hackathon (real DB write + local sync) ───────────
  const updateHackathon = useCallback(async (hackathonId, updates) => {
    const target = allHackathons.find(h => h.id === hackathonId);
    if (!target) throw new Error('Hackathon not found');
    if (target.organizer_id !== user.id) throw new Error('Unauthorized');

    // Strip fields that should never be overwritten
    const { id, created_at, organizer_id, ...safeUpdates } = updates;

    // Add updated_at timestamp
    safeUpdates.updated_at = new Date().toISOString();

    const { data, error } = await insforge.database
      .from('hackathons')
      .update(safeUpdates)
      .eq('id', hackathonId)
      .eq('organizer_id', user.id)
      .select();

    if (error) throw error;

    const updated = data?.[0];
    if (!updated) throw new Error('Update returned no data');

    // Sync local state immediately — no full refetch needed
    setAllHackathons(prev =>
      prev.map(h => h.id === hackathonId ? updated : h)
    );

    // If this is the active hackathon, update that too
    if (activeHackathon?.id === hackathonId) {
      setActiveHackathonState(updated);
    }

    return updated;
  }, [allHackathons, activeHackathon, user]);

  // ── Delete hackathon (real, cascade-safe) ───────────────────
  const deleteHackathon = useCallback(async (hackathonId) => {
    // Security: verify ownership client-side before attempting
    const target = allHackathons.find(h => h.id === hackathonId);
    if (!target) throw new Error('Hackathon not found');
    if (target.organizer_id !== user.id) throw new Error('Unauthorized');

    // DB DELETE — RLS enforces organizer_id = auth.uid()
    // ON DELETE CASCADE handles: submissions, registrations, project_analyses
    const { error } = await insforge.database
      .from('hackathons')
      .delete()
      .eq('id', hackathonId)
      .eq('organizer_id', user.id); // belt-and-suspenders

    if (error) throw error;

    // Update local state
    const remaining = allHackathons.filter(h => h.id !== hackathonId);
    setAllHackathons(remaining);

    // Handle active hackathon state
    if (activeHackathon?.id === hackathonId) {
      const next = remaining[0] || null;
      setActiveHackathon(next);
    }

    return true;
  }, [allHackathons, activeHackathon, user, setActiveHackathon]);

  return (
    <HackathonContext.Provider value={{
      allHackathons,
      activeHackathon,
      setActiveHackathon,
      updateHackathon,
      deleteHackathon,
      loadingHackathons,
      refreshHackathons,
    }}>
      {children}
    </HackathonContext.Provider>
  );
}

export function useHackathon() {
  const ctx = useContext(HackathonContext);
  if (!ctx) throw new Error('useHackathon must be used inside HackathonProvider');
  return ctx;
}
