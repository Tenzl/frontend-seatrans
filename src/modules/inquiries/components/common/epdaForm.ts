export const EPDA_FORMS = ['NORTH', 'CENTRAL', 'SOUTH'] as const
export type EpdaForm = (typeof EPDA_FORMS)[number]

export function requireEpdaForm(value: unknown): EpdaForm {
  if (typeof value !== 'string' || !(EPDA_FORMS as readonly string[]).includes(value)) {
    throw new Error(`Unsupported EPDA form: ${String(value)}`)
  }
  return value as EpdaForm
}
