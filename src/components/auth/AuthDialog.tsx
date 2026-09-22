import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { X } from "lucide-react";

import { useAuth } from "@/auth/useAuth";
import {
  Button,
  IconButton,
  Surface,
} from "@/components/ui";

type AuthMode = "signIn" | "signUp";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function AuthDialog({
  isOpen,
  onClose,
}: AuthDialogProps) {
  const shouldReduceMotion = useReducedMotion();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] =
    useState<AuthMode>("signIn");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [
    confirmationEmail,
    setConfirmationEmail,
  ] = useState<string | null>(null);

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

  const resetDialogState = () => {
    setMode("signIn");
    setEmail("");
    setPassword("");
    setIsSubmitting(false);
    setErrorMessage(null);
    setConfirmationEmail(null);
  };

  const closeDialog = () => {
    resetDialogState();
    onClose();
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    closeDialog();
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

  const handleModeChange = (
    nextMode: AuthMode,
  ) => {
    if (isSubmitting) {
      return;
    }

    setMode(nextMode);
    setPassword("");
    setErrorMessage(null);
    setConfirmationEmail(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const credentials = {
      email,
      password,
    };

    if (mode === "signIn") {
      const result = await signIn(credentials);

      if (!result.success) {
        setIsSubmitting(false);
        setErrorMessage(result.error.message);
        return;
      }

      closeDialog();
      return;
    }

    const result = await signUp(credentials);

    if (!result.success) {
      setIsSubmitting(false);
      setErrorMessage(result.error.message);
      return;
    }

    if (
      result.data.status ===
      "confirmationRequired"
    ) {
      setPassword("");
      setIsSubmitting(false);
      setConfirmationEmail(result.data.email);
      return;
    }

    closeDialog();
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
            aria-labelledby="auth-dialog-heading"
            aria-describedby="auth-dialog-description"
            className="w-full max-w-lg"
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
                  aria-label="Close account dialog"
                  icon={<X size={16} />}
                  onClick={handleClose}
                />
              </div>

              <div className="pr-12">
                <p className="metadata-label">
                  Private archive
                </p>

                <h2
                  ref={headingRef}
                  id="auth-dialog-heading"
                  tabIndex={-1}
                  className="mt-3 font-serif text-3xl leading-tight text-[var(--color-text-primary)] focus:outline-none"
                >
                  {confirmationEmail
                    ? "Confirm your email"
                    : mode === "signIn"
                      ? "Enter Verdarium"
                      : "Create an account"}
                </h2>

                <p
                  id="auth-dialog-description"
                  className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]"
                >
                  {confirmationEmail
                    ? `A confirmation link was sent to ${confirmationEmail}. Follow it to open your private cloud collection.`
                    : mode === "signIn"
                      ? "Sign in to connect this browser with your private botanical collection."
                      : "Create a private account to preserve your botanical archive in the cloud."}
                </p>
              </div>

              {confirmationEmail ? (
                <div className="mt-8 border-t border-[var(--color-border)] pt-6">
                  <p
                    role="status"
                    className="text-sm leading-6 text-[var(--color-text-secondary)]"
                  >
                    Your collection in this browser remains
                    unchanged while confirmation is pending.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={() =>
                        handleModeChange("signIn")
                      }
                    >
                      Continue to sign in
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleClose}
                    >
                      Return to collection
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="mt-7 flex border-b border-[var(--color-border)]"
                    aria-label="Account action"
                  >
                    <button
                      type="button"
                      aria-pressed={mode === "signIn"}
                      className={`border-b-2 px-1 pb-3 pr-5 text-sm transition-colors ${
                        mode === "signIn"
                          ? "border-[var(--color-text-primary)] text-[var(--color-text-primary)]"
                          : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                      }`}
                      onClick={() =>
                        handleModeChange("signIn")
                      }
                    >
                      Sign in
                    </button>

                    <button
                      type="button"
                      aria-pressed={mode === "signUp"}
                      className={`border-b-2 px-1 pb-3 text-sm transition-colors ${
                        mode === "signUp"
                          ? "border-[var(--color-text-primary)] text-[var(--color-text-primary)]"
                          : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                      }`}
                      onClick={() =>
                        handleModeChange("signUp")
                      }
                    >
                      Create account
                    </button>
                  </div>

                  <form
                    className="mt-7 space-y-5"
                    onSubmit={handleSubmit}
                  >
                    <div>
                      <label
                        htmlFor="auth-email"
                        className="metadata-label"
                      >
                        Email
                      </label>

                      <input
                        id="auth-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        disabled={isSubmitting}
                        className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-focus)] focus:ring-2 focus:ring-[var(--color-focus)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="auth-password"
                        className="metadata-label"
                      >
                        Password
                      </label>

                      <input
                        id="auth-password"
                        name="password"
                        type="password"
                        autoComplete={
                          mode === "signIn"
                            ? "current-password"
                            : "new-password"
                        }
                        required
                        value={password}
                        disabled={isSubmitting}
                        className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-focus)] focus:ring-2 focus:ring-[var(--color-focus)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                        onChange={(event) =>
                          setPassword(
                            event.target.value,
                          )
                        }
                      />
                    </div>

                    {errorMessage ? (
                      <p
                        role="alert"
                        className="text-sm leading-6 text-[var(--color-text-secondary)]"
                      >
                        {errorMessage}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? mode === "signIn"
                            ? "Opening archive…"
                            : "Creating account…"
                          : mode === "signIn"
                            ? "Sign in"
                            : "Create account"}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isSubmitting}
                        onClick={handleClose}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </Surface>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}