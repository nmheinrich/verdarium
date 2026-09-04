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
    <fieldset>
      <legend className="metadata-label">
        Archive theme
      </legend>

      <div className="mt-4 grid gap-3">
        {THEMES.map((theme) => {
          const isSelected = value === theme.id;

          return (
            <label
              key={theme.id}
              className="group cursor-pointer"
            >
              <input
                type="radio"
                name="verdarium-theme"
                value={theme.id}
                checked={isSelected}
                onChange={() => onChange(theme.id)}
                className="visually-hidden"
              />

              <div
                className={`flex items-start justify-between gap-4 rounded-[var(--radius-md)] border p-4 transition-colors duration-[var(--transition-base)] group-focus-within:ring-2 group-focus-within:ring-[var(--color-focus)] group-focus-within:ring-offset-2 ${
                  isSelected
                    ? "border-[var(--color-botanical-muted)] bg-[var(--color-botanical-soft)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] group-hover:border-[var(--color-border-strong)]"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-serif text-lg leading-tight text-[var(--color-text-primary)]">
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
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}