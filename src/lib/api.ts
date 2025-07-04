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

export const registerUser = async (formData: Record<string, any>) => {
  const response = await fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to register");
  }
};

export async function fetchAIInsights(token: string) {
  const res = await fetch(`${API_BASE}/api/insight`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil insight AI");
  return res.json();
}

export const fetchProfile = async (token: string) => {
  const res = await fetch(`${API_BASE}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil profil user");
  return res.json();
};

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
  expense_type?: "tetap" | "variabel"; // Tambahkan di sini
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

export const generateBudgetPlan = async (token: string, prompt: string) => {
  const response = await fetch(`${API_BASE}/api/generate-budget`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to generate budget plan");
  }

  return response.json();
};

export const saveBudgetPlan = async (token: string, plan: any[]) => {
  const response = await fetch(`${API_BASE}/api/save-budget-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to save budget plan");
  }

  return response.json();
};

interface ProfileData {
  nama: string;
  umur: number | "";
  tempat_tinggal: string;
  status_pernikahan: string;
  tipe_tempat_tinggal: string;
  biaya_tanggungan: string;
  punya_kendaraan: boolean;
  nomor_wa: string;
  gaji_per_bulan: number | "";
  email?: string;
}

export const fetchProfileDetails = async (
  token: string
): Promise<ProfileData> => {
  const response = await fetch(`${API_BASE}/api/profile-details`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch profile details");
  }
  return response.json();
};

export const updateProfileDetails = async (
  token: string,
  profileData: ProfileData
) => {
  const response = await fetch(`${API_BASE}/api/profile-details`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update profile");
  }
  return response.json();
};

// --- Payment Sources API ---

export interface PaymentSource {
  id: string;
  name: string;
  type?: string;
  user_id: string;
  created_at: string;
}

export const getPaymentSources = async (
  token: string
): Promise<PaymentSource[]> => {
  const response = await fetch(`${API_BASE}/api/payment-sources`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch payment sources");
  }
  return response.json();
};

export const addPaymentSource = async (
  token: string,
  sourceData: { name: string; type?: string }
): Promise<PaymentSource> => {
  const response = await fetch(`${API_BASE}/api/payment-sources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sourceData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add payment source");
  }
  return response.json();
};

export const updatePaymentSource = async (
  token: string,
  id: string,
  sourceData: { name: string; type?: string }
): Promise<PaymentSource> => {
  const response = await fetch(`${API_BASE}/api/payment-sources/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sourceData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update payment source");
  }
  return response.json();
};

export const deletePaymentSource = async (token: string, id: string) => {
  const response = await fetch(`${API_BASE}/api/payment-sources/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete payment source");
  }
  // DELETE request returns 204 No Content, so no JSON to return
};

// Tambahkan helper lain sesuai kebutuhan
