// ──────────────────────────────────────────────
// BridgePay — Typed API client
// Thin fetch wrapper for every backend endpoint.
// ──────────────────────────────────────────────

import type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  VerifyEmailRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  User,
  Account,
  TransferRequest,
  Transaction,
  PaginatedTransactions,
  ApiError,
} from "@/types";

// ─── Base URL ────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Error class ─────────────────────────────

/**
 * Thrown by every API helper when the backend returns a non-2xx status.
 * Consumers can inspect `.status` and `.message` for error handling.
 */
export class ApiRequestError extends Error implements ApiError {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

// ─── Internal helpers ────────────────────────

/**
 * Core fetch wrapper.
 * - Attaches Authorization header when `token` is provided.
 * - Parses JSON and throws `ApiRequestError` on non-2xx responses.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Default to JSON content type for requests with a body,
  // unless the caller already set one (e.g. form-urlencoded for login).
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 204 No Content (e.g. logout)
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const data = await response.json();

  if (!response.ok) {
    // FastAPI returns { "detail": "..." } for errors
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : JSON.stringify(data?.detail ?? data);
    throw new ApiRequestError(response.status, message);
  }

  return data as T;
}

// ─── Auth endpoints ──────────────────────────

/**
 * POST /auth/register
 * Creates a new user account.
 */
export async function register(body: RegisterRequest): Promise<User> {
  return request<User>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT.
 * Note: The backend expects form-urlencoded, NOT JSON.
 */
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", body.username);
  formData.append("password", body.password);

  return request<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: formData.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

/**
 * POST /api/v1/auth/refresh
 * Exchanges a refresh token for a new access + refresh token pair.
 * The old refresh token is single-use and invalidated after this call.
 */
export async function refresh(body: RefreshRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /api/v1/auth/logout
 * Revokes the given refresh token server-side.
 */
export async function logout(body: RefreshRequest): Promise<void> {
  return request<void>("/api/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /api/v1/auth/verify-email
 * Confirms a user's email using the token from the (mocked) verification
 * email. 204 on success, 400 if the token is invalid/expired/already used.
 */
export async function verifyEmail(body: VerifyEmailRequest): Promise<void> {
  return request<void>("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /api/v1/auth/password-reset-request
 * Always returns 204, whether or not the email is registered — this is
 * deliberate (prevents an attacker from probing which emails exist), so
 * don't treat the response as confirmation the email exists.
 */
export async function requestPasswordReset(
  body: PasswordResetRequest,
): Promise<void> {
  return request<void>("/api/v1/auth/password-reset-request", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /api/v1/auth/password-reset-confirm
 * On success this revokes ALL of the user's refresh tokens server-side —
 * any other logged-in device/tab gets signed out too.
 */
export async function confirmPasswordReset(
  body: PasswordResetConfirmRequest,
): Promise<void> {
  return request<void>("/api/v1/auth/password-reset-confirm", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── User endpoints ──────────────────────────

/**
 * GET /users/me
 * Returns the currently authenticated user's profile.
 */
export async function getMe(token: string): Promise<User> {
  return request<User>("/api/v1/users/me", { method: "GET" }, token);
}

// ─── Account endpoints ──────────────────────

/**
 * GET /accounts/me
 * Returns the authenticated user's account (balance, currency, etc.).
 */
export async function getAccount(token: string): Promise<Account> {
  return request<Account>("/api/v1/accounts/me", { method: "GET" }, token);
}

// ─── Transfer endpoints ─────────────────────

/**
 * POST /transfers
 * Sends money to another user by email.
 */
export async function createTransfer(
  body: TransferRequest,
  token: string,
): Promise<Transaction> {
  return request<Transaction>(
    "/api/v1/transfers",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    token,
  );
}

// ─── Transaction endpoints ──────────────────

/**
 * GET /transactions?page=<n>&page_size=<n>
 * Returns a paginated list of the user's transactions.
 */
export async function getTransactions(
  token: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<PaginatedTransactions> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  return request<PaginatedTransactions>(
    `/api/v1/transactions?${params.toString()}`,
    { method: "GET" },
    token,
  );
}
