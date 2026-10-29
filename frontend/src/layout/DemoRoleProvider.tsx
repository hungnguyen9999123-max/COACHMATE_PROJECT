import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { DemoRole } from '../navigation/roleNavigation';

const STORAGE_KEY = 'coachmate-demo-preferences-v1';
interface Preferences { version: 1; role: DemoRole; }
interface DemoRoleContextValue { role: DemoRole; setRole: (role: DemoRole) => void; }
const DemoRoleContext = createContext<DemoRoleContextValue | null>(null);

function readRole(): DemoRole {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const preferences = JSON.parse(raw) as Preferences;
      if (preferences.version === 1 && ['student', 'coach', 'admin', 'organizer'].includes(preferences.role)) return preferences.role;
    }
  } catch { /* Use the student demo role if local preferences are unavailable. */ }
  return 'student';
}

export function DemoRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<DemoRole>(readRole);
  const value = useMemo<DemoRoleContextValue>(() => ({
    role,
    setRole(nextRole) {
      setRoleState(nextRole);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, role: nextRole })); } catch { /* Demo still works for this session. */ }
    },
  }), [role]);
  return <DemoRoleContext.Provider value={value}>{children}</DemoRoleContext.Provider>;
}

export function useDemoRole() {
  const context = useContext(DemoRoleContext);
  if (!context) throw new Error('useDemoRole must be used inside DemoRoleProvider');
  return context;
}
