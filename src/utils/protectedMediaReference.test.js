import assert from "node:assert/strict";
import test from "node:test";
import {
  persistedMediaReference,
  protectedSignatureReference,
  sanitizeAuthMediaUser,
  sanitizeClinicalHistoryMedia,
} from "./protectedMediaReference.js";

const USER = "111111111111111111111111";
const HISTORY = "222222222222222222222222";
const IMAGE = "333333333333333333333333";
const LEGACY_SIGNATURE = "https://res.cloudinary.com/example/image/upload/v123/firmas/signature.webp";

test("persistent references allow only known canonical backend resources", () => {
  for (const path of [
    `/api/media/signatures/${USER}?v=123`, `/api/media/avatars/${USER}`,
    `/api/media/histories/${HISTORY}/signature`,
    `/api/media/treatments/${HISTORY}/images/${IMAGE}`,
    `/api/media/treatments/${HISTORY}/images/0?variant=thumbnail`,
  ]) assert.equal(persistedMediaReference(path), path);
  for (const path of [LEGACY_SIGNATURE, "blob:https://example/object", "data:image/png;base64,YQ==",
    `/api/media/signatures/${USER}?token=secret`, `/api/media/signatures/${USER}?v=1&v=2`,
    `/api/media/signatures/${USER}#fragment`, `/api/media/signatures/${USER}/../${USER}`,
    `/api/media/treatments/${HISTORY}/images/1000`, "//foreign.example/api/media/signatures/1",
  ]) assert.equal(persistedMediaReference(path), "", path);
});

test("old signature links are replaced by identity references, never fetched", () => {
  assert.equal(protectedSignatureReference(LEGACY_SIGNATURE, { userId: USER }), `/api/media/signatures/${USER}`);
  assert.equal(protectedSignatureReference(LEGACY_SIGNATURE, { userId: USER, historyId: HISTORY }), `/api/media/histories/${HISTORY}/signature`);
  for (const value of ["https://foreign.example/signature.png", "https://res.cloudinary.com.evil/image/upload/firmas/x.webp", `${LEGACY_SIGNATURE}?signature=secret`, "data:image/png;base64,YQ=="]) {
    assert.equal(protectedSignatureReference(value, { userId: USER }), "");
  }
  assert.equal(protectedSignatureReference(LEGACY_SIGNATURE, { userId: "same-display-name" }), "");
  assert.equal(protectedSignatureReference(`/api/media/avatars/${USER}`, { userId: USER }), "");
});

test("session snapshots discard provider metadata and use protected own images", () => {
  const user = { id: USER, nombre: "Profesional", rol: "doctor", cmp: "123456", firmaDigital: LEGACY_SIGNATURE,
    firmaDigitalPublicId: "firmas/signature", firmaDigitalAsset: { asset_id: "provider" },
    avatar: "https://res.cloudinary.com/example/image/upload/avatars/avatar.webp", avatarPublicId: "avatars/avatar" };
  const before = structuredClone(user);
  const safe = sanitizeAuthMediaUser(user);
  assert.deepEqual(user, before);
  assert.equal(safe.nombre, user.nombre);
  assert.equal(safe.cmp, user.cmp);
  assert.equal(safe.firmaDigital, `/api/media/signatures/${USER}`);
  assert.equal(safe.avatar, `/api/media/avatars/${USER}`);
  assert.equal(safe.avatarPublicId, undefined);
  assert.equal(safe.firmaDigitalAsset, undefined);
});

test("clinical signature upgrade preserves patient answers and dates", () => {
  const record = { remoteId: HISTORY, ownerId: USER, signatureUrl: LEGACY_SIGNATURE, status: "completed", updatedAt: "2026-10-10",
    formData: { nombreCompleto: "Paciente", observacion: "Respuesta íntegra", firmaDigital: LEGACY_SIGNATURE },
    firmaMedico: { nombre: "Profesional", cmp: "123456", url: LEGACY_SIGNATURE, asset: { asset_id: "provider" } } };
  const original = structuredClone(record);
  const safe = sanitizeClinicalHistoryMedia(record);
  assert.deepEqual(record, original);
  assert.equal(safe.signatureUrl, `/api/media/histories/${HISTORY}/signature`);
  assert.equal(safe.formData.observacion, "Respuesta íntegra");
  assert.equal(safe.updatedAt, record.updatedAt);
  assert.equal(safe.firmaMedico.asset, undefined);
  assert.equal(safe.formData.firmaDigital, safe.signatureUrl);
});

test("temporary image bytes or signed URLs never become persistent references", () => {
  for (const value of ["blob:https://application/image", "data:image/png;base64,YQ==", `${LEGACY_SIGNATURE}?expires_at=123&signature=secret`]) {
    assert.equal(sanitizeClinicalHistoryMedia({ ownerId: USER, signatureUrl: value }).signatureUrl, "");
    assert.equal(sanitizeAuthMediaUser({ id: USER, firmaDigital: value }).firmaDigital, "");
  }
});
