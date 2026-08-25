import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

type MenuApi = {
  open: () => void;
  close: () => void;
  toggle: () => void;
};

type Panel = 'book' | 'chat' | null;

interface MobileChromeValue {
  panel: Panel;
  openBook: () => void;
  closePanels: () => void;
  toggleBook: () => void;
  toggleChat: () => void;
  openMenu: () => void;
  registerMenu: (api: MenuApi | null) => void;
  isGhostTap: () => boolean;
}

const MobileChromeContext = createContext<MobileChromeValue | null>(null);

const GHOST_TAP_MS = 500;

export function MobileChromeProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null);
  const menu = useRef<MenuApi | null>(null);
  const openedAt = useRef(0);

  const markOpened = useCallback(() => {
    openedAt.current = Date.now();
  }, []);
  const isGhostTap = useCallback(() => Date.now() - openedAt.current < GHOST_TAP_MS, []);

  const closePanels = useCallback(() => {
    if (isGhostTap()) return;
    setPanel(null);
  }, [isGhostTap]);
  const openBook = useCallback(() => {
    menu.current?.close();
    markOpened();
    setPanel('book');
  }, [markOpened]);
  const toggleBook = useCallback(() => {
    menu.current?.close();
    setPanel((current) => {
      if (current === 'book') return current;
      markOpened();
      return 'book';
    });
  }, [markOpened]);
  const toggleChat = useCallback(() => {
    menu.current?.close();
    setPanel((current) => {
      if (current === 'chat') return null;
      markOpened();
      return 'chat';
    });
  }, [markOpened]);
  const openMenu = useCallback(() => {
    setPanel(null);
    menu.current?.toggle();
  }, []);
  const registerMenu = useCallback((api: MenuApi | null) => {
    menu.current = api;
  }, []);

  const value = useMemo(
    () => ({
      panel,
      openBook,
      closePanels,
      toggleBook,
      toggleChat,
      openMenu,
      registerMenu,
      isGhostTap,
    }),
    [panel, openBook, closePanels, toggleBook, toggleChat, openMenu, registerMenu, isGhostTap]
  );

  return <MobileChromeContext.Provider value={value}>{children}</MobileChromeContext.Provider>;
}

export function useMobileChrome() {
  const value = useContext(MobileChromeContext);
  if (!value) {
    throw new Error('useMobileChrome must be used within MobileChromeProvider');
  }
  return value;
}
