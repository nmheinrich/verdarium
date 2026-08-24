export type StorageReadResult =
  | {
      success: true;
      value: string | null;
    }
  | {
      success: false;
      error: StorageAccessError;
    };

export type StorageWriteResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: StorageAccessError;
    };

export interface StorageAccessError {
  code: "unavailable" | "read-failed" | "write-failed" | "remove-failed";
  message: string;
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStorageItem(key: string): StorageReadResult {
  const storage = getLocalStorage();

  if (!storage) {
    return {
      success: false,
      error: {
        code: "unavailable",
        message: "Local storage is not available.",
      },
    };
  }

  try {
    return {
      success: true,
      value: storage.getItem(key),
    };
  } catch {
    return {
      success: false,
      error: {
        code: "read-failed",
        message: "Unable to read from local storage.",
      },
    };
  }
}

export function writeStorageItem(
  key: string,
  value: string,
): StorageWriteResult {
  const storage = getLocalStorage();

  if (!storage) {
    return {
      success: false,
      error: {
        code: "unavailable",
        message: "Local storage is not available.",
      },
    };
  }

  try {
    storage.setItem(key, value);

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: {
        code: "write-failed",
        message: "Unable to write to local storage.",
      },
    };
  }
}

export function removeStorageItem(key: string): StorageWriteResult {
  const storage = getLocalStorage();

  if (!storage) {
    return {
      success: false,
      error: {
        code: "unavailable",
        message: "Local storage is not available.",
      },
    };
  }

  try {
    storage.removeItem(key);

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: {
        code: "remove-failed",
        message: "Unable to remove data from local storage.",
      },
    };
  }
}