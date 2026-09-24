import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { format } from "date-fns";

import type { Specimen, SpecimenReminder } from "@/types";

import {
  recordCare,
  skipCare,
  snoozeCare,
  type CareResult,
} from "./careService";
import type { CareMutationResult } from "./types";

/** How long "Recorded · <date>" offers Undo before the record is saved. */
export const CARE_COMMIT_DELAY_MS = 6000;

const MESSAGE_CLEAR_DELAY_MS = 8000;

// PostgREST: no function matches the call. The note migration
// (20260924090000) adds p_note; until it is applied, a call with a
// note fails with this code.
const FUNCTION_NOT_FOUND = "PGRST202";

export interface PendingCareRecord {
  actionId: string;
  specimenId: string;
  specimenName: string;
  completedAt: string;
  note?: string;
}

export interface TileCareMessage {
  tone: "status" | "error";
  text: string;
}

export type CareActionOutcome =
  | { ok: true }
  | { ok: false; message: string };

export interface TileCareController {
  pending: Record<string, PendingCareRecord>;
  busy: Record<string, boolean>;
  messages: Record<string, TileCareMessage>;
  recordCare: (specimen: Specimen) => void;
  undo: (specimenId: string) => void;
  setNote: (specimenId: string, note: string) => void;
  /** Pauses the pending commit while the note popover is open. */
  setNoteOpen: (specimenId: string, open: boolean) => void;
  snooze: (
    specimen: Specimen,
    snoozedUntil: string,
  ) => Promise<CareActionOutcome>;
  skip: (specimen: Specimen) => Promise<CareActionOutcome>;
  /** Saves every pending record now (page hide, sign out). */
  flushAll: () => Promise<void>;
}

export const TileCareContext =
  createContext<TileCareController | null>(null);

export function useTileCareController(): TileCareController | null {
  return useContext(TileCareContext);
}

function getLocalDateValue(date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

function formatCareDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);

  return format(new Date(year, month - 1, day), "MMM d");
}

function without<T>(record: Record<string, T>, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}

/**
 * Care recorded from specimen tiles (spec 001).
 *
 * Record care is a deferred commit: the tile shows "Recorded" with Undo
 * and Add note straight away, and the RPC runs after CARE_COMMIT_DELAY_MS,
 * or at once when the page is hidden. Undo cancels before anything is
 * written, and a note added in the window travels with the record.
 */
