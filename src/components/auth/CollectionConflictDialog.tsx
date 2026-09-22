import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  Cloud,
  Monitor,
  X,
} from "lucide-react";

import type { CollectionConflictChoice } from "@/auth/collectionSessionCoordinator";
import {
  Button,
  IconButton,
  Surface,
} from "@/components/ui";

interface CollectionConflictDialogProps {
  isOpen: boolean;
  isResolving: boolean;
  errorMessage: string | null;
  onResolve: (
    choice: CollectionConflictChoice,
  ) => void;
  onClose: () => void;
}

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function CollectionConflictDialog({
  isOpen,
  isResolving,
  errorMessage,
  onResolve,
  onClose,
}: CollectionConflictDialogProps) {
  const shouldReduceMotion = useReducedMotion();

  const dialogRef = useRef<HTMLDivElement | null>(
    null,
  );

  const headingRef =
    useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const animationFrame = requestAnimationFrame(
      () => {
        headingRef.current?.focus();
      },
    );

    return () => {
      cancelAnimationFrame(animationFrame);
      document.body.style.overflow =
        previousOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [isOpen]);

  const handleClose = () => {
    if (isResolving) {
      return;
    }

    onClose();
  };

  const handleBackdropClick = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleDialogKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
      return;
    }

    if (
      event.key !== "Tab" ||
      !dialogRef.current
    ) {
      return;
    }

    const focusableElements = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        focusableSelector,
      ),
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      headingRef.current?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement =
      focusableElements[
        focusableElements.length - 1
      ];

    if (
      event.shiftKey &&
      document.activeElement === firstElement
    ) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (
      !event.shiftKey &&
      document.activeElement === lastElement
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-8 backdrop-blur-[2px]"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: shouldReduceMotion
              ? 0.1
              : 0.18,
            ease: "easeOut",
          }}
          onMouseDown={handleBackdropClick}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-conflict-heading"
            aria-describedby="collection-conflict-description"
            className="w-full max-w-2xl"
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 10,
                    scale: 0.99,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={
              shouldReduceMotion
                ? {
                    opacity: 0,
                  }
                : {
                    opacity: 0,
                    y: 6,
                    scale: 0.99,
                  }
            }
            transition={{
              duration: shouldReduceMotion
                ? 0.1
                : 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            onKeyDown={handleDialogKeyDown}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <Surface className="relative p-6 shadow-2xl sm:p-8">
              <div className="absolute right-4 top-4">
                <IconButton
                  variant="default"
                  size="compact"
                  aria-label="Decide about legacy collection later"
                  icon={<X size={16} />}
                  onClick={handleClose}
                />
              </div>

              <div className="max-w-xl pr-12">
                <p className="metadata-label">
                  Legacy archive migration
                </p>

                <h2
                  ref={headingRef}
                  id="collection-conflict-heading"
                  tabIndex={-1}
                  className="mt-3 font-serif text-3xl leading-tight text-[var(--color-text-primary)] focus:outline-none"
                >
                  Choose the collection to preserve
                </h2>

                <p
                  id="collection-conflict-description"
                  className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]"
                >
                  Verdarium found an older collection in
                  this browser that differs from your
                  private cloud archive. Neither collection
                  has been changed.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <section className="rounded-md border border-[var(--color-border)] p-5">
                  <Monitor
                    size={20}
                    aria-hidden="true"
                    className="text-[var(--color-text-muted)]"
                  />

                  <h3 className="mt-4 font-serif text-xl leading-tight text-[var(--color-text-primary)]">
                    Migrate the browser collection
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Replace the existing cloud archive with
                    the legacy collection stored in this
                    browser. The migrated cloud collection
                    will become authoritative.
                  </p>

                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isResolving}
                    className="mt-5"
                    onClick={() =>
                      onResolve("browser")
                    }
                  >
                    Migrate browser collection
                  </Button>
                </section>

                <section className="rounded-md border border-[var(--color-border)] p-5">
                  <Cloud
                    size={20}
                    aria-hidden="true"
                    className="text-[var(--color-text-muted)]"
                  />

                  <h3 className="mt-4 font-serif text-xl leading-tight text-[var(--color-text-primary)]">
                    Keep the cloud collection
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Keep the existing private cloud archive
                    and remove the conflicting legacy
                    browser copy after confirmation.
                  </p>

                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isResolving}
                    className="mt-5"
                    onClick={() =>
                      onResolve("cloud")
                    }
                  >
                    Keep cloud collection
                  </Button>
                </section>
              </div>

              <p className="mt-6 text-xs leading-5 text-[var(--color-text-muted)]">
                This decision replaces one collection in
                full. Once migration is complete, the
                private cloud archive becomes Verdarium’s
                authoritative collection.
              </p>

              {errorMessage ? (
                <p
                  role="alert"
                  className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]"
                >
                  {errorMessage}
                </p>
              ) : null}

              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-6">
                <Button
                  type="button"
                  disabled={isResolving}
                  onClick={handleClose}
                >
                  Decide later
                </Button>

                {isResolving ? (
                  <p
                    role="status"
                    className="text-sm text-[var(--color-text-secondary)]"
                  >
                    Preserving the selected collection…
                  </p>
                ) : null}
              </div>
            </Surface>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}