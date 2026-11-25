const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const file = path.join(__dirname, '../src/modules/service-types/components/admin/sections/inquiryForm.ts')
const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const mod = { exports: {} }
new Function('exports', 'module', compiled)(mod.exports, mod)
const { isFieldVisible, validateInquiryFields } = mod.exports

test('conditional fields match select values case-insensitively and support multiple cargo types', () => {
  const anchorage = { id: 'boatHireAmount', showWhen: { field: 'location', value: 'Anchorage' } }
  assert.equal(isFieldVisible(anchorage, { location: 'anchorage' }), true)
  assert.equal(isFieldVisible(anchorage, { location: 'berth' }), false)
  const tally = { id: 'tally', showWhen: { field: 'cargo', value: ['IN BAGS', 'IN EQUIPMENT'] } }
  assert.equal(isFieldVisible(tally, { cargo: 'in bags' }), true)
  assert.equal(isFieldVisible(tally, { cargo: 'in bulk' }), false)
})

test('step validation catches empty required text, MV prefix, select and date fields', () => {
  const fields = [
    { id: 'to', label: 'Shipowner', type: 'text', required: true },
    { id: 'mv', label: 'Vessel name', type: 'mv-prefix', required: true },
    { id: 'cargoType', label: 'Cargo type', type: 'select', required: true },
    { id: 'date', label: 'From date', type: 'date', required: true },
  ]
  assert.deepEqual(Object.keys(validateInquiryFields(fields, { to: ' ', mv: 'MV ', cargoType: '', date: '' })),
    ['to', 'mv', 'cargoType', 'date'])
  assert.deepEqual(validateInquiryFields(fields, { to: 'Example owner', mv: 'MV Example', cargoType: 'in bulk', date: '2026-11-25' }), {})
})

test('optional and hidden fields do not block progress, while zero is a valid quantity', () => {
  const fields = [
    { id: 'quantity', label: 'Quantity', type: 'number', required: true },
    { id: 'eta', label: 'ETA', type: 'date' },
    { id: 'other', label: 'Other cargo', type: 'text', required: true, showWhen: { field: 'cargo', value: 'OTHER' } },
  ]
  assert.deepEqual(validateInquiryFields(fields, { quantity: '0', cargo: 'wood pellet' }), {})
  assert.ok(validateInquiryFields(fields, { quantity: '0', cargo: 'other' }).other)
})

test('numeric validation rejects negative and nonnumeric values without rejecting decimals', () => {
  const fields = [{ id: 'grt', label: 'GRT', type: 'number' }]
  assert.ok(validateInquiryFields(fields, { grt: '-1' }).grt)
  assert.ok(validateInquiryFields(fields, { grt: 'abc' }).grt)
  assert.deepEqual(validateInquiryFields(fields, { grt: '125.50' }), {})
})
