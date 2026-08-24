import { cn } from "@/lib";

interface NavItem {
  label: string;
  value: string;
}

interface AppNavProps {
  items: NavItem[];
  activeItem?: string;
  onNavigate?: (value: string) => void;
  className?: string;
}

export function AppNav({
  items,
  activeItem,
  onNavigate,
  className,
}: AppNavProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "flex gap-6 overflow-x-auto border-t border-[var(--color-border)]",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.value === activeItem;

        return (
          <button
            key={item.value}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onNavigate?.(item.value)}
            className={cn(
              "relative shrink-0 py-3 text-sm transition-colors duration-[var(--transition-base)] ease-[var(--ease-standard)]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
              isActive
                ? "font-medium text-[var(--color-text-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
            )}
          >
            {item.label}

            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px bg-[var(--color-botanical)]"
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}