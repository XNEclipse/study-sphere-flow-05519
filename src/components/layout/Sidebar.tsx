import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  BookOpen, 
  Settings, 
  Timer, 
  Calendar,
  BarChart3,
  Layers3,
  Wrench,
  GraduationCap
} from "lucide-react";

const navigation = [
  { name: "Dashboard", to: "/", icon: Home },
  { name: "Study Library", to: "/library", icon: BookOpen },
  { name: "Session Builder", to: "/builder", icon: Layers3 },
  { name: "Tools", to: "/tools", icon: Wrench },
  { name: "Scheduler", to: "/scheduler", icon: Calendar },
  { name: "Progress", to: "/progress", icon: BarChart3 },
  { name: "Settings", to: "/settings", icon: Settings },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar = ({ onItemClick }: SidebarProps) => {
  return (
    <div className="flex h-full flex-col bg-card border-r border-border shadow-soft">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-focus">
          <GraduationCap className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            StudySphere
          </h1>
          <p className="text-xs text-muted-foreground">Every method. One place.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            end={item.to === "/"}
            onClick={onItemClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-gradient-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-border">
        <div className="rounded-lg bg-gradient-focus p-4 text-center">
          <p className="text-sm font-medium text-white mb-2">
            Ready to unlock advanced features?
          </p>
          <p className="text-xs text-white/80 mb-3">
            Connect to Supabase for session tracking, progress analytics, and more!
          </p>
          <button className="text-xs text-white/90 hover:text-white underline">
            Connect Backend →
          </button>
        </div>
      </div>
    </div>
  );
};