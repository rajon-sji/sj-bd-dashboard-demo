import { Outlet, NavLink } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-sji.png";

const demoNavigation = [
  {
    name: "BD Triage Copilot",
    href: "/bd/triage",
    icon: Sparkles,
  },
];

export default function DemoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card/95 backdrop-blur-sm transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-auto items-center justify-center border-b border-border px-6 py-4">
            <img src={logo} alt="SJ Innovation" className="h-20 w-auto" />
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
            {demoNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth ${
                    isActive
                      ? "bg-gradient-primary text-white shadow-md"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-border px-4 py-4">
            <p className="text-xs text-muted-foreground">
              Demo build · BD Triage Copilot
            </p>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium">SJ BD Dashboard</span>
          {sidebarOpen && (
            <button
              type="button"
              className="ml-auto rounded-md p-2"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <main className="relative min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
