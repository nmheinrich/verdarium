import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import type {
  AuthCredentials,
  AuthError,
  AuthResult,
  AuthUser,
  SignInOutcome,
  SignUpOutcome,
} from "@/auth/types";

interface SupabaseErrorShape {
  code?: unknown;
  message?: unknown;
  status?: unknown;
}

function hasErrorShape(value: unknown): value is SupabaseErrorShape {
  return typeof value === "object" && value !== null;
}

function getErrorCode(error: unknown): string {
  if (!hasErrorShape(error)) {
    return "unexpected_auth_error";
  }

  if (typeof error.code === "string" && error.code.length > 0) {
    return error.code;
  }

  return "unexpected_auth_error";
}

function createAuthError(
  code: string,
  message: string,
): AuthError {
  return {
    code,
    message,
  };
}

function normalizeAuthError(error: unknown): AuthError {
  const code = getErrorCode(error);

  switch (code) {
    case "invalid_credentials":
      return createAuthError(
        code,
        "The email and password did not match an account.",
      );

    case "email_not_confirmed":
      return createAuthError(
        code,
        "Please confirm your email before entering your private collection.",
      );

    case "user_already_exists":
      return createAuthError(
        code,
        "An account may already use this email. Try signing in instead.",
      );

    case "signup_disabled":
      return createAuthError(
        code,
        "New account registration is not available right now.",
      );

    case "weak_password":
      return createAuthError(
        code,
        "Choose a stronger password and try again.",
      );

    case "email_address_invalid":
    case "validation_failed":
      return createAuthError(
        code,
        "Enter a valid email address and password.",
      );

    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return createAuthError(
        code,
        "Too many requests were made. Please wait a moment before trying again.",
      );

    case "session_not_found":
      return createAuthError(
        code,
        "Your session is no longer available. Please sign in again.",
      );

    default:
      return createAuthError(
        code,
        "Verdarium could not complete the account request. Please try again.",
      );
  }
}

function validateCredentials(
  credentials: AuthCredentials,
): AuthResult<AuthCredentials> {
  const email = credentials.email.trim();

  if (!email || !credentials.password) {
    return {
      success: false,
      error: createAuthError(
        "missing_credentials",
        "Enter both an email address and password.",
      ),
    };
  }

  return {
    success: true,
    data: {
      email,
      password: credentials.password,
    },
  };
}

export function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
  };
}

export async function signUpWithPassword(
  credentials: AuthCredentials,
): Promise<AuthResult<SignUpOutcome>> {
  const validatedCredentials = validateCredentials(credentials);

  if (!validatedCredentials.success) {
    return validatedCredentials;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: validatedCredentials.data.email,
      password: validatedCredentials.data.password,
    });

    if (error) {
      return {
        success: false,
        error: normalizeAuthError(error),
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: createAuthError(
          "missing_auth_user",
          "Verdarium could not create the account. Please try again.",
        ),
      };
    }

    if (!data.session) {
      return {
        success: true,
        data: {
          status: "confirmationRequired",
          email: validatedCredentials.data.email,
        },
      };
    }

    return {
      success: true,
      data: {
        status: "authenticated",
        user: mapSupabaseUser(data.user),
      },
    };
  } catch {
    return {
      success: false,
      error: createAuthError(
        "auth_network_error",
        "Verdarium could not reach the private archive. Please check your connection and try again.",
      ),
    };
  }
}

export async function signInWithPassword(
  credentials: AuthCredentials,
): Promise<AuthResult<SignInOutcome>> {
  const validatedCredentials = validateCredentials(credentials);

  if (!validatedCredentials.success) {
    return validatedCredentials;
  }

  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: validatedCredentials.data.email,
        password: validatedCredentials.data.password,
      });

    if (error) {
      return {
        success: false,
        error: normalizeAuthError(error),
      };
    }

    if (!data.user || !data.session) {
      return {
        success: false,
        error: createAuthError(
          "missing_auth_session",
          "Verdarium could not establish a private session. Please try again.",
        ),
      };
    }

    return {
      success: true,
      data: {
        user: mapSupabaseUser(data.user),
      },
    };
  } catch {
    return {
      success: false,
      error: createAuthError(
        "auth_network_error",
        "Verdarium could not reach the private archive. Please check your connection and try again.",
      ),
    };
  }
}

export async function signOutFromBrowser(): Promise<AuthResult<void>> {
  try {
    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    if (error) {
      return {
        success: false,
        error: normalizeAuthError(error),
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch {
    return {
      success: false,
      error: createAuthError(
        "auth_network_error",
        "Verdarium could not complete sign-out. Please try again.",
      ),
    };
  }
}