import Link from "next/link"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div>
        <p
          className="text-xs uppercase tracking-[0.2em] font-sans mb-4"
          style={{ color: "var(--gold)" }}
        >
          404
        </p>
        <h1
          className="font-serif text-4xl mb-4"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            color: "var(--foreground)",
          }}
        >
          O caminho não existe
        </h1>
        <p
          className="text-sm font-sans max-w-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          Este documento não foi encontrado no Akwu.
        </p>
      </div>
      <Link
        href="/"
        className="text-sm font-sans underline underline-offset-4 hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
        style={{ color: "var(--accent)", outlineColor: "var(--accent)" }}
      >
        Voltar ao início
      </Link>
    </div>
  )
}
