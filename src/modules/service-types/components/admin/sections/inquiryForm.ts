import type { FormField } from './FormSection'

export function isFieldVisible(field: FormField, values: Record<string, string>): boolean {
  if (!field.showWhen) return true
  const expected = Array.isArray(field.showWhen.value) ? field.showWhen.value : [field.showWhen.value]
  const actual = (values[field.showWhen.field] || '').toLowerCase()
  return expected.some(value => value.toLowerCase() === actual)
}

export function validateInquiryFields(fields: FormField[], values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of fields) {
    if (!isFieldVisible(field, values)) continue
    const value = (values[field.id] || '').trim()
    if (field.required && (!value || (field.type === 'mv-prefix' && value === 'MV'))) {
      errors[field.id] = `Please enter ${field.label.toLowerCase()}.`
    } else if (field.type === 'number' && value && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
      errors[field.id] = `${field.label} must be a number greater than or equal to zero.`
    }
  }
  return errors
}
