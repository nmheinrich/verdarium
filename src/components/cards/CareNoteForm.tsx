import { useState, type FormEvent, type Ref } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/lib";

export const CARE_NOTE_MAX_LENGTH = 140;

interface CareNoteFormProps {
  id: string;
  initialNote?: string;
  onSave: (note: string) => void;
  /** Closes without saving (Cancel or Esc). */
  onCancel: () => void;
  ref?: Ref<HTMLFormElement>;
  className?: string;
}

/**
 * The minimal care note window (spec 001): one short line, Save or Cancel.
 */
export function CareNoteForm({
  id,
  initialNote = "",
  onSave,
  onCancel,
  ref,
  className,
}: CareNoteFormProps) {
  const [draft, setDraft] = useState(initialNote);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const note = draft.trim();

    if (note) {
      onSave(note.slice(0, CARE_NOTE_MAX_LENGTH));
    }
  };

  return (
    <form
      ref={ref}
      id={id}
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onCancel();
        }
      }}
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3.5 shadow-[var(--shadow-elevated)]",
        className,
      )}
    >
      <label
        htmlFor={`${id}-input`}
        className="metadata-label text-[var(--color-text-secondary)]"
      >
        Care note
      </label>
      <input
        id={`${id}-input`}
        autoFocus
        maxLength={CARE_NOTE_MAX_LENGTH}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Repotted, pest check…"
        aria-describedby={`${id}-count`}
        className="mt-2 h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-3.5 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-control)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-botanical)] focus:shadow-[0_0_0_3px_var(--color-botanical-soft)]"
      />
      <p
        id={`${id}-count`}
        className="mt-2 text-xs text-[var(--color-text-secondary)]"
      >
        {draft.length}/{CARE_NOTE_MAX_LENGTH}
      </p>
      <div className="mt-2.5 flex justify-end gap-1.5">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="tonal"
          size="sm"
          type="submit"
          disabled={!draft.trim()}
        >
          Save note
        </Button>
      </div>
    </form>
  );
}
