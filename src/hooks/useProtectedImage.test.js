import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { isLocalImageSource, isProtectedMediaSource } from "../api/media.api.js";

// Exercise the actual hook with React/URL adapters, avoiding a browser dependency.
const hookSource = readFileSync(new URL("./useProtectedImage.js", import.meta.url), "utf8")
  .replace(/^import .*;\n/gm, "")
  .replace("export const useProtectedImage", "const useProtectedImage");
const FIRST_IMAGE = "/api/media/signatures/507f1f77bcf86cd799439011?v=1";
const SECOND_IMAGE = "/api/media/signatures/507f1f77bcf86cd799439011?v=2";
const settle = async () => { await Promise.resolve(); await Promise.resolve(); };

const mountHook = (requestImage) => {
  let auth = { token: "first-session", user: { id: "507f1f77bcf86cd799439011" } };
  let state;
  let effect;
  let pendingEffect;
  const created = [];
  const revoked = [];
  const requests = [];
  const hook = runInNewContext(`${hookSource}\nuseProtectedImage;`, {
    AbortController,
    Error,
    isLocalImageSource,
    isProtectedMediaSource,
    useAuth: () => auth,
    useState: (initial) => {
      state ??= initial;
      return [state, (value) => { state = value; }];
    },
    useEffect: (callback, dependencies) => {
      if (!effect || dependencies.some((entry, index) => !Object.is(entry, effect.dependencies[index]))) {
        pendingEffect = () => {
          effect?.cleanup?.();
          effect = { dependencies, cleanup: callback() };
        };
      }
    },
    URL: {
      createObjectURL: (blob) => {
        const url = `blob:http://localhost/protected-${created.length + 1}`;
        created.push({ blob, url });
        return url;
      },
      revokeObjectURL: (url) => revoked.push(url),
    },
    getProtectedImageBlob: (source, options) => {
      requests.push({ source, options });
      return requestImage(source, options);
    },
  });
  return {
    created, revoked, requests,
    render: (source, nextAuth) => {
      if (nextAuth) auth = nextAuth;
      pendingEffect = null;
      const result = hook(source);
      pendingEffect?.();
      return result;
    },
    unmount: () => effect?.cleanup?.(),
  };
};

test("authorized blob is kept in memory and revoked on unmount", async () => {
  const view = mountHook(async () => new Blob(["image"], { type: "image/png" }));
  assert.equal(view.render(FIRST_IMAGE).loading, true);
  await settle();
  assert.equal(view.render(FIRST_IMAGE).src, view.created[0].url);
  view.unmount();
  assert.equal(view.requests[0].options.signal.aborted, true);
  assert.deepEqual(view.revoked, [view.created[0].url]);
});

test("source replacement immediately hides and revokes the previous signature", async () => {
  const view = mountHook(async () => new Blob(["image"], { type: "image/png" }));
  view.render(FIRST_IMAGE);
  await settle();
  const previous = view.render(FIRST_IMAGE).src;
  assert.equal(view.render(SECOND_IMAGE).src, "");
  assert.deepEqual(view.revoked, [previous]);
  await settle();
  assert.notEqual(view.render(SECOND_IMAGE).src, previous);
  view.unmount();
});

test("logout hides and revokes the private image rather than leaving another session's bytes", async () => {
  const view = mountHook(async () => new Blob(["image"], { type: "image/png" }));
  view.render(FIRST_IMAGE);
  await settle();
  const previous = view.render(FIRST_IMAGE).src;
  const current = view.render(FIRST_IMAGE, { token: null, user: null });
  assert.equal(current.src, "");
  assert.ok(current.error);
  assert.deepEqual(view.revoked, [previous]);
  assert.equal(view.requests.length, 1);
});

test("late response after logout never creates a new object URL", async () => {
  let complete;
  const view = mountHook(() => new Promise((resolve) => { complete = resolve; }));
  view.render(FIRST_IMAGE);
  view.render(FIRST_IMAGE, { token: null, user: null });
  complete(new Blob(["image"], { type: "image/png" }));
  await settle();
  assert.equal(view.created.length, 0);
  assert.equal(view.requests[0].options.signal.aborted, true);
});

test("forbidden private image has no anonymous retry", async () => {
  const view = mountHook(async () => { throw Object.assign(new Error("Forbidden"), { status: 403 }); });
  view.render(FIRST_IMAGE);
  await settle();
  const current = view.render(FIRST_IMAGE);
  assert.equal(current.src, "");
  assert.equal(current.error.status, 403);
  assert.equal(view.requests.length, 1);
  assert.equal(view.created.length, 0);
  view.unmount();
});

test("public uploads cannot bypass the hook while local previews need no network", () => {
  const view = mountHook(() => { throw new Error("Unexpected network request"); });
  const remote = view.render("https://res.cloudinary.com/example/image/upload/firmas/public.png");
  assert.equal(remote.src, "");
  assert.ok(remote.error);
  const local = "data:image/png;base64,aGVsbG8=";
  assert.equal(view.render(local).src, local);
  assert.equal(view.requests.length, 0);
});
