import { cn } from "@/lib";

interface NavItem {
  label: string;
  value: string;
  /** A due count shown on the item; hidden when zero. */
  count?: number;
  countLabel?: string;
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
    <nav aria-label="Primary navigation" className={className}>
      <ul className="flex gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const isActive = item.value === activeItem;

          return (
            <li key={item.value}>
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onNavigate?.(item.value)}
                className={cn(
                  "relative inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap text-sm",
                  "transition-colors duration-[160ms] ease-[var(--ease-standard)]",
                  "focus-visible:rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                  isActive
                    ? "font-medium text-[var(--color-text-primary)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-t-[2px] after:bg-[var(--color-botanical)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                {item.label}
                {item.count ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-reminder-due)] px-1.5 text-[0.6875rem] font-semibold text-[var(--color-text-primary)]">
                    <span className="visually-hidden">, </span>
                    {item.count}
                    <span className="visually-hidden">
                      {` ${item.countLabel ?? "due"}`}
                    </span>
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
