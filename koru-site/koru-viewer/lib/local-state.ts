import fs from "fs"
import path from "path"

// Local file-based key-value store — used as fallback when Supabase site_content table doesn't exist
const STATE_FILE = path.join(process.cwd(), ".koru-state.json")

export function readLocalState(): Record<string, string> {
  // Em produção o filesystem é só-leitura: o arquivo nunca recebe os PATCHes
  // do admin e é apenas um snapshot fossilizado do build. Lê-lo lá faria um
  // estado velho sobrescrever o Supabase (fonte da verdade em produção).
  if (process.env.NODE_ENV === "production") return {}
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, "utf-8")
      return JSON.parse(raw)
    }
  } catch { /* ignore */ }
  return {}
}

export function writeLocalState(key: string, value: string): boolean {
  if (process.env.NODE_ENV === 'production') return false
  const state = readLocalState()
  state[key] = value
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8")
    return true
  } catch { return false }
}
