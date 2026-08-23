export function AiChatIcon() {
  return (
    <svg
      className="availability-bar__chat-icon"
      viewBox="0 0 72 56"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="availability-bar__sparkle availability-bar__sparkle--lg"
        d="M64.2 6.2v-4.4M62 4h4.4M64.2 16.8v-3.2M63 15.2h2.4"
      />
      <path
        className="availability-bar__sparkle availability-bar__sparkle--sm"
        d="M8.4 8.6v-3.2M7.2 7h2.4"
      />

      <path
        className="availability-bar__chat-bubble"
        d="M11 29.2c0-7.4 6.4-13.4 14.3-13.4h5.2c7.9 0 14.3 6 14.3 13.4 0 5-2.9 9.4-7.3 11.7l.4 6.6-8-4.6c-1.4.2-2.9.4-4.4.4-7.9 0-14.5-6-14.5-13.4v-.7z"
      />
      <path
        className="availability-bar__chat-text"
        d="M19.6 25.6h14.8M19.6 30.2h11.4M19.6 34.8h7.6"
      />

      <path
        className="availability-bar__chat-bubble availability-bar__chat-bubble--front"
        d="M36.6 16.4h16.2c4.3 0 7.8 3.3 7.8 7.4v5.6c0 4.1-3.5 7.4-7.8 7.4h-2.8l-5.2 4.6 1.1-4.6h-9.3c-4.3 0-7.8-3.3-7.8-7.4v-5.6c0-4.1 3.5-7.4 7.8-7.4z"
      />
      <path
        className="availability-bar__chat-mark"
        d="M44.8 22.2c1.7 0 2.9 1.1 2.9 2.7 0 1.3-.6 2-1.6 2.7-.8.6-1.1 1-1.1 1.8v.4"
      />
      <circle className="availability-bar__chat-dot" cx="44.9" cy="32.4" r="0.85" />
    </svg>
  );
}
