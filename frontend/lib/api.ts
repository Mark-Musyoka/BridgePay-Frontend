// ──────────────────────────────────────────────
// BridgePay — Typed API client
// Thin fetch wrapper for every backend endpoint.
// ──────────────────────────────────────────────

import type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
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
  return request<User>("/auth/register", {
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

  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: formData.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

// ─── User endpoints ──────────────────────────

/**
 * GET /users/me
 * Returns the currently authenticated user's profile.
 */
export async function getMe(token: string): Promise<User> {
  return request<User>("/users/me", { method: "GET" }, token);
}

// ─── Account endpoints ──────────────────────

/**
 * GET /accounts/me
 * Returns the authenticated user's account (balance, currency, etc.).
 */
export async function getAccount(token: string): Promise<Account> {
  return request<Account>("/accounts/me", { method: "GET" }, token);
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
    "/transfers",
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
    `/transactions?${params.toString()}`,
    { method: "GET" },
    token,
  );
}
