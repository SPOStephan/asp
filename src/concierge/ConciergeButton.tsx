import { AiChatIcon } from '../components/AiChatIcon';
import { useOptionalConcierge } from './ConciergeContext';

// The chat circle of the booking bar opens the website chat.
export function ConciergeButton() {
  const concierge = useOptionalConcierge();
  return (
    <button type="button" className="availability-bar__chat" aria-label="Frage stellen" onClick={() => concierge?.setOpen(true)}>
      <AiChatIcon />
    </button>
  );
}
