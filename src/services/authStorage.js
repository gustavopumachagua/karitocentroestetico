const TOKEN_KEY = "token";
const USER_KEY = "user";

export const AUTH_SESSION_EVENT = "auth-session-change";

const getStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const isUserRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const serializeUser = (user) => {
  if (!isUserRecord(user)) return null;

  try {
    return JSON.stringify(user);
  } catch {
    return null;
  }
};

const readStorageValue = (key) => {
  const storage = getStorage();
  if (!storage) return null;

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorageValue = (key, value) => {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const removeStorageValue = (key) => {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

const emitSessionChange = (type) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_EVENT, {
      detail: { type, session: getAuthSession() },
    }),
  );
};

/** Returns the token stored under the existing `token` key, if available. */
export const getAuthToken = () => readStorageValue(TOKEN_KEY) || null;

/** Safely reads the existing `user` JSON payload without throwing on corruption. */
export const getAuthUser = () => {
  const rawUser = readStorageValue(USER_KEY);
  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser);
    return isUserRecord(user) ? user : null;
  } catch {
    return null;
  }
};

export const getAuthSession = () => ({
  token: getAuthToken(),
  user: getAuthUser(),
});

/** Persists a complete session using the existing localStorage schema. */
export const saveAuthSession = ({ token, user } = {}) => {
  const savedToken =
    typeof token === "string" ? writeStorageValue(TOKEN_KEY, token) : false;
  const serializedUser = serializeUser(user);
  const savedUser = serializedUser
    ? writeStorageValue(USER_KEY, serializedUser)
    : false;

  if (savedToken || savedUser) {
    emitSessionChange("saved");
  }

  return savedToken || savedUser;
};

/** Updates only the user snapshot while retaining the stored token. */
export const saveAuthUser = (user) => {
  const serializedUser = serializeUser(user);
  if (!serializedUser) return false;

  const saved = writeStorageValue(USER_KEY, serializedUser);
  if (saved) {
    emitSessionChange("user-updated");
  }

  return saved;
};

/** Removes the existing session keys and notifies active consumers. */
export const clearAuthSession = () => {
  const removedToken = removeStorageValue(TOKEN_KEY);
  const removedUser = removeStorageValue(USER_KEY);

  if (removedToken || removedUser) {
    emitSessionChange("cleared");
  }

  return removedToken || removedUser;
};

export const isAuthStorageKey = (key) => key === TOKEN_KEY || key === USER_KEY;
