const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const source = fs.readFileSync(path.join(__dirname, '../src/modules/inquiries/components/common/epdaForm.ts'), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const mod = { exports: {} }
new Function('exports', 'module', compiled)(mod.exports, mod)
for (const form of ['NORTH', 'CENTRAL', 'SOUTH']) {
  test(`accepts ${form} without changing it`, () => assert.equal(mod.exports.requireEpdaForm(form), form))
}
for (const form of ['HN', 'QN', 'HCM']) {
  test(`rejects obsolete ${form}`, () => assert.throws(() => mod.exports.requireEpdaForm(form), /Unsupported EPDA form/))
}
