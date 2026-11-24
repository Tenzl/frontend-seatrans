const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function application(env, fetch = async () => Response.json({ success: true })) {
  const context = vm.createContext({
    process: { env }, URL, Headers, Response, console, fetch,
  })
  const cache = new Map()
  function load(relative) {
    const filename = path.resolve(__dirname, '..', relative)
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }
    cache.set(filename, module)
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React },
    }).outputText
    const run = vm.runInContext(`(function(require,module,exports){${source}\n})`, context)
    run(name => {
      if (name === 'next/server') return { NextResponse: Response }
      if (name === './ArticleDetailClient') return { default() {} }
      if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`)
      throw new Error(`Unexpected import ${name}`)
    }, module, module.exports)
    return module.exports
  }
  return { load }
}

for (const base of [undefined, '', '/', '   ']) {
  test(`browser defaults to same-origin with public base ${JSON.stringify(base)}`, () => {
    const env = { NODE_ENV: 'production', API_PROXY_TARGET: 'https://backend.test' }
    if (base !== undefined) env.NEXT_PUBLIC_API_BASE_URL = base
    const { API_CONFIG } = application(env).load('src/shared/config/api.config.ts')
    assert.equal(API_CONFIG.API_URL, '/api/v1')
    assert.equal(API_CONFIG.ASSET_BASE_URL, '')
    assert.equal(API_CONFIG.API_ORIGIN, '')
    assert.ok(!JSON.stringify(API_CONFIG).includes('backend.test'))
  })
}

test('explicit public backend remains backwards compatible and is normalized', () => {
  const { API_CONFIG } = application({ NEXT_PUBLIC_API_BASE_URL: ' https://old-api.test/api/v1/ ' })
    .load('src/shared/config/api.config.ts')
  assert.equal(API_CONFIG.API_URL, 'https://old-api.test/api/v1')
})

test('proxy imports without a public base and forwards query to the private backend', async () => {
  let called
  const app = application({ NODE_ENV: 'production', API_PROXY_TARGET: 'https://backend.test/api/v1/' },
    async (url, options) => {
      called = { url, options }
      return Response.json({ success: true, data: [] })
    })
  const route = app.load('app/api/proxy/[...path]/route.ts')
  const response = await route.GET(new Request('https://site.test/api/proxy/v1/gallery/images?page=2&size=6'), {
    params: Promise.resolve({ path: ['v1', 'gallery', 'images'] }),
  })
  assert.equal(called.url, 'https://backend.test/api/v1/gallery/images?page=2&size=6')
  assert.equal(response.status, 200)
})

test('proxy removes compressed upstream length after fetch decompresses the body', async () => {
  const body = JSON.stringify({ success: true, data: [{ name: 'Gia Lai' }, { name: 'Quang Ninh' }] })
  const app = application({ NODE_ENV: 'production', API_PROXY_TARGET: 'https://backend.test' },
    async () => new Response(body, {
      headers: {
        'content-type': 'application/json',
        'content-encoding': 'br',
        'content-length': '18',
      },
    }))
  const route = app.load('app/api/proxy/[...path]/route.ts')
  const response = await route.GET(new Request('https://site.test/api/proxy/v1/provinces/active'), {
    params: Promise.resolve({ path: ['v1', 'provinces', 'active'] }),
  })

  assert.equal(response.headers.get('content-encoding'), null)
  assert.equal(response.headers.get('content-length'), null)
  assert.deepEqual((await response.json()).data.map(province => province.name), ['Gia Lai', 'Quang Ninh'])
})

test('private proxy target wins over legacy public origin and preserves request body', async () => {
  let called
  const app = application({ NODE_ENV: 'production', API_PROXY_TARGET: 'https://backend.test', NEXT_PUBLIC_API_BASE_URL: 'https://old.test' },
    async (url, options) => {
      called = { url, options }
      return Response.json({ success: true })
    })
  const route = app.load('app/api/proxy/[...path]/route.ts')
  await route.POST(new Request('https://site.test/api/proxy/v1/inquiries', { method: 'POST', body: '{"portId":7}' }), {
    params: Promise.resolve({ path: ['v1', 'inquiries'] }),
  })
  assert.equal(called.url, 'https://backend.test/api/v1/inquiries')
  assert.equal(new TextDecoder().decode(called.options.body), '{"portId":7}')
})

test('article metadata uses an absolute backend URL when browser API is same-origin', async () => {
  let called
  const app = application({ NODE_ENV: 'production', API_PROXY_TARGET: 'https://backend.test' },
    async url => {
      called = url
      return Response.json({ success: true, data: { id: 4, title: 'Port news', content: 'Update', thumbnailUrl: '/uploads/photo.jpg' } })
    })
  const page = app.load('app/(public)/insights/[id]/page.tsx')
  const result = await page.generateMetadata({ params: Promise.resolve({ id: '4' }) })
  assert.equal(called, 'https://backend.test/api/v1/posts/4')
  assert.equal(result.title, 'Port news | Seatrans')
  assert.equal(result.openGraph.images[0], 'https://backend.test/uploads/photo.jpg')
})

test('production rewrites route through the local API proxy', async () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../next.config.js'), 'utf8')
  const module = { exports: {} }
  vm.runInNewContext(source, { module, process: { env: { NODE_ENV: 'production', API_PROXY_TARGET: 'https://backend.test/api/v1/' } } })
  const [rewrite] = await module.exports.rewrites()
  assert.equal(rewrite.destination, '/api/proxy/:path*')
})
