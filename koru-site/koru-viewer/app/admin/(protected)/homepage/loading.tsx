export default function HomepageEditorLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: "40vh",
        gap: "1rem",
      }}
    >
      <style>{`
        @keyframes koru-spin {
          to { transform: rotate(360deg); }
        }
        .koru-spinner {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: currentColor;
          animation: koru-spin 0.75s linear infinite;
        }
      `}</style>
      <div className="koru-spinner" />
      <span
        style={{
          color: "var(--muted-foreground)",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.75rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Carregando editor…
      </span>
    </div>
  )
}
