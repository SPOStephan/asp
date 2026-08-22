export function LoadingScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a3a4a',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(200, 169, 106, 0.3)',
          borderTopColor: '#c8a96a',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function ErrorScreen({ message }: { message: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        zIndex: 9999,
        fontFamily: 'Inter, sans-serif',
        color: '#333',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>
          Inhalt konnte nicht geladen werden
        </h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>{message}</p>
      </div>
    </div>
  );
}
