// Helper API untuk integrasi backend

const API_BASE = "http://localhost:3001";
export const AI_API_BASE = "http://localhost:5000";

export interface TransactionResponse {
  id: string | number;
  note?: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
}

export const getTransactions = async (token) => {
  const res = await fetch(`${API_BASE}/api/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil data transaksi");
  return res.json();
};

export async function fetchBudgets(token: string) {
  const res = await fetch(`${API_BASE}/api/budgets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil data budget");
  return res.json();
}

export async function fetchBudgetAlerts(token: string) {
  const res = await fetch(`${API_BASE}/api/budgets/alert`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil data alert budget");
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login gagal");
  return res.json(); // { token }
}

export async function registerUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Registrasi gagal");
  return res.json();
}

export async function fetchAIInsights(token: string) {
  const res = await fetch(`${API_BASE}/api/insight`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil insight AI");
  return res.json();
}

export async function fetchProfile(token: string) {
  const res = await fetch(`${API_BASE}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil profil user");
  return res.json();
}

export async function fetchGeminiBudgetAnalysis(
  token: string,
  transactions: TransactionResponse[]
) {
  const res = await fetch(`${AI_API_BASE}/predict-budget`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ transactions }),
  });
  if (!res.ok) throw new Error("Gagal mengambil insight Gemini");
  return res.json();
}

export async function fetchAIClassify(description: string) {
  const res = await fetch(`${AI_API_BASE}/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });
  if (!res.ok) throw new Error("Gagal mengklasifikasi kategori");
  return res.json(); // { category }
}

interface NewTransactionData {
  amount: number;
  category: string;
  date: string;
  description: string;
  source?: string;
  note?: string;
}

export async function createTransaction(
  token: string,
  transactionData: NewTransactionData
) {
  const res = await fetch(`${API_BASE}/api/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(transactionData),
  });
  if (!res.ok) throw new Error("Gagal membuat transaksi");
  return res.json();
}

interface NewBudgetData {
  category: string;
  limit: number;
}

export async function createBudget(token: string, budgetData: NewBudgetData) {
  const res = await fetch(`${API_BASE}/api/budgets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(budgetData),
  });
  if (!res.ok) throw new Error("Gagal membuat budget");
  return res.json();
}

export const deleteAllUserData = async (token: string) => {
  const response = await fetch(`${API_BASE}/api/user-data/all`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete user data");
  }

  return response.json();
};

// Tambahkan helper lain sesuai kebutuhan
