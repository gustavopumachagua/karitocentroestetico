const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]{3,}$/;

export const isValidEmail = (email) => EMAIL_REGEX.test(email.trim());

export const isValidName = (nombre) => NAME_REGEX.test(nombre.trim());

export const isValidRole = (rol) => ["doctor", "cosmiatra"].includes(rol);
