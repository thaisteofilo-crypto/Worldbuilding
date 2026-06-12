export interface TimelineEvent {
  year: string | number
  title: string
  description?: string
  category?: string
}

interface TimelineProps {
  events: TimelineEvent[]
}

export default function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative">
      {/* Central line — hidden on mobile, visible md+ */}
      <div
        className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-px w-[2px] bg-border"
        aria-hidden="true"
      />

      {/* Mobile line — always left-aligned */}
      <div
        className="md:hidden absolute left-3 top-0 bottom-0 w-[2px] bg-border"
        aria-hidden="true"
      />

      <ol className="space-y-8 md:space-y-12">
        {events.map((event, index) => {
          const isLeft = index % 2 === 0
          const dotColor =
            event.category === "gold"
              ? "var(--color-mel)"
              : "hsl(var(--accent-shadcn))"

          return (
            <li
              key={`${event.year}-${index}`}
              className="koru-content-enter relative flex items-start md:items-center"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* ── Mobile layout: dot on left, card to the right ── */}
              <div className="md:hidden flex items-start gap-4 pl-0 w-full min-w-0">
                {/* Dot */}
                <div
                  className="relative z-10 flex-shrink-0 mt-1.5"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: dotColor,
                    marginLeft: "8px", /* centers over the 2px line at left:3 */
                    boxShadow: `0 0 0 3px color-mix(in oklch, ${dotColor} 20%, transparent)`,
                  }}
                  aria-hidden="true"
                />

                {/* Card */}
                <div
                  className="bg-card border border-border rounded-xl p-4 flex-1 min-w-0"
                  role="article"
                >
                  <p className="font-mono text-xs mb-1 text-muted-foreground">
                    {event.year}
                  </p>
                  <h3 className="font-serif text-base leading-snug text-foreground">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="font-sans text-sm leading-[1.7] mt-1.5 text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Desktop layout: alternating left/right ── */}
              <div className="hidden md:flex w-full items-center gap-0">
                {/* Left side */}
                <div className={`w-[calc(50%-20px)] ${isLeft ? "pr-6" : ""}`}>
                  {isLeft && (
                    <div
                      className="bg-card border border-border rounded-xl p-5 text-right"
                      role="article"
                    >
                      <p className="font-mono text-xs mb-1 text-muted-foreground">
                        {event.year}
                      </p>
                      <h3 className="font-serif text-base leading-snug text-foreground">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="font-sans text-sm leading-[1.7] mt-1.5 text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Dot (centered on line) */}
                <div
                  className="relative z-10 flex-shrink-0"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: dotColor,
                    boxShadow: `0 0 0 3px color-mix(in oklch, ${dotColor} 20%, transparent)`,
                    margin: "0 12px",
                  }}
                  aria-hidden="true"
                />

                {/* Right side */}
                <div className={`w-[calc(50%-20px)] ${!isLeft ? "pl-6" : ""}`}>
                  {!isLeft && (
                    <div
                      className="bg-card border border-border rounded-xl p-5"
                      role="article"
                    >
                      <p className="font-mono text-xs mb-1 text-muted-foreground">
                        {event.year}
                      </p>
                      <h3 className="font-serif text-base leading-snug text-foreground">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="font-sans text-sm leading-[1.7] mt-1.5 text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
