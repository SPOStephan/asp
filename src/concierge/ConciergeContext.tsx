import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { readNdjson } from '../ai/ndjson';
import { useHotel, useSection } from '../context/HotelContext';
import { conciergeConfig, CONCIERGE_SECTION, guestText, type ConciergeConfig } from '../lib/concierge';
import { stripGapMarker } from '../lib/knowledge';

export type GuestMessage = {
  role: 'user' | 'assistant';
  content: string;
  links?: Array<{ title: string; url: string }>;
  streaming?: boolean;
  error?: boolean;
};

type ConciergeValue = {
  config: ConciergeConfig;
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  messages: GuestMessage[];
  busy: boolean;
  ask: (question: string) => Promise<void>;
  reset: () => void;
};

const ConciergeContext = createContext<ConciergeValue | null>(null);

type Stored = { conversationId: string; messages: GuestMessage[] };

function storageKey(hotelId: string) {
  return `concierge:${hotelId}`;
}

// The conversation survives page changes and reloads in this tab, nothing more.
function load(hotelId: string): Stored | null {
  try {
    const raw = sessionStorage.getItem(storageKey(hotelId));
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function save(hotelId: string, value: Stored) {
  try {
    sessionStorage.setItem(storageKey(hotelId), JSON.stringify(value));
  } catch {
    // private mode: the chat still works, only without memory
  }
}

export function ConciergeProvider({ children }: { children: ReactNode }) {
  const hotel = useHotel();
  const section = useSection(CONCIERGE_SECTION);
  const config = useMemo(() => conciergeConfig(section ?? undefined, hotel?.name ?? 'Hotel'), [section, hotel?.name]);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const conversation = useRef<string>('');

  useEffect(() => {
    if (!hotel?.id) return;
    const stored = load(hotel.id);
    conversation.current = stored?.conversationId ?? crypto.randomUUID();
    setMessages((stored?.messages ?? []).filter((message) => !message.streaming));
  }, [hotel?.id]);

  useEffect(() => {
    if (hotel?.id && conversation.current) save(hotel.id, { conversationId: conversation.current, messages });
  }, [hotel?.id, messages]);

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || busy) return;
      const history = messages.filter((message) => !message.error).map(({ role, content }) => ({ role, content }));
      setMessages((current) => [...current, { role: 'user', content: text }, { role: 'assistant', content: '', streaming: true }]);
      setBusy(true);
      const patchLast = (fields: Partial<GuestMessage>) =>
        setMessages((current) => current.map((message, index) => (index === current.length - 1 ? { ...message, ...fields } : message)));
      let streamed = '';
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text, history, conversationId: conversation.current }),
        });
        const result = await readNdjson<{ answer: string; links: GuestMessage['links']; conversationId: string }>(response, (delta) => {
          streamed += delta;
          patchLast({ content: guestText(stripGapMarker(streamed)) });
        });
        conversation.current = result.conversationId;
        patchLast({ content: result.answer, links: result.links, streaming: false });
      } catch (err) {
        const contact = [hotel?.phone ? `Telefon ${hotel.phone}` : '', hotel?.email ?? ''].filter(Boolean).join(' · ');
        patchLast({
          content: `${err instanceof Error ? err.message : 'Der Chat ist gerade nicht erreichbar.'}${contact ? `\n\nSie erreichen uns direkt: ${contact}` : ''}`,
          streaming: false,
          error: true,
        });
      }
      setBusy(false);
    },
    [busy, hotel?.email, hotel?.phone, messages],
  );

  const reset = useCallback(() => {
    conversation.current = crypto.randomUUID();
    setMessages([]);
  }, []);

  const toggle = useCallback(() => setOpen((value) => !value), []);

  const value = useMemo(() => ({ config, open, setOpen, toggle, messages, busy, ask, reset }), [config, open, toggle, messages, busy, ask, reset]);
  return <ConciergeContext.Provider value={value}>{children}</ConciergeContext.Provider>;
}

export function useConcierge() {
  const value = useContext(ConciergeContext);
  if (!value) throw new Error('useConcierge outside ConciergeProvider');
  return value;
}

// For buttons that may also sit outside the website (previews): no provider, no chat.
export function useOptionalConcierge() {
  return useContext(ConciergeContext);
}
