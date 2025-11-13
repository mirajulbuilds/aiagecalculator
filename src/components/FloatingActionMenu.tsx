import { useState } from "react";
import { Plus, Calculator, Users, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useRipple } from "@/hooks/useRipple";

interface ActionButton {
  icon: React.ReactNode;
  label: string;
  path: string;
  color: string;
}

export const FloatingActionMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const createRipple = useRipple();

  const actions: ActionButton[] = [
    {
      icon: <Calculator className="w-5 h-5" />,
      label: "Age Calculator",
      path: "/",
      color: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Compare Ages",
      path: "/compare",
      color: "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700",
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: "Search Celebrities",
      path: "/search",
      color: "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700",
    },
  ];

  const handleActionClick = (path: string, event: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(event);
    navigate(path);
    setIsExpanded(false);
  };

  const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(event);
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-8 left-8 z-[997] flex flex-col-reverse items-start gap-3">
      {/* Action Buttons */}
      <div
        className={`flex flex-col-reverse gap-3 transition-all duration-300 ease-out ${
          isExpanded
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {actions.map((action, index) => (
          <div
            key={action.path}
            className="flex items-center gap-3 animate-fade-in"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "backwards",
            }}
          >
            {/* Label */}
            <span className="bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-border/50 whitespace-nowrap">
              {action.label}
            </span>
            {/* Button */}
            <Button
              onClick={(e) => handleActionClick(action.path, e)}
              className={`relative overflow-hidden w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${action.color}`}
              size="icon"
              aria-label={action.label}
            >
              {action.icon}
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB Button */}
      <Button
        onClick={toggleMenu}
        className={`relative overflow-hidden w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-500 ease-out bg-primary hover:bg-primary/90 ${
          isExpanded ? "rotate-45 scale-110" : "rotate-0 scale-100"
        }`}
        size="icon"
        aria-label={isExpanded ? "Close menu" : "Open quick actions menu"}
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
};
