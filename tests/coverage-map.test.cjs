const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function loadCoverageService(responses) {
  const requests = []
  const apiClient = {
    get: async (endpoint, options) => {
      requests.push({ endpoint, options })
      const response = responses.shift()
      if (!response) throw new Error(`Unexpected request: ${endpoint}`)
      return response
    },
  }
  const file = path.resolve(__dirname, '../src/modules/landing/services/coverageService.ts')
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const module = { exports: {} }
  const context = vm.createContext({ module, exports: module.exports, console })
  const load = vm.runInContext(`(function(require,module,exports){${source}\n})`, context)
  load((name) => {
    if (name === '@/shared/utils/apiClient') return { apiClient }
    if (name === '@/shared/config/api.config') {
      return { API_CONFIG: { PROVINCES: { ACTIVE: '/provinces/active' }, PORTS: { ACTIVE: '/ports/active', OPTIONS: '/ports/options', BY_ID: (id) => `/ports/${id}` } } }
    }
    if (name === '@/shared/utils/provinceCoordinates') {
      return { getProvinceCoordinates: (name) => ({ 'Gia Lai': [109, 13], 'Quang Ninh': [108, 21] }[name] || [0, 0]) }
    }
    throw new Error(`Unexpected import: ${name}`)
  }, module, module.exports)
  return { ...module.exports, requests }
}

function ok(data) {
  return { ok: true, json: async () => ({ success: true, data }) }
}

test('coverage uses in-charge options and joins active port details by province id', async () => {
  const service = loadCoverageService([
    ok([{ id: 1, name: 'Gia Lai', displayName: null }, { id: 2, name: 'Quang Ninh', displayName: null }, { id: 3, name: 'Unknown', displayName: 'New Province' }]),
    ok([10, 11, 12, 13, 14, 15].map((id) => ({ id, name: `Port ${id}` }))),
    ok({ id: 10, name: 'Quy Nhon', provinceId: 1, isActive: true, inCharge: true }),
    ok({ id: 11, name: 'Inactive', provinceId: 1, isActive: false, inCharge: true }),
    ok({ id: 12, name: 'Other operator', provinceId: 2, isActive: true, inCharge: false }),
    ok({ id: 13, name: 'Cai Lan', provinceId: 2, isActive: true, inCharge: true }),
    ok({ id: 14, name: 'Unplaced', provinceId: 3, isActive: true, inCharge: true }),
    ok({ id: 15, name: 'No province', provinceId: null, isActive: true, inCharge: true }),
  ])
  const signal = new AbortController().signal
  const result = await service.loadCoverage(signal)

  assert.deepEqual(Array.from(result.mapped, (province) => [province.id, province.name, Array.from(province.ports, (port) => port.name)]), [
    [1, 'Gia Lai', ['Quy Nhon']],
    [2, 'Quang Ninh', ['Cai Lan']],
  ])
  assert.deepEqual(Array.from(result.unmapped, (province) => [province.id, province.name, Array.from(province.ports, (port) => port.name)]), [
    [3, 'New Province', ['Unplaced']],
  ])
  assert.deepEqual(Array.from(service.requests, (request) => request.endpoint), [
    '/provinces/active', '/ports/options?inChargeOnly=true&limit=50',
    '/ports/10', '/ports/11', '/ports/12', '/ports/13', '/ports/14', '/ports/15',
  ])
  assert.ok(service.requests.every((request) => request.options.skipAuth && request.options.signal === signal))
})

test('coverage returns an empty network when no ports are in charge', async () => {
  const service = loadCoverageService([
    ok([{ id: 1, name: 'Gia Lai' }]),
    ok([]),
  ])
  const result = await service.loadCoverage()
  assert.equal(result.mapped.length, 0)
  assert.equal(result.unmapped.length, 0)
})

test('coverage rejects failed and malformed API responses', async () => {
  const failed = loadCoverageService([{ ok: false, status: 503, json: async () => ({ success: false }) }])
  await assert.rejects(failed.loadCoverage(), /provinces/i)

  const malformed = loadCoverageService([ok([{ id: 1, name: 'Gia Lai' }]), ok({ content: [], hasNext: 'no' })])
  await assert.rejects(malformed.loadCoverage(), /ports/i)
})

test('coverage falls back to complete active-port pagination when options reach their 50-item cap', async () => {
  const options = Array.from({ length: 50 }, (_, index) => ({ id: index + 1, name: `Port ${index + 1}` }))
  const service = loadCoverageService([
    ok([{ id: 1, name: 'Gia Lai' }]),
    ok(options),
    ok({ content: [{ id: 51, name: 'Quy Nhon', provinceId: 1, isActive: true, inCharge: true }], hasNext: true }),
    ok({ content: [{ id: 52, name: 'More', provinceId: 1, isActive: true, inCharge: true }], hasNext: false }),
  ])
  const result = await service.loadCoverage()
  assert.equal(result.mapped[0].ports.length, 2)
  assert.deepEqual(Array.from(service.requests, (request) => request.endpoint), [
    '/provinces/active', '/ports/options?inChargeOnly=true&limit=50',
    '/ports/active?page=0&size=100', '/ports/active?page=1&size=100',
  ])
})
