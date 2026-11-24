const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function storage() {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  }
}

// Run the actual service and API client in an isolated browser-like environment.
// Only the HTTP boundary is stubbed; storage and token selection are real code.
function browserSession() {
  const localStorage = storage()
  const sessionStorage = storage()
  const requests = []
  const location = { pathname: '/login', href: '/login' }
  const context = vm.createContext({
    localStorage, sessionStorage, window: { location },
    Response, FormData, AbortController, setTimeout, clearTimeout,
    console: { log() {}, warn() {}, error() {} },
    process: { env: { NEXT_PUBLIC_API_BASE_URL: 'https://api.test', NEXT_PUBLIC_API_TIMEOUT: '0' } },
    fetch: async (url, options) => {
      requests.push({ url, options })
      return context.respond(url, options)
    },
  })
  const cache = new Map()
  function load(relativePath) {
    const filename = path.resolve(__dirname, '..', relativePath)
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }
    cache.set(filename, module)
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText
    const execute = vm.runInContext(`(function(require, module, exports) { ${source}\n})`, context)
    execute(specifier => {
      const target = specifier.startsWith('@/')
        ? path.join('src', specifier.slice(2))
        : path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), specifier))
      return load(`${target}.ts`)
    }, module, module.exports)
    return module.exports
  }
  const { authService } = load('src/modules/auth/services/authService.ts')
  const { apiClient } = load('src/shared/utils/apiClient.ts')
  return {
    authService, apiClient, localStorage, sessionStorage, requests, location,
    respondWith: handler => { context.respond = handler },
  }
}

const user = { id: 1, email: 'customer@example.test', fullName: 'Customer' }
const authResponse = token => Response.json({
  success: true, data: { token, type: 'Bearer', user },
})

test('remembered login replaces a stale tab token and sends the new token to the API', async () => {
  const browser = browserSession()
  browser.sessionStorage.setItem('auth_token', 'expired-tab-token')
  browser.sessionStorage.setItem('auth_user', JSON.stringify({ id: 99 }))
  browser.respondWith(url => url.endsWith('/auth/login')
    ? authResponse('new-token') : Response.json({ success: true, data: user }))

  assert.equal((await browser.authService.login(user.email, 'password', true)).success, true)
  await browser.apiClient.get('/auth/current-user')

  assert.equal(browser.authService.getToken(), 'new-token')
  assert.equal(browser.requests.at(-1).options.headers.Authorization, 'Bearer new-token')
  assert.equal(browser.sessionStorage.getItem('auth_token'), null)
  assert.equal(browser.authService.getUser().id, user.id)
})

test('tab-only login removes the previous persistent login', async () => {
  const browser = browserSession()
  browser.localStorage.setItem('auth_token', 'previous-persistent-token')
  browser.localStorage.setItem('auth_user', JSON.stringify({ id: 99 }))
  browser.respondWith(() => authResponse('tab-token'))

  await browser.authService.login(user.email, 'password', false)

  assert.equal(browser.authService.getToken(), 'tab-token')
  assert.equal(browser.localStorage.getItem('auth_token'), null)
  assert.equal(browser.localStorage.getItem('auth_user'), null)
})

test('registration also replaces a stale tab login', async () => {
  const browser = browserSession()
  browser.sessionStorage.setItem('auth_token', 'expired-tab-token')
  browser.respondWith(() => authResponse('registered-token'))

  await browser.authService.register(user.email, user.fullName, 'password')

  assert.equal(browser.authService.getToken(), 'registered-token')
  assert.equal(browser.sessionStorage.getItem('auth_token'), null)
})

test('a delayed 401 for an old token cannot clear a newly logged-in session', async () => {
  const browser = browserSession()
  browser.localStorage.setItem('auth_token', 'old-token')
  let finishOldRequest
  browser.respondWith(url => url.endsWith('/auth/login')
    ? authResponse('new-token')
    : new Promise(resolve => { finishOldRequest = resolve }))
  const oldRequest = browser.apiClient.get('/inquiries').catch(error => error)

  await browser.authService.login(user.email, 'password', true)
  browser.location.pathname = '/'
  browser.location.href = '/'
  finishOldRequest(new Response(null, { status: 401 }))
  await oldRequest

  assert.equal(browser.authService.getToken(), 'new-token')
  assert.equal(browser.authService.getUser().id, user.id)
  assert.equal(browser.location.href, '/')
})

test('a 401 for the active token still logs out and redirects', async () => {
  const browser = browserSession()
  browser.localStorage.setItem('auth_token', 'expired-token')
  browser.localStorage.setItem('auth_user', JSON.stringify(user))
  browser.location.pathname = '/'
  browser.respondWith(() => new Response(null, { status: 401 }))

  await assert.rejects(browser.apiClient.get('/auth/current-user'), /Session expired/)

  assert.equal(browser.authService.getToken(), null)
  assert.equal(browser.authService.getUser(), null)
  assert.equal(browser.location.href, '/login?reason=session_expired')
})

test('a 401 without a login does not force visitors to the login page', async () => {
  const browser = browserSession()
  browser.location.pathname = '/'
  browser.location.href = '/'
  browser.respondWith(() => new Response(null, { status: 401 }))

  await assert.rejects(browser.apiClient.get('/inquiries'))

  assert.equal(browser.location.href, '/')
})

test('a delayed profile response cannot overwrite the new login profile', async () => {
  const browser = browserSession()
  browser.localStorage.setItem('auth_token', 'old-token')
  let finishOldRequest
  browser.respondWith(url => url.endsWith('/auth/login')
    ? authResponse('new-token')
    : new Promise(resolve => { finishOldRequest = resolve }))
  const oldProfile = browser.authService.getCurrentUser()

  await browser.authService.login(user.email, 'password', true)
  finishOldRequest(Response.json({ success: true, data: { id: 99 } }))
  const result = await oldProfile

  assert.equal(browser.authService.getUser().id, user.id)
  assert.equal(result.success, false)
  assert.equal(result.data, null)
})

test('failed login does not replace an existing session', async () => {
  const browser = browserSession()
  browser.localStorage.setItem('auth_token', 'existing-token')
  browser.respondWith(() => Response.json({ success: false }, { status: 401 }))

  assert.equal((await browser.authService.login(user.email, 'incorrect')).success, false)
  assert.equal(browser.authService.getToken(), 'existing-token')
})
