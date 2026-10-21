import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  ChartNoAxesCombined,
  NotebookPen,
  Settings,
  MoreHorizontal,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { Brand } from "./Ui";
import type { Route } from "../lib/types";
const links = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "training", label: "Training", icon: Dumbbell },
  { id: "nutrition", label: "Nutrition", icon: Utensils },
  { id: "progress", label: "Progress", icon: ChartNoAxesCombined },
  { id: "plan", label: "Plan", icon: NotebookPen },
  { id: "settings", label: "Settings", icon: Settings },
] as const;
export function AppShell({
  route,
  onNavigate,
  onSignOut,
  children,
  preview = false,
}: {
  route: Route;
  onNavigate: (route: Route) => void;
  onSignOut: () => void;
  children: ReactNode;
  preview?: boolean;
}) {
  const [more, setMore] = useState(false);
  function navigate(id: Route) {
    onNavigate(id);
    setMore(false);
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand-link"
          href="#/overview"
          aria-label="akshath.fit overview"
        >
          <Brand />
        </a>
        <div className="workspace-label">YOUR PERSONAL SPACE</div>
        <nav aria-label="Main navigation">
          {links.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${route === id ? "active" : ""}`}
              onClick={() => navigate(id)}
              aria-current={route === id ? "page" : undefined}
            >
              <Icon size={20} />
              {label}
              {route === id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="private-note">
            <span className="status-dot" />
            Just you. Your progress.
          </div>
          <button className="nav-item" onClick={onSignOut}>
            <LogOut size={18} />
            Sign out
            <ArrowUpRight size={15} />
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="mobile-header">
          <Brand />
          <span className="avatar">A</span>
        </header>
        {preview && (
          <div className="preview-banner">
            Design preview · sample data · changes reset on reload
          </div>
        )}
        <main id="main-content">{children}</main>
        <footer className="app-footer">
          <span>Built around you.</span>
          <span>
            akshath.fit <span className="footer-dot">●</span> Private workspace
          </span>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {links.slice(0, 4).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={route === id ? "active" : ""}
            aria-current={route === id ? "page" : undefined}
            onClick={() => navigate(id)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
        <button
          aria-expanded={more}
          className={
            more || ["plan", "settings"].includes(route) ? "active" : ""
          }
          onClick={() => setMore(!more)}
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>
      {more && (
        <div className="more-menu">
          <button onClick={() => navigate("plan")}>
            <NotebookPen size={19} />
            Plan
          </button>
          <button onClick={() => navigate("settings")}>
            <Settings size={19} />
            Settings
          </button>
          <button onClick={onSignOut}>
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
