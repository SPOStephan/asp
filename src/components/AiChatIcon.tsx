import { MessagesSquare, Sparkles } from 'lucide-react';

export function AiChatIcon() {
  return (
    <span className="availability-bar__chat-icon">
      <MessagesSquare className="availability-bar__chat-mark" strokeWidth={1.4} />
      <Sparkles className="availability-bar__chat-sparkle" strokeWidth={1.5} />
    </span>
  );
}
