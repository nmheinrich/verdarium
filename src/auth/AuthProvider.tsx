import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Session } from "@supabase/supabase-js";

import { AuthContext } from "@/auth/AuthContext";
import {
  deleteOwnAccount,
  mapSupabaseUser,
  signInWithPassword,
  signOutFromBrowser,
  signUpWithPassword,
} from "@/auth/authService";
import type {
  AuthContextValue,
  AuthState,
} from "@/auth/types";
import { supabase } from "@/lib/supabase";

const initialAuthState: AuthState = {
  status: "initializing",
  user: null,
  message: null,
};

function getStateFromSession(
  session: Session | null,
): AuthState {
  if (!session?.user) {
    return {
      status: "signedOut",
      user: null,
      message: null,
    };
  }

  return {
    status: "signedIn",
    user: mapSupabaseUser(session.user),
    message: null,
  };
}

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [state, setState] =
    useState<AuthState>(initialAuthState);

  useEffect(() => {
    let isActive = true;
    let authEventRevision = 0;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isActive) {
          return;
        }

        authEventRevision += 1;
        setState(getStateFromSession(session));
      },
    );

    const revisionBeforeSessionCheck =
      authEventRevision;

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (
          !isActive ||
          authEventRevision !==
            revisionBeforeSessionCheck
        ) {
          return;
        }

        if (error) {
          setState({
            status: "error",
            user: null,
            message:
              "Verdarium could not restore the private session. Your browser collection remains unchanged.",
          });
          return;
        }

        setState(getStateFromSession(data.session));
      })
      .catch(() => {
        if (
          !isActive ||
          authEventRevision !==
            revisionBeforeSessionCheck
        ) {
          return;
        }

        setState({
          status: "error",
          user: null,
          message:
            "Verdarium could not restore the private session. Your browser collection remains unchanged.",
        });
      });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextValue["signUp"] =
    useCallback(async (credentials) => {
      const result =
        await signUpWithPassword(credentials);

      if (
        result.success &&
        result.data.status === "authenticated"
      ) {
        setState({
          status: "signedIn",
          user: result.data.user,
          message: null,
        });
      }

      return result;
    }, []);

  const signIn: AuthContextValue["signIn"] =
    useCallback(async (credentials) => {
      const result =
        await signInWithPassword(credentials);

      if (result.success) {
        setState({
          status: "signedIn",
          user: result.data.user,
          message: null,
        });
      }

      return result;
    }, []);

  const signOut: AuthContextValue["signOut"] =
    useCallback(async () => {
      const result = await signOutFromBrowser();

      if (result.success) {
        setState({
          status: "signedOut",
          user: null,
          message: null,
        });
      }

      return result;
    }, []);

  const deleteAccount: AuthContextValue["deleteAccount"] =
    useCallback(async () => {
      const result = await deleteOwnAccount();

      if (result.success) {
        setState({
          status: "signedOut",
          user: null,
          message: null,
        });
      }

      return result;
    }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      signUp,
      signIn,
      signOut,
      deleteAccount,
    }),
    [
      deleteAccount,
      signIn,
      signOut,
      signUp,
      state,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}