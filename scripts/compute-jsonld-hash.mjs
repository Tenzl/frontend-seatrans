import crypto from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(join(root, 'src/shared/seo/organizationSchema.ts'), 'utf8')
const jsonMatch = source.match(
  /export const organizationSchemaJson = JSON\.stringify\(organizationSchema\)\.replace\(\/<\/g, '\\\\u003c'\)/,
)

if (!jsonMatch) {
  const schemaMatch = source.match(/export const organizationSchema = (\{[\s\S]*?\}) as const/)
  if (!schemaMatch) {
    throw new Error('Could not parse organizationSchema from source')
  }
  const organizationSchema = eval(`(${schemaMatch[1]})`)
  const json = JSON.stringify(organizationSchema).replace(/</g, '\\u003c')
  const hash = crypto.createHash('sha256').update(json).digest('base64')
  console.log(`'sha256-${hash}'`)
  process.exit(0)
}

// Prefer running against built output; fallback parses schema object from TS source.
const schemaMatch = source.match(/export const organizationSchema = (\{[\s\S]*?\}) as const/)
const organizationSchema = eval(`(${schemaMatch[1]})`)
const json = JSON.stringify(organizationSchema).replace(/</g, '\\u003c')
const hash = crypto.createHash('sha256').update(json).digest('base64')
console.log(json)
console.log(`Update ORGANIZATION_JSON_LD_HASH to: 'sha256-${hash}'`)
