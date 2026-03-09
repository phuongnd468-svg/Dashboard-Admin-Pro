'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Dictionary, Locale } from '@/lib/i18n';

export type AppUser = {
  email: string;
  name: string;
  role: 'admin' | 'user';
};

type AppContextValue = {
  dictionary: Dictionary;
  locale: Locale;
  user: AppUser | null;
  login: (payload: { username: string }) => AppUser;
  logout: () => void;
};

const STORAGE_KEY = 'ant-design-next-user';

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
  dictionary,
  locale,
}: {
  children: React.ReactNode;
  dictionary: Dictionary;
  locale: Locale;
}) {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const rawUser = window.localStorage.getItem(STORAGE_KEY);

    if (!rawUser) {
      return;
    }

    try {
      setUser(JSON.parse(rawUser) as AppUser);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      dictionary,
      locale,
      user,
      login: ({ username }) => {
        const nextUser: AppUser = {
          email: `${username}@example.com`,
          name: username === 'admin' ? 'Admin User' : 'Demo User',
          role: username === 'admin' ? 'admin' : 'user',
        };

        setUser(nextUser);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));

        return nextUser;
      },
      logout: () => {
        setUser(null);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [dictionary, locale, user],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
}
