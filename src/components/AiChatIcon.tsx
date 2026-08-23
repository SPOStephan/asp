import { MessagesSquare, Sparkles } from 'lucide-react';

export function AiChatIcon() {
  return (
    <span className="availability-bar__chat-icon">
      <MessagesSquare
        className="availability-bar__chat-mark"
        size={44}
        strokeWidth={1.2}
        absoluteStrokeWidth
      />
      <Sparkles
        className="availability-bar__chat-sparkle"
        size={16}
        strokeWidth={1.2}
        absoluteStrokeWidth
      />
    </span>
  );
}
