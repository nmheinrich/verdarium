import { Check } from "lucide-react";

import { BOTANICAL_ILLUSTRATIONS } from "@/constants/illustrations";
import { cn } from "@/lib";

interface IllustrationPickerProps {
  value: string;
  onChange: (illustrationKey: string) => void;
}

/** A required choice of watercolor plate, shown as radio cards. */
export function IllustrationPicker({
  value,
  onChange,
}: IllustrationPickerProps) {
  return (
    <fieldset>
      <legend className="visually-hidden">Specimen plate</legend>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3">
        {BOTANICAL_ILLUSTRATIONS.map((illustration) => {
          const isSelected = illustration.key === value;

          return (
            <label
              key={illustration.key}
              className={cn(
                "group relative flex cursor-pointer flex-col overflow-hidden rounded-[var(--radius-md)] border bg-[var(--color-surface-elevated)]",
                "transition-[border-color,box-shadow] duration-[160ms] ease-[var(--ease-standard)]",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-focus)]",
                isSelected
                  ? "border-[var(--color-botanical)] shadow-[0_0_0_1px_var(--color-botanical)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-botanical-muted)]",
              )}
            >
              <input
                type="radio"
                name="illustrationKey"
                value={illustration.key}
                checked={isSelected}
                onChange={() => onChange(illustration.key)}
                className="visually-hidden"
              />

              <span className="relative block aspect-square">
                <img
                  src={illustration.src}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 size-full object-contain p-2.5"
                />
              </span>

              <span
                className={cn(
                  "mt-auto flex items-center justify-between gap-2 border-t px-2.5 py-2 text-xs",
                  isSelected
                    ? "border-[var(--color-botanical-soft)] bg-[var(--color-botanical-soft)] font-medium text-[var(--color-botanical)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)]",
                )}
              >
                {illustration.label}
                {isSelected ? (
                  <Check
                    aria-hidden="true"
                    size={14}
                    strokeWidth={2}
                  />
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
