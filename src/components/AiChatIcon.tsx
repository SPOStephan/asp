export function AiChatIcon() {
  return (
    <svg
      className="availability-bar__chat-icon"
      viewBox="0 0 72 58"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="availability-bar__sparkle availability-bar__sparkle--lg"
        d="M66.6 7.4v-4.4M64.4 5.2h4.4"
      />
      <path
        className="availability-bar__sparkle availability-bar__sparkle--sm"
        d="M7.6 12v-2.8M6.2 10.6h2.8"
      />

      <path
        className="availability-bar__chat-bubble"
        d="M25.2 17.2a15.2 15.2 0 0 1 15.2 15.2 15.2 15.2 0 0 1-9.4 14.1l.6 6.6-8.6-5.1A15.2 15.2 0 0 1 10 32.4 15.2 15.2 0 0 1 25.2 17.2z"
      />
      <path
        className="availability-bar__chat-text"
        d="M17.4 28.2h15.6M17.4 32.8h12.4M17.4 37.4h8.6"
      />

      <path
        className="availability-bar__chat-bubble availability-bar__chat-bubble--front"
        d="M34.6 4.6h22.2a7.2 7.2 0 0 1 7.2 7.2v9.4a7.2 7.2 0 0 1-7.2 7.2h-3.8l5.8 6.6-8.8-6.6H34.6a7.2 7.2 0 0 1-7.2-7.2V11.8a7.2 7.2 0 0 1 7.2-7.2z"
      />
      <path
        className="availability-bar__chat-mark"
        d="M45.6 12.2c2.15 0 3.55 1.35 3.55 3.25 0 1.65-.8 2.45-2.05 3.35-1 .7-1.3 1.25-1.3 2.2v.3"
      />
      <circle className="availability-bar__chat-dot" cx="45.8" cy="24.2" r="0.8" />
    </svg>
  );
}
