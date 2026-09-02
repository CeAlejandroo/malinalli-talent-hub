import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Mail, User, Phone, CheckCircle2, ArrowRight, ShieldCheck, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acceso y Registro — Malinalli ATS" },
      {
        name: "description",
        content:
          "Inicia sesión o regístrate en el portal de talento y reclutamiento de Malinalli.",
      },
      { property: "og:title", content: "Acceso y Registro — Malinalli ATS" },
      {
        property: "og:description",
        content: "Portal de candidatos y panel administrativo de Recursos Humanos de Malinalli.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { usuario, iniciarSesion, registrarCandidato } = useAuth();
  const navigate = useNavigate();

  const [modo, setModo] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [exitoRegistro, setExitoRegistro] = useState(false);

  useEffect(() => {
    if (usuario) {
      navigate({
        to: usuario.rol === "rh" ? "/admin/dashboard" : "/vacantes",
        replace: true,
      });
    }
  }, [usuario, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    setError("");
    setProcesando(true);

    try {
      const sesion = await iniciarSesion({ email, password });
      navigate({
        to: sesion.rol === "rh" ? "/admin/dashboard" : "/vacantes",
        replace: true,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setProcesando(false);
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setError("Por favor completa los campos obligatorios.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas ingresadas no coinciden.");
      return;
    }

    setError("");
    setProcesando(true);

    try {
      const nuevo = await registrarCandidato({
        nombre: nombre.trim(),
        email: email.trim(),
        password: password.trim(),
        telefono: telefono.trim(),
      });

      setExitoRegistro(true);
      setTimeout(() => {
        navigate({
          to: nuevo.rol === "rh" ? "/admin/dashboard" : "/vacantes",
          replace: true,
        });
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar la cuenta.");
    } finally {
      setProcesando(false);
    }
  };

  const llenarCredencialDemo = (correoDemo: string) => {
    setModo("login");
    setEmail(correoDemo);
    setPassword("password123");
    setError("");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-primary font-display text-2xl font-bold text-primary-foreground shadow-lg">
            M
          </span>
          <h1 className="text-brand mt-3 text-2xl font-semibold">Malinalli</h1>
          <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            ELITE RECRUITMENT & TALENT HUB
          </p>
        </div>

        {/* Selector de pestañas: Iniciar sesión / Registrarse */}
        <div className="mb-4 grid grid-cols-2 rounded-xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => {
              setModo("login");
              setError("");
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${modo === "login"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setModo("registro");
              setError("");
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${modo === "registro"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <UserPlus className="h-3.5 w-3.5" /> Registrarse
          </button>
        </div>

        <div className="panel space-y-5 p-6">
          {exitoRegistro ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary animate-bounce" />
              <h2 className="mt-3 text-base font-bold text-primary">¡Cuenta creada con éxito!</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Iniciando sesión como candidato y redirigiendo al portal de vacantes...
              </p>
            </div>
          ) : modo === "login" ? (
            /* FORMULARIO DE INICIO DE SESIÓN */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Acceso al Sistema</h2>
                <p className="text-xs text-muted-foreground">
                  Ingresa tus credenciales para acceder según el rol asignado a tu cuenta.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Correo electrónico
                </span>
                <span className="relative block">
                  <Mail className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ej. usuario@malinalli.mx o tu correo"
                    required
                    className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Contraseña
                </span>
                <span className="relative block">
                  <Lock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
                  />
                </span>
              </label>

              <button
                type="submit"
                disabled={procesando}
                className="w-full rounded-md bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {procesando ? "Verificando cuenta..." : "Iniciar sesión"}
              </button>

              <div className="pt-2 border-t border-border/60 text-center">
                <p className="text-xs text-muted-foreground">
                  ¿Eres nuevo candidato y no tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setModo("registro");
                      setError("");
                    }}
                    className="font-bold text-primary hover:underline"
                  >
                    Crear cuenta aquí
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* FORMULARIO DE REGISTRO PARA CANDIDATOS */
            <form onSubmit={handleRegistro} className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-primary">
                  <UserPlus className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    REGISTRO DE CANDIDATOS
                  </span>
                </div>
                <h2 className="text-base font-bold text-foreground">Crea tu cuenta de Talento</h2>
                <p className="text-xs text-muted-foreground">
                  Regístrate para postularte a vacantes exclusivas y dar seguimiento a tu proceso.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Nombre completo *
                </span>
                <span className="relative block">
                  <User className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="ej. Juan Pérez Martínez"
                    required
                    className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Correo electrónico *
                </span>
                <span className="relative block">
                  <Mail className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@ejemplo.com"
                    required
                    className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Teléfono / WhatsApp (opcional)
                </span>
                <span className="relative block">
                  <Phone className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
                  />
                </span>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    Contraseña *
                  </span>
                  <span className="relative block">
                    <Lock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mín. 6 caracteres"
                      required
                      className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    Confirmar contraseña *
                  </span>
                  <span className="relative block">
                    <Lock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      required
                      className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
                    />
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={procesando}
                className="w-full rounded-md bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {procesando ? "Creando cuenta..." : "Crear mi cuenta de Candidato"}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                ¿Ya tienes una cuenta registrada?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setModo("login");
                    setError("");
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </form>
          )}
          <p className="text-center text-xs text-muted-foreground">
            ¿Solo deseas explorar las vacantes?{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/vacantes" })}
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Entrar como visitante <ArrowRight className="h-3 w-3" />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
