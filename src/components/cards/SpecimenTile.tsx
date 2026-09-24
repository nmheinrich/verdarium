import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  Check,
  Ellipsis,
  Heart,
  Leaf,
  PencilLine,
  Undo2,
} from "lucide-react";

import { Badge, Button, IconButton } from "@/components/ui";
import { cn } from "@/lib";
import type { CareStateLabel } from "@/lib";

const NOTE_MAX_LENGTH = 140;

export interface SpecimenTileRecordedState {
  label: string;
  /** A note already attached to this record, used to prefill the popover. */
  note?: string;
  onUndo?: () => void;
  onSaveNote?: (note: string) => void;
  /** Called when the note popover opens or closes, so a pending commit can wait. */
  onNoteOpenChange?: (open: boolean) => void;
}

export interface SpecimenTileCareMessage {
  tone: "status" | "error";
  text: string;
}

interface SpecimenTileProps {
  commonName: string;
  scientificName?: string;
  cultivar?: string;
  illustration?: string;
  label?: string;
  health?: string;
  favorite?: boolean;
  careState?: CareStateLabel | null;
  recorded?: SpecimenTileRecordedState;
  onOpen?: () => void;
  /** DOM id for the open button, so the app can return focus to this tile. */
  openButtonId?: string;
  onRecordCare?: () => void;
  /** Disables care actions while a care change is being saved. */
  careBusy?: boolean;
  careMessage?: SpecimenTileCareMessage | null;
  /** Renders the care options popover; `close` returns focus to the toggle. */
  renderCareOptions?: (close: () => void) => ReactNode;
  density?: "default" | "compact";
  className?: string;
}

/**
 * The collection's museum-label tile (design system: SpecimenTile).
 * Only the name opens the specimen; its hit area stretches over the tile
 * while the care row sits above it, so care actions never open the record.
 */
