// User & Auth Types
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin?: boolean;
  created_at: string;
}

export type RegisterResponse = User;
export type UserResponse = User;

export interface LoginRequest {
  username: string; // email passed to OAuth2 password flow
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string; // e.g. "bearer"
  user?: User;
}

// Account Types
export interface Account {
  id: string;
  balance: string | number;
  currency: string;
  created_at: string;
}

export type AccountResponse = Account;

export interface TopUpRequest {
  amount: number;
  currency?: string;
  payment_method?: string;
}

// Transfer & Transaction Types
export interface TransferRequest {
  to_email: string;
  amount: number;
  reference_note?: string;
}

export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'flagged';
export type TransactionType = 'transfer_sent' | 'transfer_received' | 'topup' | 'deposit' | 'withdrawal';

export interface Transaction {
  id: string;
  from_account_id: string;
  to_account_id: string;
  from_user_email?: string;
  to_user_email?: string;
  amount: string | number;
  currency: string;
  status: TransactionStatus | string;
  type: TransactionType | string;
  reference_note?: string | null;
  created_at: string;
  is_flagged?: boolean;
}

export type TransferResponse = Transaction;

export interface TransactionsQuery {
  page?: number;
  page_size?: number;
  status?: string;
  type?: string;
  search?: string;
}

export interface PaginatedTransactionsResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
}

// Stats & Metrics
export interface DashboardStats {
  current_balance: number;
  currency: string;
  total_sent: number;
  total_received: number;
  transaction_count: number;
  monthly_growth_rate: number;
}

export interface AdminStats {
  total_volume: number;
  total_users: number;
  total_transactions: number;
  flagged_transactions_count: number;
}

// API Error Response
export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg: string;
  type?: string;
}

export interface ApiErrorResponse {
  detail?: string | ApiErrorDetail[];
}
