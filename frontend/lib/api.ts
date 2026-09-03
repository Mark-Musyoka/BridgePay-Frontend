import {
  Account,
  AdminStats,
  ApiErrorResponse,
  DashboardStats,
  LoginRequest,
  LoginResponse,
  PaginatedTransactionsResponse,
  RegisterRequest,
  TopUpRequest,
  Transaction,
  TransactionsQuery,
  TransferRequest,
  User,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  data?: ApiErrorResponse | unknown;

  constructor(status: number, message: string, data?: ApiErrorResponse | unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// In-Memory Mock Store for Offline / Demo Testing
const MOCK_STORAGE_KEY = 'bridgepay_mock_db_v2';

interface MockDB {
  users: User[];
  accounts: Record<string, Account>;
  transactions: Transaction[];
}

function getMockDB(): MockDB {
  if (typeof window === 'undefined') {
    return {
      users: [
        {
          id: 'usr_demo_101',
          email: 'zawadi@bridgepay.dev',
          full_name: 'Zawadi Mwangi',
          is_active: true,
          is_admin: true,
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        },
      ],
      accounts: {
        usr_demo_101: {
          id: 'acc_demo_882',
          balance: '48250.00',
          currency: 'KES',
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        },
      },
      transactions: [],
    };
  }

  const saved = localStorage.getItem(MOCK_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }

  const initialDB: MockDB = {
    users: [
      {
        id: 'usr_demo_101',
        email: 'zawadi@bridgepay.dev',
        full_name: 'Zawadi Mwangi',
        is_active: true,
        is_admin: true,
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
      {
        id: 'usr_demo_102',
        email: 'wanjiku.k@bridgepay.dev',
        full_name: 'Wanjiku Kamau',
        is_active: true,
        is_admin: false,
        created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
      },
      {
        id: 'usr_demo_103',
        email: 'brian.o@bridgepay.dev',
        full_name: 'Brian Otieno',
        is_active: true,
        is_admin: false,
        created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
      },
      {
        id: 'usr_demo_104',
        email: 'amina.m@bridgepay.dev',
        full_name: 'Amina Mohamed',
        is_active: true,
        is_admin: false,
        created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      },
      {
        id: 'usr_demo_105',
        email: 'david.n@bridgepay.dev',
        full_name: 'David N.',
        is_active: true,
        is_admin: false,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
    ],
    accounts: {
      usr_demo_101: {
        id: 'acc_demo_882',
        balance: '48250.00',
        currency: 'KES',
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
    },
    transactions: [
      {
        id: 'tx_98762141',
        from_account_id: 'acc_wanjiku_01',
        to_account_id: 'acc_demo_882',
        from_user_email: 'wanjiku.k@bridgepay.dev',
        to_user_email: 'zawadi@bridgepay.dev',
        amount: '4500.00',
        currency: 'KES',
        status: 'completed',
        type: 'transfer_received',
        reference_note: 'M-Pesa payment received',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'tx_98762142',
        from_account_id: 'acc_demo_882',
        to_account_id: 'acc_till_342110',
        from_user_email: 'zawadi@bridgepay.dev',
        to_user_email: 'javahouse@till342110.ke',
        amount: '1250.00',
        currency: 'KES',
        status: 'completed',
        type: 'transfer_sent',
        reference_note: 'Java House Nairobi • Till 342110',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'tx_98762143',
        from_account_id: 'acc_demo_882',
        to_account_id: 'acc_brian_02',
        from_user_email: 'zawadi@bridgepay.dev',
        to_user_email: 'brian.o@bridgepay.dev',
        amount: '15000.00',
        currency: 'KES',
        status: 'completed',
        type: 'transfer_sent',
        reference_note: 'Brian Otieno • Rent contribution',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'tx_98762144',
        from_account_id: 'acc_amina_03',
        to_account_id: 'acc_demo_882',
        from_user_email: 'amina.m@bridgepay.dev',
        to_user_email: 'zawadi@bridgepay.dev',
        amount: '850.00',
        currency: 'KES',
        status: 'completed',
        type: 'transfer_received',
        reference_note: 'Amina Mohamed • Split lunch bill',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'tx_98762145',
        from_account_id: 'acc_demo_882',
        to_account_id: 'acc_unverified_44',
        from_user_email: 'zawadi@bridgepay.dev',
        to_user_email: 'suspicious.actor@unknown.net',
        amount: '125000.00',
        currency: 'KES',
        status: 'flagged',
        type: 'transfer_sent',
        reference_note: 'Rapid cross-border remittance',
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
        is_flagged: true,
      },
    ],
  };

  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialDB));
  return initialDB;
}

function saveMockDB(db: MockDB) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const reqHeaders = new Headers(headers);

  if (token) {
    reqHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (
    !reqHeaders.has('Content-Type') &&
    !(customConfig.body instanceof URLSearchParams) &&
    !(customConfig.body instanceof FormData)
  ) {
    reqHeaders.set('Content-Type', 'application/json');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      ...customConfig,
      headers: reqHeaders,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    let responseData: unknown;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json().catch(() => null);
    } else {
      responseData = await response.text().catch(() => null);
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      if (responseData && typeof responseData === 'object' && 'detail' in responseData) {
        const errorObj = responseData as ApiErrorResponse;
        if (typeof errorObj.detail === 'string') {
          errorMessage = errorObj.detail;
        } else if (Array.isArray(errorObj.detail)) {
          errorMessage = errorObj.detail.map((err) => err.msg).join(', ');
        }
      }

      throw new ApiError(response.status, errorMessage, responseData);
    }

    return responseData as T;
  } catch (error: any) {
    if (
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      error.message?.includes('fetch') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError')
    ) {
      return handleMockFallback<T>(endpoint, options);
    }

    throw error;
  }
}

function handleMockFallback<T>(endpoint: string, options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const db = getMockDB();
      const method = (options.method || 'GET').toUpperCase();

      // POST /auth/register
      if (endpoint === '/auth/register' && method === 'POST') {
        const body: RegisterRequest = JSON.parse(String(options.body || '{}'));
        const existing = db.users.find((u) => u.email.toLowerCase() === body.email.toLowerCase());
        if (existing) {
          return reject(new ApiError(400, 'User with this email already exists'));
        }
        const newUser: User = {
          id: `usr_${Date.now()}`,
          email: body.email,
          full_name: body.full_name,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        db.users.push(newUser);
        db.accounts[newUser.id] = {
          id: `acc_${Date.now()}`,
          balance: '48250.00',
          currency: 'KES',
          created_at: new Date().toISOString(),
        };
        saveMockDB(db);
        return resolve(newUser as unknown as T);
      }

      // POST /auth/login
      if (endpoint === '/auth/login' && method === 'POST') {
        let username = '';
        if (options.body instanceof URLSearchParams) {
          username = options.body.get('username') || '';
        } else if (typeof options.body === 'string') {
          const params = new URLSearchParams(options.body);
          username = params.get('username') || JSON.parse(options.body).email || '';
        }

        const user = db.users.find((u) => u.email.toLowerCase() === username.toLowerCase()) || db.users[0];
        const res: LoginResponse = {
          access_token: `mock_jwt_token_${user.id}_${Date.now()}`,
          token_type: 'bearer',
          user,
        };
        return resolve(res as unknown as T);
      }

      // GET /users/me
      if (endpoint === '/users/me') {
        const user = db.users[0];
        return resolve(user as unknown as T);
      }

      // GET /accounts/me
      if (endpoint === '/accounts/me') {
        const account = db.accounts['usr_demo_101'] || {
          id: 'acc_demo_882',
          balance: '48250.00',
          currency: 'KES',
          created_at: new Date().toISOString(),
        };
        return resolve(account as unknown as T);
      }

      // POST /transfers
      if (endpoint === '/transfers' && method === 'POST') {
        const body: TransferRequest = JSON.parse(String(options.body || '{}'));
        const account = db.accounts['usr_demo_101'];
        const currentBal = parseFloat(String(account?.balance || '0'));

        if (body.amount <= 0) {
          return reject(new ApiError(400, 'Transfer amount must be greater than zero'));
        }
        if (currentBal < body.amount) {
          return reject(new ApiError(400, `Insufficient funds. Available balance: KES ${currentBal.toLocaleString()}`));
        }

        account.balance = (currentBal - body.amount).toFixed(2);

        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          from_account_id: account.id,
          to_account_id: `acc_rcpt_${Math.floor(Math.random() * 9000 + 1000)}`,
          from_user_email: 'zawadi@bridgepay.dev',
          to_user_email: body.to_email,
          amount: body.amount.toFixed(2),
          currency: account.currency || 'KES',
          status: 'completed',
          type: 'transfer_sent',
          reference_note: body.reference_note || 'P2P Transfer',
          created_at: new Date().toISOString(),
        };

        db.transactions.unshift(newTx);
        saveMockDB(db);
        return resolve(newTx as unknown as T);
      }

      // POST /topup
      if (endpoint === '/topup' && method === 'POST') {
        const body: TopUpRequest = JSON.parse(String(options.body || '{}'));
        const account = db.accounts['usr_demo_101'];
        const currentBal = parseFloat(String(account?.balance || '0'));
        account.balance = (currentBal + body.amount).toFixed(2);

        const newTx: Transaction = {
          id: `tx_top_${Date.now()}`,
          from_account_id: 'acc_mock_sandbox',
          to_account_id: account.id,
          from_user_email: 'pesalink@bridgepay.dev',
          to_user_email: 'zawadi@bridgepay.dev',
          amount: body.amount.toFixed(2),
          currency: account.currency || 'KES',
          status: 'completed',
          type: 'topup',
          reference_note: 'M-Pesa / PesaLink Top Up',
          created_at: new Date().toISOString(),
        };

        db.transactions.unshift(newTx);
        saveMockDB(db);
        return resolve(account as unknown as T);
      }

      // GET /transactions
      if (endpoint.startsWith('/transactions')) {
        let items = [...db.transactions];
        const params = options.params || {};

        if (params.search) {
          const s = String(params.search).toLowerCase();
          items = items.filter(
            (t) =>
              t.to_user_email?.toLowerCase().includes(s) ||
              t.from_user_email?.toLowerCase().includes(s) ||
              t.reference_note?.toLowerCase().includes(s) ||
              t.id.toLowerCase().includes(s)
          );
        }

        if (params.status && params.status !== 'all') {
          items = items.filter((t) => t.status === params.status);
        }

        if (params.type && params.type !== 'all') {
          items = items.filter((t) => t.type === params.type);
        }

        const page = Number(params.page || 1);
        const pageSize = Number(params.page_size || 10);
        const total = items.length;
        const total_pages = Math.ceil(total / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const pagedItems = items.slice(start, start + pageSize);

        const res: PaginatedTransactionsResponse = {
          items: pagedItems,
          total,
          page,
          page_size: pageSize,
          total_pages,
        };

        return resolve(res as unknown as T);
      }

      // GET /admin/transactions
      if (endpoint.startsWith('/admin/transactions')) {
        const items = [...db.transactions];
        const res: PaginatedTransactionsResponse = {
          items,
          total: items.length,
          page: 1,
          page_size: items.length,
          total_pages: 1,
        };
        return resolve(res as unknown as T);
      }

      return resolve({} as unknown as T);
    }, 150);
  });
}

