import { Outlet, createFileRoute } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";

export const Route = createFileRoute("/rh")({
  component: RhLayout,
});

function RhLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Outlet />
    </div>
  );
}
