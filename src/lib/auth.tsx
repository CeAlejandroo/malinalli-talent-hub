import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Rol = "candidato" | "rh";

export type Usuario = {
  nombre: string;
  email: string;
  rol: Rol;
};

type AuthContextValue = {
  usuario: Usuario | null;
  cargando: boolean;
  login: (datos: { email: string; rol: Rol }) => Usuario;
  logout: () => void;
};

const STORAGE_KEY = "malinalli.sesion";

const AuthContext = createContext<AuthContextValue | null>(null);

function nombreDesdeEmail(email: string) {
  const base = email.split("@")[0]?.replace(/[._-]+/g, " ") ?? "Usuario";
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUsuario(JSON.parse(raw) as Usuario);
    } catch {
      /* sesión inválida */
    }
    setCargando(false);
  }, []);

  const login = useCallback(({ email, rol }: { email: string; rol: Rol }) => {
    const nuevo: Usuario = { nombre: nombreDesdeEmail(email), email, rol };
    setUsuario(nuevo);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevo));
    } catch {
      /* almacenamiento no disponible */
    }
    return nuevo;
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const value = useMemo(
    () => ({ usuario, cargando, login, logout }),
    [usuario, cargando, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
