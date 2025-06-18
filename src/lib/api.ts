// Helper API untuk integrasi backend

const API_BASE = "http://localhost:3001/api";

export interface TransactionResponse {
  id: string | number;
  note?: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
}

export async function fetchTransactions(token: string) {
  const res = await fetch(`${API_BASE}/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil data transaksi");
  return res.json();
}

export async function fetchBudgets(token: string) {
  const res = await fetch(`${API_BASE}/budgets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil data budget");
  return res.json();
}

export async function fetchBudgetAlerts(token: string) {
  const res = await fetch(`${API_BASE}/budgets/alert`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil data alert budget");
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login gagal");
  return res.json(); // { token }
}

export async function registerUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Registrasi gagal");
  return res.json();
}

export async function fetchAIInsights(token: string) {
  const res = await fetch(`${API_BASE}/insight`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil insight AI");
  return res.json();
}

export async function fetchProfile(token: string) {
  const res = await fetch(`${API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil profil user");
  return res.json();
}

export async function fetchGeminiBudgetAnalysis(
  token: string,
  transactions: TransactionResponse[]
) {
  const res = await fetch(`${API_BASE}/ai-budget-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ transactions }),
  });
  if (!res.ok) throw new Error("Gagal mengambil insight Gemini");
  return res.json(); // { insight }
}

// Tambahkan helper lain sesuai kebutuhan
