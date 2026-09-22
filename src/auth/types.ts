export interface AuthUser {
  id: string;
  email: string | null;
}

export type AuthState =
  | {
      status: "initializing";
      user: null;
      message: null;
    }
  | {
      status: "signedOut";
      user: null;
      message: string | null;
    }
  | {
      status: "signedIn";
      user: AuthUser;
      message: null;
    }
  | {
      status: "error";
      user: null;
      message: string;
    };

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export type AuthResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: AuthError;
    };

export type SignUpOutcome =
  | {
      status: "authenticated";
      user: AuthUser;
    }
  | {
      status: "confirmationRequired";
      email: string;
    };

export interface SignInOutcome {
  user: AuthUser;
}

export interface AuthContextValue {
  state: AuthState;

  signUp(
    credentials: AuthCredentials,
  ): Promise<AuthResult<SignUpOutcome>>;

  signIn(
    credentials: AuthCredentials,
  ): Promise<AuthResult<SignInOutcome>>;

  signOut(): Promise<AuthResult<void>>;
}