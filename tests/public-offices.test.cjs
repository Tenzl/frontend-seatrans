const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function session(payload, status = 200) {
  const requests = []
  const apiClient = {
    get: async (endpoint, options) => {
      requests.push({ endpoint, options })
      return { ok: status >= 200 && status < 300, json: async () => payload }
    },
  }
  const file = path.resolve(__dirname, '../src/modules/logistics/services/officeService.ts')
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const module = { exports: {} }
  const context = vm.createContext({ module, exports: module.exports })
  vm.runInContext(`(function(require,module,exports){${source}\n})`, context)((name) => {
    if (name === '@/shared/utils/apiClient') return { apiClient }
    if (name === '@/shared/config/api.config') return { API_CONFIG: { OFFICES: { ACTIVE: '/offices/active' } } }
    throw new Error(`Unexpected import: ${name}`)
  }, module, module.exports)
  return { ...module.exports, requests }
}

const office = {
  id: 1,
  name: 'Head Office',
  city: 'Gia Lai',
  region: 'AREA 2',
  address: 'Quy Nhon, Gia Lai',
  latitude: '13.76290000',
  longitude: '109.21910000',
  coordinates: { lat: '13.76290000', lng: '109.21910000' },
  manager: { name: null, title: null, mobile: null, email: null },
  isHeadquarter: true,
  isActive: true,
}

test('public offices use the active endpoint without auth and retain nullable backend fields', async () => {
  const service = session({ success: true, data: [office] })
  const signal = new AbortController().signal
  const result = await service.officeService.getActiveOffices(signal)
  assert.equal(result[0].manager.mobile, null)
  assert.equal(result[0].latitude, '13.76290000')
  assert.equal(service.requests[0].endpoint, '/offices/active')
  assert.equal(service.requests[0].options.skipAuth, true)
  assert.equal(service.requests[0].options.signal, signal)
})

test('office map prefers precise backend coordinates and falls back to address', () => {
  const service = session({ success: true, data: [] })
  assert.equal(service.getOfficeMapQuery(office), '13.7629,109.2191')
  assert.equal(service.getOfficeMapQuery({ ...office, latitude: null, longitude: null, coordinates: { lat: null, lng: null } }), office.address)
})

test('public offices reject failed or malformed responses', async () => {
  await assert.rejects(session({ success: false, data: null }, 503).officeService.getActiveOffices(), /offices/i)
  await assert.rejects(session({ success: true, data: {} }).officeService.getActiveOffices(), /offices/i)
})