export function SpecimenTile({
  commonName,
  scientificName,
  cultivar,
  illustration,
  label,
  health,
  favorite = false,
  careState,
  recorded,
  onOpen,
  openButtonId,
  onRecordCare,
  careBusy = false,
  careMessage,
  renderCareOptions,
  density = "default",
  className,
}: SpecimenTileProps) {
  const nameId = useId();
  const noteId = useId();
  const optionsId = useId();
  const noteButtonRef = useRef<HTMLButtonElement>(null);
  const notePopoverRef = useRef<HTMLFormElement>(null);
  const optionsToggleRef = useRef<HTMLSpanElement>(null);
  const optionsPopoverRef = useRef<HTMLDivElement>(null);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const onNoteOpenChange = recorded?.onNoteOpenChange;

  const isCareDue =
    careState?.status === "due" ||
    careState?.status === "overdue";

  const openNote = () => {
    setNoteDraft(recorded?.note ?? "");
    setIsOptionsOpen(false);
    setIsNoteOpen(true);
    onNoteOpenChange?.(true);
  };

  const closeNote = () => {
    setIsNoteOpen(false);
    setNoteDraft("");
    onNoteOpenChange?.(false);
    window.setTimeout(() => noteButtonRef.current?.focus(), 0);
  };

  // Looked up by id rather than a ref, because this is handed to
  // renderCareOptions during render.
  const closeOptions = () => {
    setIsOptionsOpen(false);
    window.setTimeout(
      () => document.getElementById(`${optionsId}-toggle`)?.focus(),
      0,
    );
  };

  const isNoteVisible = isNoteOpen && Boolean(recorded?.onSaveNote);
  const isOptionsVisible =
    isOptionsOpen && Boolean(renderCareOptions) && !recorded;

  // Esc is handled on the popovers; a pointer press outside closes them
  // without saving.
  useEffect(() => {
    if (!isNoteVisible && !isOptionsVisible) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        isNoteVisible &&
        !notePopoverRef.current?.contains(target) &&
        !noteButtonRef.current?.contains(target)
      ) {
        setIsNoteOpen(false);
        setNoteDraft("");
        onNoteOpenChange?.(false);
      }

      if (
        isOptionsVisible &&
        !optionsPopoverRef.current?.contains(target) &&
        !optionsToggleRef.current?.contains(target)
      ) {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isNoteVisible, isOptionsVisible, onNoteOpenChange]);

  // Move focus into the options popover when it opens.
  useEffect(() => {
    if (isOptionsVisible) {
      optionsPopoverRef.current
        ?.querySelector<HTMLElement>("button:not([disabled]), input")
        ?.focus();
    }
  }, [isOptionsVisible]);

  const saveNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const note = noteDraft.trim();

    if (note && recorded?.onSaveNote) {
      recorded.onSaveNote(note.slice(0, NOTE_MAX_LENGTH));
    }

    closeNote();
  };

  const showCareRow =
    Boolean(recorded) ||
    Boolean(renderCareOptions) ||
    (isCareDue && Boolean(onRecordCare));

  return (
    <article
      aria-labelledby={nameId}
      className={cn(
        "group relative flex min-w-0 flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-subtle)]",
        "transition-[border-color] duration-[160ms] ease-[var(--ease-standard)]",
        onOpen && "hover:border-[var(--color-botanical-muted)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative grid place-items-center overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]",
          density === "compact" ? "aspect-[16/9]" : "aspect-[4/3]",
        )}
      >
        {illustration ? (
          <img
            src={illustration}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-contain p-4"
          />
        ) : (
          <Leaf
            aria-hidden="true"
            size={28}
            strokeWidth={1.75}
            className="text-[var(--color-text-muted)]"
          />
        )}

        {favorite ? (
          <span
            role="img"
            aria-label="Favorite specimen"
            className="absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-botanical)]"
          >
            <Heart aria-hidden="true" size={14} strokeWidth={1.75} />
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col",
          density === "compact" ? "px-4 pb-3.5 pt-4" : "px-5 pb-4 pt-5",
        )}
      >
        {label ? (
          <p className="metadata-label mb-1.5">{label}</p>
        ) : null}

        <h3
          id={nameId}
          className="font-display type-subtitle break-words text-[var(--color-text-primary)]"
        >
          {onOpen ? (
            <button
              id={openButtonId}
              type="button"
              onClick={onOpen}
              className="text-left after:absolute after:inset-0 after:rounded-[var(--radius-lg)] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--color-focus)]"
            >
              {commonName}
            </button>
          ) : (
            commonName
          )}
        </h3>

        {scientificName ? (
          <p className="scientific-name mb-4 mt-1 text-[0.9375rem] leading-[1.35] text-[var(--color-text-secondary)]">
            {scientificName}
            {cultivar ? (
              <span className="not-italic">{` ‘${cultivar}’`}</span>
            ) : null}
          </p>
        ) : null}

        <div
          className={cn(
            "mt-auto flex flex-wrap gap-1.5 border-t border-[var(--color-border)] pt-3.5",
            !scientificName && "mt-4",
          )}
        >
          {health ? <Badge variant="neutral">{health}</Badge> : null}
          {careState && !recorded ? (
            <Badge variant={careState.status}>{careState.label}</Badge>
          ) : null}
        </div>

        {showCareRow ? (
          <div className="relative z-[1] mt-3 flex flex-wrap items-center justify-between gap-2">
            {recorded ? (
              <>
                <span
                  role="status"
                  className="inline-flex items-center gap-1.5 text-[0.8125rem] leading-5 text-[var(--color-text-secondary)]"
                >
                  <Check
                    aria-hidden="true"
                    size={14}
                    strokeWidth={1.75}
                    className="text-[var(--color-botanical)]"
                  />
                  {recorded.label}
                </span>

                <span className="ml-auto inline-flex gap-0.5">
                  {recorded.onSaveNote ? (
                    <Button
                      ref={noteButtonRef}
                      variant="ghost"
                      size="sm"
                      leadingIcon={<PencilLine strokeWidth={1.75} />}
                      aria-expanded={isNoteVisible}
                      aria-controls={noteId}
                      onClick={() => (isNoteVisible ? closeNote() : openNote())}
                    >
                      {recorded.note ? "Edit note" : "Add note"}
                    </Button>
                  ) : null}
                  {recorded.onUndo ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      leadingIcon={<Undo2 strokeWidth={1.75} />}
                      onClick={recorded.onUndo}
                    >
                      Undo
                    </Button>
                  ) : null}
                </span>
              </>
            ) : (
              <>
                {isCareDue && onRecordCare ? (
                  <Button
                    variant="tonal"
                    size="sm"
                    leadingIcon={<Leaf strokeWidth={1.75} />}
                    disabled={careBusy}
                    onClick={() => {
                      setIsNoteOpen(false);
                      setIsOptionsOpen(false);
                      onRecordCare();
                    }}
                  >
                    Record care
                  </Button>
                ) : (
                  <span className="flex-1" />
                )}
                {renderCareOptions ? (
                  <span ref={optionsToggleRef} className="inline-flex">
                    <IconButton
                      id={`${optionsId}-toggle`}
                      size="sm"
                      aria-label={`More care options for ${commonName}`}
                      aria-haspopup="dialog"
                      aria-expanded={isOptionsVisible}
                      aria-controls={optionsId}
                      disabled={careBusy}
                      icon={<Ellipsis strokeWidth={1.75} />}
                      onClick={() =>
                        isOptionsVisible
                          ? closeOptions()
                          : setIsOptionsOpen(true)
                      }
                    />
                  </span>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {careMessage ? (
          <p
            role={careMessage.tone === "error" ? "alert" : "status"}
            className={cn(
              "relative z-[1] mt-2.5 text-[0.8125rem] leading-5",
              careMessage.tone === "error"
                ? "text-[var(--color-reminder-overdue-ink)]"
                : "text-[var(--color-text-secondary)]",
            )}
          >
            {careMessage.text}
          </p>
        ) : null}

        {isOptionsVisible && renderCareOptions ? (
          <div
            ref={optionsPopoverRef}
            id={optionsId}
            role="dialog"
            aria-label={`Care options for ${commonName}`}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                closeOptions();
              }
            }}
            className="absolute inset-x-3 bottom-3 z-[2] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3.5 shadow-[var(--shadow-elevated)]"
          >
            {renderCareOptions(closeOptions)}
          </div>
        ) : null}

        {isNoteVisible ? (
          <form
            ref={notePopoverRef}
            id={noteId}
            onSubmit={saveNote}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                closeNote();
              }
            }}
            className="absolute inset-x-3 bottom-3 z-[2] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3.5 shadow-[var(--shadow-elevated)]"
          >
            <label
              htmlFor={`${noteId}-input`}
              className="metadata-label text-[var(--color-text-secondary)]"
            >
              Care note
            </label>
            <input
              id={`${noteId}-input`}
              autoFocus
              maxLength={NOTE_MAX_LENGTH}
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="Repotted, pest check…"
              aria-describedby={`${noteId}-count`}
              className="mt-2 h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-3.5 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-control)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-botanical)] focus:shadow-[0_0_0_3px_var(--color-botanical-soft)]"
            />
            <p
              id={`${noteId}-count`}
              className="mt-2 text-xs text-[var(--color-text-secondary)]"
            >
              {noteDraft.length}/{NOTE_MAX_LENGTH}
            </p>
            <div className="mt-2.5 flex justify-end gap-1.5">
              <Button variant="ghost" size="sm" onClick={closeNote}>
                Cancel
              </Button>
              <Button
                variant="tonal"
                size="sm"
                type="submit"
                disabled={!noteDraft.trim()}
              >
                Save note
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </article>
  );
}
