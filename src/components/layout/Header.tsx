import { ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  children?: ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session && window.location.pathname !== '/auth') {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You've been logged out of StudySphere.",
      });
      navigate('/auth');
    }
  };

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
        
        {user ? (
          <Button variant="ghost" size="sm" className="h-9 w-9" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-9 w-9" onClick={() => navigate('/auth')}>
            <User className="h-4 w-4" />
            <span className="sr-only">Sign in</span>
          </Button>
        )}
      </div>
    </header>
  );
};