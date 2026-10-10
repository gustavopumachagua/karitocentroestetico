import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getProfesionales } from "../api/citas.api";
import { useAuth } from "./useAuth";
import { useCitas } from "./useCitas";
import {
  AUTH_SESSION_EVENT,
  isAuthStorageKey,
} from "../services/authStorage";
import {
  createProfessionalNameIndex,
  getEntityId,
} from "../utils/professionalDirectory";

/**
 * Loads the live professional directory used only for presentation.  It lets
 * historical records retain their immutable owner id while their visible name
 * follows a later profile rename.
 */
export function useProfessionalDirectory() {
  const { user } = useAuth();
  const { socket } = useCitas();
  const [professionals, setProfessionals] = useState([]);
  const requestSequence = useRef(0);
  const previousProfile = useRef(null);
  const userId = getEntityId(user);
  const userName = String(user?.nombre || "").trim();

  const applyCurrentProfessional = useCallback((professional) => {
    const id = getEntityId(professional);
    const nombre = String(professional?.nombre || "").trim();
    if (!id || !nombre) return;

    setProfessionals((currentProfessionals) => {
      const index = currentProfessionals.findIndex(
        (currentProfessional) => getEntityId(currentProfessional) === id,
      );
      if (index < 0) return [...currentProfessionals, { ...professional, id, nombre }];

      return currentProfessionals.map((currentProfessional, currentIndex) =>
        currentIndex === index
          ? { ...currentProfessional, ...professional, nombre }
          : currentProfessional,
      );
    });
  }, []);

  const refreshProfessionals = useCallback(async () => {
    const requestId = ++requestSequence.current;
    try {
      const data = await getProfesionales();
      const nextProfessionals = Array.isArray(data) ? data : [];
      if (requestId === requestSequence.current) {
        setProfessionals(nextProfessionals);
      }
      return nextProfessionals;
    } catch (error) {
      // Keep the record snapshot as a graceful fallback when the directory
      // cannot be refreshed (for example, a brief connection interruption).
      console.error("Error al obtener el directorio de profesionales:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    const previous = previousProfile.current;
    previousProfile.current = { id: userId, nombre: userName };

    if (!userId) {
      requestSequence.current += 1;
      setProfessionals([]);
      return;
    }

    // Reflect a profile edited in this session immediately. On first mount,
    // the live directory remains authoritative over an older stored session.
    if (previous?.id === userId && previous.nombre !== userName) {
      applyCurrentProfessional({ id: userId, nombre: userName });
    }
    void refreshProfessionals();
  }, [userId, userName, applyCurrentProfessional, refreshProfessionals]);

  useEffect(() => {
    const refresh = () => {
      if (userId) void refreshProfessionals();
    };
    const handleStorage = (event) => {
      if (isAuthStorageKey(event.key)) refresh();
    };

    window.addEventListener(AUTH_SESSION_EVENT, refresh);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, refresh);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refresh);
    };
  }, [userId, refreshProfessionals]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleProfessionalUpdated = (professional) => {
      // Ignore a response started before this authoritative update arrived.
      requestSequence.current += 1;
      applyCurrentProfessional(professional);
      void refreshProfessionals();
    };
    socket.on("profesionalActualizado", handleProfessionalUpdated);
    socket.on("connect", refreshProfessionals);

    return () => {
      socket.off("profesionalActualizado", handleProfessionalUpdated);
      socket.off("connect", refreshProfessionals);
    };
  }, [socket, applyCurrentProfessional, refreshProfessionals]);

  useEffect(() => () => {
    requestSequence.current += 1;
  }, []);

  const professionalNamesById = useMemo(
    () => createProfessionalNameIndex(professionals),
    [professionals],
  );

  return { professionals, professionalNamesById, refreshProfessionals };
}
