import assert from "node:assert/strict";
import test from "node:test";
import {
  getProtectedImageBlob,
  isLocalImageSource,
  normalizeProtectedMediaPath,
  resolveProtectedImageSource,
} from "./media.api.js";

const USER_ID = "507f1f77bcf86cd799439011";
const IMAGE_ID = "507f1f77bcf86cd799439012";
const SIGNATURE = `/api/media/signatures/${USER_ID}?v=123`;

const withBrowser = async (callback, { token = "test-session", fetchImpl } = {}) => {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  globalThis.window = { localStorage: { getItem: (key) => key === "token" ? token : null } };
  globalThis.fetch = fetchImpl || (() => { throw new Error("Unexpected network request"); });
  try {
    await callback();
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    globalThis.fetch = previousFetch;
  }
};

test("media references allow only existing owned API endpoints and safe cache versions", () => {
  const paths = [
    SIGNATURE,
    `/api/media/avatars/${USER_ID}`,
    `/api/media/histories/${USER_ID}/signature`,
    `/api/media/treatments/${USER_ID}/images/${IMAGE_ID}?variant=thumbnail&v=123`,
    `/api/media/treatments/${USER_ID}/images/0?variant=thumbnail`,
    `/api/media/treatments/${USER_ID}/images/999`,
  ];
  paths.forEach((path) => assert.equal(normalizeProtectedMediaPath(path), path));
  [
    `https://res.cloudinary.com/example/image/upload/firmas/example.png`,
    `https://external.invalid/api/media/signatures/${USER_ID}`,
    `//external.invalid/api/media/signatures/${USER_ID}`,
    `/api/media/signatures/${USER_ID}?url=https://external.invalid`,
    `/api/media/signatures/${USER_ID}?v=${"1".repeat(81)}`,
    `/api/media/signatures/${USER_ID}?v=123&v=456`,
    `/api/media/signatures/../signatures/${USER_ID}`,
    `/api/media/signatures\\${USER_ID}`,
    `/api/media/signatures/not-an-id`,
    `/api/media/signatures/${USER_ID}#fragment`,
    `/api/media/signatures/${USER_ID}?variant=external`,
    `/api/media/treatments/${USER_ID}/images/1000`,
    `/api/media/treatments/${USER_ID}/images/01`,
  ].forEach((path) => assert.equal(normalizeProtectedMediaPath(path), ""));
});

test("legacy own-profile references are resolved by immutable owner, never delivered publicly", () => {
  const legacy = "https://res.cloudinary.com/example/image/upload/firmas/old.png";
  assert.equal(resolveProtectedImageSource(legacy, { userId: USER_ID, kind: "signatures" }), `/api/media/signatures/${USER_ID}`);
  assert.equal(resolveProtectedImageSource(legacy, { userId: USER_ID, kind: "avatars" }), `/api/media/avatars/${USER_ID}`);
  assert.equal(resolveProtectedImageSource(legacy, { userId: "missing", kind: "signatures" }), "");
  assert.equal(resolveProtectedImageSource(legacy, { userId: USER_ID, kind: "treatments" }), "");
  assert.equal(resolveProtectedImageSource("", { userId: USER_ID, kind: "signatures" }), "");
  assert.equal(resolveProtectedImageSource(SIGNATURE), SIGNATURE);
});

test("local previews and bundled assets are separate from remote public uploads", () => {
  ["blob:http://localhost/private-preview", "data:image/png;base64,aGVsbG8=", "/assets/Logo-abc.jpg", "/avatar-default.svg"]
    .forEach((source) => assert.equal(isLocalImageSource(source), true));
  ["https://res.cloudinary.com/example/image/upload/example.png", "https://external.invalid/image.png", "javascript:alert(1)"]
    .forEach((source) => assert.equal(isLocalImageSource(source), false));
});

test("authorized image fetch includes Bearer, disables caching and refuses redirects", async () => {
  const controller = new AbortController();
  let requested;
  await withBrowser(async () => {
    const image = await getProtectedImageBlob(SIGNATURE, { signal: controller.signal });
    assert.equal(image.type, "image/png");
    assert.equal(requested.source, SIGNATURE);
    assert.equal(requested.options.headers.Authorization, "Bearer test-session");
    assert.equal(requested.options.cache, "no-store");
    assert.equal(requested.options.credentials, "omit");
    assert.equal(requested.options.redirect, "error");
    assert.equal(requested.options.signal, controller.signal);
  }, {
    fetchImpl: async (source, options) => {
      requested = { source, options };
      return new Response(new Blob(["image-content"], { type: "image/png" }));
    },
  });
});

test("public source or absent authentication never generates a network request", async () => {
  await withBrowser(async () => {
    await assert.rejects(getProtectedImageBlob("https://external.invalid/image.png"), (error) => error.status === 400);
  });
  await withBrowser(async () => {
    await assert.rejects(getProtectedImageBlob(SIGNATURE), (error) => error.status === 401);
  }, { token: null });
});

test("forbidden image remains forbidden without fallback requests", async () => {
  let calls = 0;
  await withBrowser(async () => {
    await assert.rejects(getProtectedImageBlob(SIGNATURE), (error) => error.status === 403);
    assert.equal(calls, 1);
  }, { fetchImpl: async () => {
    calls += 1;
    return new Response("Forbidden", { status: 403 });
  } });
});

test("HTML or oversized responses are not shown as protected images", async () => {
  await withBrowser(async () => {
    await assert.rejects(getProtectedImageBlob(SIGNATURE), (error) => error.status === 415);
  }, { fetchImpl: async () => new Response("<html>Error</html>", { headers: { "content-type": "text/html" } }) });
  await withBrowser(async () => {
    await assert.rejects(getProtectedImageBlob(SIGNATURE), (error) => error.status === 413);
  }, { fetchImpl: async () => new Response("image", { headers: { "content-type": "image/png", "content-length": String(13 * 1024 * 1024) } }) });
});

test("cancellation is forwarded, with no unauthenticated retry", async () => {
  const controller = new AbortController();
  controller.abort();
  await withBrowser(async () => {
    await assert.rejects(getProtectedImageBlob(SIGNATURE, { signal: controller.signal }), (error) => error.name === "AbortError");
  }, { fetchImpl: async (_source, options) => {
    assert.equal(options.signal, controller.signal);
    throw new DOMException("Aborted", "AbortError");
  } });
});

test("logout during image fetch discards bytes instead of exposing the previous session image", async () => {
  await withBrowser(async () => {
    await assert.rejects(getProtectedImageBlob(SIGNATURE), (error) => error.status === 401);
  }, { fetchImpl: async () => {
    globalThis.window.localStorage.getItem = () => null;
    return new Response(new Blob(["image-content"], { type: "image/png" }));
  } });
});

test("logout while reading the response body also discards its bytes", async () => {
  await withBrowser(async () => {
    await assert.rejects(getProtectedImageBlob(SIGNATURE), (error) => error.status === 401);
  }, { fetchImpl: async () => ({
    ok: true,
    headers: new Headers({ "content-type": "image/png" }),
    blob: async () => {
      globalThis.window.localStorage.getItem = () => "another-session";
      return new Blob(["image-content"], { type: "image/png" });
    },
  }) });
});
