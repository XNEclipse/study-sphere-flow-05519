import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
  children?: ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-4 lg:px-8">
      {/* Left side - mobile menu button */}
      <div className="flex items-center gap-4">
        {children}
      </div>

      {/* Right side - theme toggle and user menu */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="h-9 w-9">
          <User className="h-4 w-4" />
          <span className="sr-only">User menu</span>
        </Button>
      </div>
    </header>
  );
};