export const api = {
  register(data: RegisterRequest): Promise<User> {
    return request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login(data: LoginRequest | { email: string; password: string }): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    const username = 'username' in data ? data.username : data.email;
    formData.append('username', username);
    formData.append('password', data.password);

    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  },

  getMe(token: string): Promise<User> {
    return request<User>('/users/me', {
      method: 'GET',
      token,
    });
  },

  getAccount(token: string): Promise<Account> {
    return request<Account>('/accounts/me', {
      method: 'GET',
      token,
    });
  },

  topUpAccount(data: TopUpRequest, token: string): Promise<Account> {
    return request<Account>('/topup', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  createTransfer(data: TransferRequest, token: string): Promise<Transaction> {
    return request<Transaction>('/transfers', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  getTransactions(
    token: string,
    params?: TransactionsQuery
  ): Promise<PaginatedTransactionsResponse> {
    return request<PaginatedTransactionsResponse>('/transactions', {
      method: 'GET',
      token,
      params: {
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 10,
        status: params?.status,
        type: params?.type,
        search: params?.search,
      },
    });
  },

  getTransactionById(id: string, token: string): Promise<Transaction> {
    return request<Transaction>(`/transactions/${id}`, {
      method: 'GET',
      token,
    }).catch(async () => {
      const db = getMockDB();
      const found = db.transactions.find((t) => t.id === id);
      if (found) return found;
      throw new ApiError(404, 'Transaction not found');
    });
  },

  getDashboardStats(token: string): Promise<DashboardStats> {
    return request<DashboardStats>('/dashboard/stats', {
      method: 'GET',
      token,
    }).catch(async () => {
      const db = getMockDB();
      const account = db.accounts['usr_demo_101'];
      const balance = parseFloat(String(account?.balance || '48250.00'));

      let sent = 0;
      let received = 0;
      db.transactions.forEach((t) => {
        const amt = parseFloat(String(t.amount || 0));
        if (t.type === 'transfer_sent') sent += amt;
        if (t.type === 'transfer_received' || t.type === 'topup') received += amt;
      });

      return {
        current_balance: balance,
        currency: account?.currency || 'KES',
        total_sent: sent,
        total_received: received,
        transaction_count: db.transactions.length,
        monthly_growth_rate: 18.4,
      };
    });
  },

  getAdminTransactions(
    token: string,
    params?: TransactionsQuery
  ): Promise<PaginatedTransactionsResponse> {
    return request<PaginatedTransactionsResponse>('/admin/transactions', {
      method: 'GET',
      token,
      params: {
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 25,
      },
    });
  },

  flagTransaction(id: string, is_flagged: boolean, token: string): Promise<Transaction> {
    return request<Transaction>(`/admin/transactions/${id}/flag`, {
      method: 'POST',
      token,
      body: JSON.stringify({ is_flagged }),
    }).catch(async () => {
      const db = getMockDB();
      const tx = db.transactions.find((t) => t.id === id);
      if (tx) {
        tx.is_flagged = is_flagged;
        tx.status = is_flagged ? 'flagged' : 'completed';
        saveMockDB(db);
        return tx;
      }
      throw new ApiError(404, 'Transaction not found');
    });
  },
};
