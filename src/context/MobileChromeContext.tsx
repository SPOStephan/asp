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
}

const MobileChromeContext = createContext<MobileChromeValue | null>(null);

export function MobileChromeProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null);
  const menu = useRef<MenuApi | null>(null);

  const closePanels = useCallback(() => setPanel(null), []);
  const openBook = useCallback(() => {
    menu.current?.close();
    setPanel('book');
  }, []);
  const toggleBook = useCallback(() => {
    menu.current?.close();
    setPanel((current) => (current === 'book' ? null : 'book'));
  }, []);
  const toggleChat = useCallback(() => {
    menu.current?.close();
    setPanel((current) => (current === 'chat' ? null : 'chat'));
  }, []);
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
    }),
    [panel, openBook, closePanels, toggleBook, toggleChat, openMenu, registerMenu]
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
