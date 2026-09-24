import { Check } from "lucide-react";

import { THEMES } from "@/constants";

import type { ThemeId } from "@/types";

interface ThemeSelectorProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemeSelector({
  value,
  onChange,
}: ThemeSelectorProps) {
  return (
    <section aria-labelledby="archive-theme-heading">
      <h3
        id="archive-theme-heading"
        className="metadata-label"
      >
        Archive theme
      </h3>

      <div className="mt-4 grid gap-3">
        {THEMES.map((theme) => {
          const isSelected = value === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(theme.id)}
              className={`group flex w-full items-start justify-between gap-4 rounded-[var(--radius-md)] border p-4 text-left transition-colors duration-[var(--transition-base)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] ${
                isSelected
                  ? "border-[var(--color-botanical-muted)] bg-[var(--color-botanical-soft)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]"
              }`}
            >
              <div className="min-w-0">
                <p className="font-display type-subtitle text-[var(--color-text-primary)]">
                  {theme.name}
                </p>

                <p className="mt-1.5 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {theme.description}
                </p>
              </div>

              <div
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-[var(--color-botanical)] bg-[var(--color-botanical)] text-[var(--color-text-on-botanical)]"
                    : "border-[var(--color-border-strong)]"
                }`}
              >
                {isSelected ? (
                  <Check
                    size={12}
                    strokeWidth={2}
                  />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}