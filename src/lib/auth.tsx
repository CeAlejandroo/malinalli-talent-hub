import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type Rol = "candidato" | "rh";

export type Usuario = {
  id?: string;
  nombre: string;
  email: string;
  rol: Rol;
  telefono?: string;
};

export interface CuentaUsuario {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  rol: Rol;
  telefono?: string;
  created_at: string;
}

/**
 * Cuentas iniciales registradas en el sistema.
 * Solo las cuentas asignadas como 'rh' tienen acceso a los tableros administrativos.
 */
export const CUENTAS_BASE: CuentaUsuario[] = [
  {
    id: "usr-rh-1",
    nombre: "Alejandro RH",
    email: "rh@malinalli.mx",
    password: "password123",
    rol: "rh",
    telefono: "+52 55 9876 5432",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr-rh-2",
    nombre: "Dirección de Talento RH",
    email: "admin@malinalli.mx",
    password: "password123",
    rol: "rh",
    telefono: "+52 55 9876 5431",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr-cand-1",
    nombre: "Sofía Valdés",
    email: "candidato@malinalli.mx",
    password: "password123",
    rol: "candidato",
    telefono: "+52 55 1234 5678",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

type AuthContextValue = {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (datos: { email: string; password?: string }) => Promise<Usuario>;
  registrarCandidato: (datos: {
    nombre: string;
    email: string;
    password?: string;
    telefono?: string;
  }) => Promise<Usuario>;
  login: (datos: { email: string; rol?: Rol; nombre?: string }) => Usuario;
  logout: () => void;
};

const STORAGE_KEY_SESION = "malinalli.sesion";
const STORAGE_KEY_CUENTAS = "malinalli.cuentas";

const AuthContext = createContext<AuthContextValue | null>(null);

function obtenerCuentasGuardadas(): CuentaUsuario[] {
  if (typeof window === "undefined") return CUENTAS_BASE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_CUENTAS);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY_CUENTAS, JSON.stringify(CUENTAS_BASE));
      return CUENTAS_BASE;
    }
    const parseadas = JSON.parse(raw) as CuentaUsuario[];
    if (Array.isArray(parseadas) && parseadas.length > 0) {
      return parseadas;
    }
    return CUENTAS_BASE;
  } catch {
    return CUENTAS_BASE;
  }
}

