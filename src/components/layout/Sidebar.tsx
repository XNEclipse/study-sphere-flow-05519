import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  BookOpen, 
  Layers3,
  Wrench
} from "lucide-react";
import logoImage from "@/assets/studysphere-logo.png";

const navigation = [
  { name: "Dashboard", to: "/", icon: Home },
  { name: "Study Library", to: "/library", icon: BookOpen },
  { name: "Session Builder", to: "/builder", icon: Layers3 },
  { name: "Tools", to: "/tools", icon: Wrench },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar = ({ onItemClick }: SidebarProps) => {
  return (
    <div className="flex h-full flex-col bg-card border-r border-border shadow-soft">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
          <img src={logoImage} alt="StudySphere Logo" className="w-full h-full object-cover" />
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
    </div>
  );
};