const assert = require("node:assert/strict"),
  { test } = require("node:test"),
  fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm"),
  ts = require("typescript");
function session() {
  const requests = [];
  const cache = new Map();
  let respond = () =>
    Response.json({
      success: true,
      data: { content: [], page: 0, size: 6, totalPages: 0, totalElements: 0 },
    });
  const context = vm.createContext({
    Response,
    FormData,
    URLSearchParams,
    AbortController,
    setTimeout,
    clearTimeout,
    console,
    process: {
      env: {
        NEXT_PUBLIC_API_BASE_URL: "https://api.test",
        NEXT_PUBLIC_API_TIMEOUT: "0",
      },
    },
    window: { location: { pathname: "/", href: "/" } },
    sessionStorage: { getItem: () => "stale-token" },
    localStorage: { getItem: () => null },
    fetch: async (url, options) => {
      requests.push({ url, options });
      return respond(url, options);
    },
  });
  function load(relative) {
    const file = path.resolve(__dirname, "..", relative);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} };
    cache.set(file, mod);
    const text = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText;
    const execute = vm.runInContext(
      `(function(require,module,exports){${text}\n})`,
      context,
    );
    execute(
      (name) =>
        load(
          name.startsWith("@/")
            ? "src/" + name.slice(2) + ".ts"
            : path.relative(
                path.resolve(__dirname, ".."),
                path.resolve(path.dirname(file), name),
              ) + ".ts",
        ),
      mod,
      mod.exports,
    );
    return mod.exports;
  }
  return {
    ...load("src/modules/gallery/services/publicGalleryService.ts"),
    requests,
    respondWith: (handler) => (respond = handler),
  };
}
const photo = {
  id: 5,
  imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/ship.jpg",
  serviceTypeId: 2,
  commodityId: 7,
  commodityName: "Steel",
  portName: "QUY NHON",
  provinceName: "Gia Lai",
  commodityTypeId: null,
};
test("public gallery uses the shared flat DTO, commodity filter and authoritative pagination without authentication", async () => {
  const s = session();
  s.respondWith(() =>
    Response.json({
      success: true,
      data: {
        content: [photo],
        totalElements: 13,
        totalPages: 3,
        page: 1,
        size: 6,
      },
    }),
  );
  const controller = new AbortController();
  const result = await s.publicGalleryService.listPublicImages(
    { serviceTypeId: 2, commodityId: 7, page: 1, size: 6 },
    controller.signal,
  );
  assert.equal(result.content[0].commodityName, "Steel");
  assert.equal(result.totalPages, 3);
  const url = new URL(s.requests[0].url);
  assert.equal(url.pathname, "/api/v1/gallery/images");
  assert.equal(url.searchParams.get("commodityId"), "7");
  assert.equal(url.searchParams.get("page"), "1");
  assert.equal(url.searchParams.has("imageTypeId"), false);
  assert.equal(s.requests[0].options.headers.Authorization, undefined);
  assert.equal(s.requests[0].options.cache, "no-store");
});
test("public errors and malformed payloads reject instead of looking like an empty gallery", async () => {
  const s = session();
  s.respondWith(() => Response.json({ success: false }, { status: 503 }));
  await assert.rejects(
    s.publicGalleryService.listPublicImages({ serviceTypeId: 1 }),
    /Could not load/,
  );
  s.respondWith(() => Response.json({ success: true, data: { content: [] } }));
  await assert.rejects(
    s.publicGalleryService.listPublicImages({ serviceTypeId: 1 }),
    /Could not load/,
  );
});
test("commodity filters come from the current public catalog", async () => {
  const s = session();
  s.respondWith(() =>
    Response.json({
      data: [{ id: 7, serviceTypeId: 2, displayName: "Steel" }],
    }),
  );
  const rows = await s.publicGalleryService.listCommodities(2);
  assert.equal(rows[0].id, 7);
  assert.match(s.requests[0].url, /\/commodities\?serviceTypeId=2/);
  assert.equal(s.requests[0].options.headers.Authorization, undefined);
});
test("image delivery keeps asset paths and versions and uses smaller Cloudinary thumbnails", () => {
  const s = session();
  assert.equal(
    s.galleryImageUrl(photo.imageUrl),
    "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800,c_limit/v1/ship.jpg",
  );
  assert.equal(
    s.galleryImageUrl(
      "https://res.cloudinary.com/demo/image/upload/w_2000/v1/ship.jpg",
      "full",
    ),
    "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit/v1/ship.jpg",
  );
  assert.equal(
    s.galleryImageUrl("gallery\\ship.jpg"),
    "https://api.test/gallery/ship.jpg",
  );
});
