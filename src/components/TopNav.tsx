import { Link } from "@tanstack/react-router";
import { Bell, Menu } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Portal de vacantes" },
  { to: "/rh", label: "Panel RH" },
  { to: "/rh/candidatos", label: "Candidatos" },
  { to: "/rh/reportes", label: "Reportes" },
] as const;

export function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:flex sm:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary font-display text-lg font-bold text-primary-foreground">
            M
          </span>
          <span className="min-w-0">
            <span className="block truncate text-brand text-lg leading-none font-semibold">
              Malinalli
            </span>
            <span className="block text-[10px] tracking-[0.2em] text-muted-foreground">
              ELITE RECRUITMENT
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" || l.to === "/rh" }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-accent" }}
              className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <button
            aria-label="Notificaciones"
            className="ml-2 grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-primary"
          >
            <Bell className="h-4 w-4" />
          </button>
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
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: l.to === "/" || l.to === "/rh" }}
              activeProps={{ className: "text-primary" }}
              className="block py-2 text-sm font-medium text-muted-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