export function useTileCare(
  onReminderChange: (
    specimenId: string,
    reminder: SpecimenReminder,
  ) => void,
): TileCareController {
  const [pending, setPending] = useState<
    Record<string, PendingCareRecord>
  >({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<
    Record<string, TileCareMessage>
  >({});

  const pendingRef = useRef<Record<string, PendingCareRecord>>({});
  const timersRef = useRef(new Map<string, number>());
  const messageTimersRef = useRef(new Map<string, number>());
  // Action ids kept after a failed call, so a retry is idempotent if the
  // first call reached the server.
  const retryActionIdsRef = useRef<Record<string, string>>({});
  const onReminderChangeRef = useRef(onReminderChange);

  useEffect(() => {
    onReminderChangeRef.current = onReminderChange;
  }, [onReminderChange]);

  const setPendingRecords = useCallback(
    (next: Record<string, PendingCareRecord>) => {
      pendingRef.current = next;
      setPending(next);
    },
    [],
  );

  const setBusyFor = useCallback(
    (specimenId: string, value: boolean) => {
      setBusy((current) =>
        value
          ? { ...current, [specimenId]: true }
          : without(current, specimenId),
      );
    },
    [],
  );

  const setMessage = useCallback(
    (specimenId: string, message: TileCareMessage | null) => {
      const timers = messageTimersRef.current;
      window.clearTimeout(timers.get(specimenId));
      timers.delete(specimenId);

      setMessages((current) =>
        message
          ? { ...current, [specimenId]: message }
          : without(current, specimenId),
      );

      if (message) {
        timers.set(
          specimenId,
          window.setTimeout(() => {
            timers.delete(specimenId);
            setMessages((current) => without(current, specimenId));
          }, MESSAGE_CLEAR_DELAY_MS),
        );
      }
    },
    [],
  );

  const takeActionId = (key: string): string => {
    const existing = retryActionIdsRef.current[key];

    if (existing) {
      return existing;
    }

    const actionId = crypto.randomUUID();
    retryActionIdsRef.current[key] = actionId;
    return actionId;
  };

  const releaseActionId = (key: string) => {
    delete retryActionIdsRef.current[key];
  };

  const clearTimer = useCallback((specimenId: string) => {
    window.clearTimeout(timersRef.current.get(specimenId));
    timersRef.current.delete(specimenId);
  }, []);

  const commit = useCallback(
    async (specimenId: string) => {
      const record = pendingRef.current[specimenId];

      if (!record) {
        return;
      }

      clearTimer(specimenId);
      setPendingRecords(without(pendingRef.current, specimenId));
      setBusyFor(specimenId, true);

      const input = {
        actionId: record.actionId,
        specimenId,
        completedAt: record.completedAt,
      };

      let result: CareResult<CareMutationResult> = await recordCare({
        ...input,
        note: record.note,
      });

      let noteDropped = false;

      if (
        !result.success &&
        record.note &&
        result.error.code === FUNCTION_NOT_FOUND
      ) {
        result = await recordCare(input);
        noteDropped = result.success;
      }

      setBusyFor(specimenId, false);

      const recordKey = `record:${specimenId}:${record.completedAt}`;

      if (!result.success) {
        setMessage(specimenId, {
          tone: "error",
          text: `Care was not recorded. ${result.error.message}`,
        });
        return;
      }

      releaseActionId(recordKey);

      if (!result.data.reminder) {
        setMessage(specimenId, {
          tone: "error",
          text: "Care was recorded, but the updated care date could not be read. Reload to see it.",
        });
        return;
      }

      onReminderChangeRef.current(specimenId, result.data.reminder);

      const nextDueAt = result.data.reminder.nextDueAt;

      setMessage(specimenId, {
        tone: "status",
        text: noteDropped
          ? "Care recorded. The note was not saved, because the archive does not accept care notes yet."
          : nextDueAt
            ? `Care recorded. Next care ${formatCareDate(nextDueAt)}.`
            : "Care recorded.",
      });
    },
    [clearTimer, setBusyFor, setMessage, setPendingRecords],
  );

  const schedule = useCallback(
    (specimenId: string) => {
      clearTimer(specimenId);
      timersRef.current.set(
        specimenId,
        window.setTimeout(() => {
          void commit(specimenId);
        }, CARE_COMMIT_DELAY_MS),
      );
    },
    [clearTimer, commit],
  );

  const flushAll = useCallback(async () => {
    await Promise.all(
      Object.keys(pendingRef.current).map((specimenId) =>
        commit(specimenId),
      ),
    );
  }, [commit]);

  // Save pending records when the page is hidden or closed, and when the
  // app unmounts.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flushAll();
      }
    };

    const handlePageHide = () => {
      void flushAll();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
      window.removeEventListener("pagehide", handlePageHide);
      void flushAll();
    };
  }, [flushAll]);

  useEffect(() => {
    const messageTimers = messageTimersRef.current;

    return () => {
      messageTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const recordCareForSpecimen = useCallback(
    (specimen: Specimen) => {
      if (pendingRef.current[specimen.id]) {
        return;
      }

      const completedAt = getLocalDateValue();

      setMessage(specimen.id, null);
      setPendingRecords({
        ...pendingRef.current,
        [specimen.id]: {
          actionId: takeActionId(`record:${specimen.id}:${completedAt}`),
          specimenId: specimen.id,
          specimenName: specimen.commonName,
          completedAt,
        },
      });
      schedule(specimen.id);
    },
    [schedule, setMessage, setPendingRecords],
  );

  const undo = useCallback(
    (specimenId: string) => {
      if (!pendingRef.current[specimenId]) {
        return;
      }

      clearTimer(specimenId);
      setPendingRecords(without(pendingRef.current, specimenId));
      setMessage(specimenId, {
        tone: "status",
        text: "Care record undone.",
      });
    },
    [clearTimer, setMessage, setPendingRecords],
  );

  const setNote = useCallback(
    (specimenId: string, note: string) => {
      const record = pendingRef.current[specimenId];

      if (!record) {
        return;
      }

      setPendingRecords({
        ...pendingRef.current,
        [specimenId]: { ...record, note: note.trim() || undefined },
      });
    },
    [setPendingRecords],
  );

  const setNoteOpen = useCallback(
    (specimenId: string, open: boolean) => {
      if (!pendingRef.current[specimenId]) {
        return;
      }

      if (open) {
        clearTimer(specimenId);
      } else {
        schedule(specimenId);
      }
    },
    [clearTimer, schedule],
  );

  const runReminderAction = useCallback(
    async (
      specimen: Specimen,
      actionKey: string,
      run: (actionId: string) => Promise<CareResult<CareMutationResult>>,
      describe: (reminder: SpecimenReminder) => string,
    ): Promise<CareActionOutcome> => {
      setBusyFor(specimen.id, true);
      setMessage(specimen.id, null);

      const result = await run(takeActionId(actionKey));

      setBusyFor(specimen.id, false);

      if (!result.success) {
        return { ok: false, message: result.error.message };
      }

      releaseActionId(actionKey);

      if (!result.data.reminder) {
        return {
          ok: false,
          message:
            "The change was saved, but the updated care date could not be read. Reload to see it.",
        };
      }

      onReminderChangeRef.current(specimen.id, result.data.reminder);
      setMessage(specimen.id, {
        tone: "status",
        text: describe(result.data.reminder),
      });

      return { ok: true };
    },
    [setBusyFor, setMessage],
  );

  const snooze = useCallback(
    (specimen: Specimen, snoozedUntil: string) =>
      runReminderAction(
        specimen,
        `snooze:${specimen.id}:${snoozedUntil}`,
        (actionId) =>
          snoozeCare({
            actionId,
            specimenId: specimen.id,
            snoozedUntil,
          }),
        () => `Care snoozed until ${formatCareDate(snoozedUntil)}.`,
      ),
    [runReminderAction],
  );

  const skip = useCallback(
    (specimen: Specimen) =>
      runReminderAction(
        specimen,
        `skip:${specimen.id}`,
        (actionId) =>
          skipCare({
            actionId,
            specimenId: specimen.id,
          }),
        (reminder) =>
          reminder.nextDueAt
            ? `Occurrence skipped. Next care ${formatCareDate(
                reminder.nextDueAt,
              )}.`
            : "Occurrence skipped.",
      ),
    [runReminderAction],
  );

  return useMemo(
    () => ({
      pending,
      busy,
      messages,
      recordCare: recordCareForSpecimen,
      undo,
      setNote,
      setNoteOpen,
      snooze,
      skip,
      flushAll,
    }),
    [
      pending,
      busy,
      messages,
      recordCareForSpecimen,
      undo,
      setNote,
      setNoteOpen,
      snooze,
      skip,
      flushAll,
    ],
  );
}
