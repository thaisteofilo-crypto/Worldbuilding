// Runner de migração individual. Uso:
//   node scripts/run-migration.mjs scripts/migrations/006-koru-chat-conversations.sql
//
// Lê a connection string do .env.local (DATABASE_URL) ou de variável de ambiente.
// Se nenhum estiver disponível, falha com instrução clara.

import fs from 'fs'
import path from 'path'
import pg from 'pg'
const { Client } = pg

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    const key = m[1]
    let value = m[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnv()

const file = process.argv[2]
if (!file) {
  console.error('Uso: node scripts/run-migration.mjs <arquivo.sql>')
  process.exit(1)
}

const sqlPath = path.resolve(process.cwd(), file)
if (!fs.existsSync(sqlPath)) {
  console.error(`Migração não encontrada: ${sqlPath}`)
  process.exit(1)
}

const sql = fs.readFileSync(sqlPath, 'utf-8')

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  ''

if (!connectionString) {
  console.error(
    'Sem connection string. Defina DATABASE_URL no .env.local.\n' +
    'Formato: postgresql://postgres:<senha>@db.<projeto>.supabase.co:5432/postgres'
  )
  process.exit(1)
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  console.log(`Aplicando migração: ${path.basename(sqlPath)}`)
  await client.query(sql)
  console.log('OK.')
} catch (err) {
  console.error('Erro ao aplicar migração:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
