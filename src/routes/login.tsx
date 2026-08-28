import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Briefcase, Lock, Mail, Users } from "lucide-react";
import { useAuth, type Rol } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Malinalli ATS" },
      {
        name: "description",
        content:
          "Accede al portal de vacantes de Malinalli como candidato o al panel privado de reclutamiento.",
      },
      { property: "og:title", content: "Iniciar sesión — Malinalli ATS" },
      {
        property: "og:description",
        content: "Acceso para candidatos y equipo de Reclutamiento y Selección de Malinalli.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const roles: { valor: Rol; titulo: string; detalle: string; icono: typeof Users }[] = [
  {
    valor: "candidato",
    titulo: "Candidato",
    detalle: "Explora vacantes y sigue tus postulaciones",
    icono: Briefcase,
  },
  {
    valor: "rh",
    titulo: "Reclutador / RH",
    detalle: "Kanban, candidatos, mensajes y reportes",
    icono: Users,
  },
];

function LoginPage() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>("candidato");
  const [error, setError] = useState("");

  useEffect(() => {
    if (usuario) {
      navigate({
        to: usuario.rol === "rh" ? "/admin/dashboard" : "/vacantes",
        replace: true,
      });
    }
  }, [usuario, navigate]);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      setError("Ingresa un correo válido y una contraseña de al menos 4 caracteres.");
      return;
    }
    setError("");
    const sesion = login({ email, rol });
    navigate({ to: sesion.rol === "rh" ? "/admin/dashboard" : "/vacantes", replace: true });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-primary font-display text-2xl font-bold text-primary-foreground">
            M
          </span>
          <h1 className="text-brand mt-3 text-2xl font-semibold">Malinalli</h1>
          <p className="text-[10px] tracking-[0.3em] text-muted-foreground">ELITE RECRUITMENT</p>
        </div>

        <form onSubmit={enviar} className="panel space-y-5 p-6">
          <div>
            <p className="mb-2 text-[11px] tracking-[0.18em] text-muted-foreground">
              TIPO DE ACCESO
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {roles.map((r) => {
                const Icono = r.icono;
                const activo = rol === r.valor;
                return (
                  <button
                    type="button"
                    key={r.valor}
                    onClick={() => setRol(r.valor)}
                    className={`rounded-md border p-3 text-left transition-colors ${
                      activo
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icono
                      className={`mb-1 h-4 w-4 ${activo ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span
                      className={`block text-sm font-semibold ${
                        activo ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {r.titulo}
                    </span>
                    <span className="block text-[11px] leading-snug text-muted-foreground">
                      {r.detalle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Correo corporativo</span>
            <span className="relative block">
              <Mail className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@malinalli.mx"
                className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Contraseña</span>
            <span className="relative block">
              <Lock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
              />
            </span>
          </label>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Entrar
          </button>

          <p className="text-center text-xs text-muted-foreground">
            ¿Solo quieres ver las vacantes?{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/vacantes" })}
              className="font-semibold text-primary"
            >
              Entrar como visitante
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
