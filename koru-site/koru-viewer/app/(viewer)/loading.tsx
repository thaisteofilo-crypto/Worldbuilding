import { ScrollArea } from "@/components/ui/scroll-area"

export default function Loading() {
  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <div
        className="max-w-3xl mx-auto px-6 md:px-10 py-10 pb-20"
        role="status"
        aria-live="polite"
        aria-label="Carregando documento"
      >
        <div className="mb-8">
          <div
            className="h-3 w-24 rounded mb-3 animate-pulse"
            style={{ backgroundColor: "var(--surface)" }}
          />
          <div
            className="h-px w-16"
            style={{ backgroundColor: "var(--border)" }}
          />
        </div>
        <div className="mb-10">
          <div
            className="h-10 w-3/4 rounded mb-3 animate-pulse"
            style={{ backgroundColor: "var(--surface)" }}
          />
        </div>
        <div className="space-y-3">
          {[85, 70, 92, 60, 78, 88, 55, 75, 82, 65, 90, 72].map((w, i) => (
            <div
              key={i}
              className="h-4 rounded animate-pulse"
              style={{
                width: `${w}%`,
                backgroundColor: "var(--surface)",
                animationDelay: `${i * 40}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
