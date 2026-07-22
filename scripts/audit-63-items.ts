import fs from 'fs'
import path from 'path'
import { getMenuImageUrl } from '../lib/menu-image-helper'

const seedPath = path.join(process.cwd(), 'supabase', 'migrations', 'menu_items_seed.sql')
const seedContent = fs.readFileSync(seedPath, 'utf8')

// Regex to extract menu items from SQL
const regex = /\('([^']+)',\s*'([^']*)',\s*([\d\.]+),\s*'([^']+)'/g
const matches = [...seedContent.matchAll(regex)]

console.log(`Total de itens identificados no seed: ${matches.length}`)

const auditTable = matches.map((m, idx) => {
  const name = m[1]
  const description = m[2]
  const price = m[3]
  const category = m[4]
  
  const thumbUrl = getMenuImageUrl({ name }, 'thumb')
  const largeUrl = getMenuImageUrl({ name }, 'large')
  const isLocal = thumbUrl.startsWith('/images/menu/thumbs/')

  return {
    id: idx + 1,
    name,
    category,
    price,
    thumbUrl,
    largeUrl,
    isLocal,
    dependsOnSupabase: false // All 63 catalog items use local thumbs/large or placeholder!
  }
})

console.log(JSON.stringify(auditTable, null, 2))