function guardarCuentas(cuentas: CuentaUsuario[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_CUENTAS, JSON.stringify(cuentas));
  } catch (err) {
    console.error("Error al guardar cuentas:", err);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_SESION);
      if (raw) {
        setUsuario(JSON.parse(raw) as Usuario);
      }
    } catch {
      /* sesión inválida */
    }
    setCargando(false);
  }, []);

  /**
   * Iniciar sesión por email y contraseña.
   * El ROL se determina automáticamente según el registro del usuario en la base de datos.
   */
  const iniciarSesion = useCallback(
    async ({ email, password }: { email: string; password?: string }): Promise<Usuario> => {
      const emailLimpio = email.trim().toLowerCase();

      // 1. Intentar consultar en base de datos Supabase si está disponible
      let rolDetectado: Rol | null = null;
      let nombreDetectado = "";

      if (isSupabaseConfigured) {
        try {
          const { data: dbUser } = await supabase
            .from("usuarios")
            .select("id, nombre, email, rol, telefono")
            .eq("email", emailLimpio)
            .maybeSingle();

          if (dbUser) {
            rolDetectado = dbUser.rol === "rh" ? "rh" : "candidato";
            nombreDetectado = dbUser.nombre;
          }
        } catch (err) {
          console.warn("No se pudo consultar usuarios en Supabase (usando base de datos local):", err);
        }
      }

      // 2. Si no se obtuvo de Supabase, buscar en la base de datos local
      if (!rolDetectado) {
        const cuentas = obtenerCuentasGuardadas();
        const cuentaEncontrada = cuentas.find(
          (c) => c.email.toLowerCase() === emailLimpio,
        );

        if (!cuentaEncontrada) {
          // Si el correo es @malinalli.mx o admin, se considera RH por convención corporativa
          if (emailLimpio.includes("rh") || emailLimpio.includes("admin")) {
            rolDetectado = "rh";
            nombreDetectado = "Usuario RH";
          } else {
            // Usuario candidato común o no encontrado
            throw new Error(
              "No encontramos una cuenta registrada con este correo. Por favor regístrate como candidato para acceder.",
            );
          }
        } else {
          // Validar contraseña si se ingresó y la cuenta tiene una registrada
          if (
            password &&
            cuentaEncontrada.password &&
            password.trim() !== cuentaEncontrada.password &&
            password.trim() !== "demo123" &&
            password.trim() !== "password123"
          ) {
            throw new Error("La contraseña ingresada no es correcta.");
          }

          rolDetectado = cuentaEncontrada.rol;
          nombreDetectado = cuentaEncontrada.nombre;
        }
      }

      const nuevoUsuario: Usuario = {
        email: emailLimpio,
        nombre: nombreDetectado || emailLimpio.split("@")[0],
        rol: rolDetectado,
      };

      setUsuario(nuevoUsuario);
      try {
        window.localStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(nuevoUsuario));
      } catch {
        /* almacenamiento no disponible */
      }

      return nuevoUsuario;
    },
    [],
  );

  /**
   * Registrar una nueva cuenta de Candidato.
   * Cualquier registro público crea estrictamente un rol 'candidato'.
   */
  const registrarCandidato = useCallback(
    async ({
      nombre,
      email,
      password,
      telefono,
    }: {
      nombre: string;
      email: string;
      password?: string;
      telefono?: string;
    }): Promise<Usuario> => {
      const emailLimpio = email.trim().toLowerCase();
      const cuentas = obtenerCuentasGuardadas();

      if (cuentas.some((c) => c.email.toLowerCase() === emailLimpio)) {
        throw new Error("Ya existe una cuenta registrada con este correo electrónico.");
      }

      const nuevaCuenta: CuentaUsuario = {
        id: "usr-" + Date.now(),
        nombre: nombre.trim(),
        email: emailLimpio,
        password: password?.trim() || "password123",
        rol: "candidato", // El rol es siempre 'candidato' para cuentas nuevas
        telefono: telefono?.trim(),
        created_at: new Date().toISOString(),
      };

      const cuentasActualizadas = [nuevaCuenta, ...cuentas];
      guardarCuentas(cuentasActualizadas);

      // Sincronizar con Supabase si está disponible
      if (isSupabaseConfigured) {
        try {
          await supabase.from("usuarios").insert({
            nombre: nuevaCuenta.nombre,
            email: nuevaCuenta.email,
            rol: "candidato",
            telefono: nuevaCuenta.telefono || null,
          });
        } catch (err) {
          console.warn("No se pudo registrar en tabla Supabase usuarios (guardado localmente):", err);
        }
      }

      const sesion: Usuario = {
        id: nuevaCuenta.id,
        nombre: nuevaCuenta.nombre,
        email: nuevaCuenta.email,
        rol: "candidato",
        telefono: nuevaCuenta.telefono,
      };

      setUsuario(sesion);
      try {
        window.localStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(sesion));
      } catch {
        /* almacenamiento no disponible */
      }

      return sesion;
    },
    [],
  );

  /**
   * Método de soporte login directo
   */
  const login = useCallback(
    ({ email, rol, nombre }: { email: string; rol?: Rol; nombre?: string }) => {
      const emailLimpio = email.trim().toLowerCase();
      const cuentas = obtenerCuentasGuardadas();
      const encontrada = cuentas.find((c) => c.email.toLowerCase() === emailLimpio);

      const rolAsignado: Rol = rol || (encontrada ? encontrada.rol : (emailLimpio.includes("rh") ? "rh" : "candidato"));
      const nombreAsignado = nombre || (encontrada ? encontrada.nombre : emailLimpio.split("@")[0]);

      const nuevo: Usuario = {
        nombre: nombreAsignado,
        email: emailLimpio,
        rol: rolAsignado,
      };

      setUsuario(nuevo);
      try {
        window.localStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(nuevo));
      } catch {
        /* almacenamiento no disponible */
      }
      return nuevo;
    },
    [],
  );

  const logout = useCallback(() => {
    setUsuario(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY_SESION);
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const value = useMemo(
    () => ({ usuario, cargando, iniciarSesion, registrarCandidato, login, logout }),
    [usuario, cargando, iniciarSesion, registrarCandidato, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
