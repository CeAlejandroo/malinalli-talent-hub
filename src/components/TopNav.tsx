import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogIn, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const enlacesRh = [
  { to: "/admin/dashboard", label: "Tablero Kanban" },
  { to: "/admin/candidatos", label: "Candidatos" },
  { to: "/admin/mensajes", label: "Mensajes" },
  { to: "/admin/reportes", label: "Reportes" },
] as const;

const enlacesCandidato = [
  { to: "/vacantes", label: "Vacantes" },
  { to: "/mis-postulaciones", label: "Mis postulaciones" },
] as const;

export function TopNav() {
  const [open, setOpen] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const esRh = usuario?.rol === "rh";
  const enlaces = esRh ? enlacesRh : usuario ? enlacesCandidato : [];

  const salir = () => {
    logout();
    setOpen(false);
    navigate({ to: "/login", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:flex sm:justify-between">
        <Link to={esRh ? "/admin/dashboard" : "/vacantes"} className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary font-display text-lg font-bold text-primary-foreground">
            M
          </span>
          <span className="min-w-0">
            <span className="text-brand block truncate text-lg leading-none font-semibold">
              Malinalli
            </span>
            <span className="block text-[10px] tracking-[0.2em] text-muted-foreground">
              ELITE RECRUITMENT
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {enlaces.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-accent" }}
              className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}

          {esRh && (
            <button
              aria-label="Notificaciones"
              className="ml-2 grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-primary"
            >
              <Bell className="h-4 w-4" />
            </button>
          )}

          {usuario ? (
            <button
              onClick={salir}
              className="ml-2 flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <LogOut className="h-4 w-4" /> Salir
            </button>
          ) : (
            <Link
              to="/login"
              className="ml-2 flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground"
            >
              <LogIn className="h-4 w-4" /> Iniciar sesión
            </Link>
          )}
        </nav>

        <button
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <nav className="border-t border-border px-4 pb-3 md:hidden">
          {enlaces.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeProps={{ className: "text-primary" }}
              className="block py-2 text-sm font-medium text-muted-foreground"
            >
              {l.label}
            </Link>
          ))}
          {usuario ? (
            <button
              onClick={salir}
              className="block py-2 text-sm font-medium text-muted-foreground"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-bold text-primary"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
