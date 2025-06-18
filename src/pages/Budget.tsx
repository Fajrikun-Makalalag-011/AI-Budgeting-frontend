import React, { useEffect, useState } from "react";
import BudgetCard from "../components/BudgetCard";
import {
  fetchBudgets,
  fetchTransactions,
  fetchBudgets as setBudget,
} from "../lib/api";
import { useToast } from "../components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface Budget {
  category: string;
  budget_limit?: number;
  limit?: number;
}

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
  note?: string;
  description?: string;
}

// Icon mapping untuk kategori populer
const categoryIcons: Record<string, React.ReactNode> = {
  "Food & Dining": (
    <span role="img" aria-label="food">
      🍔
    </span>
  ),
  Transport: (
    <span role="img" aria-label="transport">
      🚌
    </span>
  ),
  Utilities: (
    <span role="img" aria-label="utilities">
      💡
    </span>
  ),
  Entertainment: (
    <span role="img" aria-label="entertainment">
      🎬
    </span>
  ),
  Shopping: (
    <span role="img" aria-label="shopping">
      🛍️
    </span>
  ),
  Health: (
    <span role="img" aria-label="health">
      💊
    </span>
  ),
  Other: (
    <span role="img" aria-label="other">
      📦
    </span>
  ),
};

const Budget: React.FC = () => {
  const token = localStorage.getItem("token") || "";
  const [budgets, setBudgetsState] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const refreshBudgets = () => {
    fetchBudgets(token)
      .then((data) => setBudgetsState(data as Budget[]))
      .catch(() => setBudgetsState([]));
  };

  useEffect(() => {
    setLoading(true);
    refreshBudgets();
    fetchTransactions(token)
      .then((data) => {
        const mapped = (data as Transaction[]).map(
          (t): Transaction => ({
            id: t.id?.toString() ?? "",
            description: t.note || t.description || "-",
            amount: t.amount,
            category: t.category,
            date: t.date,
            type: t.category === "Income" ? "income" : "expense",
            note: t.note,
          })
        );
        setTransactions(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit || isNaN(Number(limit))) {
      toast({
        title: "Error",
        description: "Kategori dan limit harus diisi dengan benar.",
        variant: "destructive",
      });
      return;
    }
    try {
      await fetch(
        `${
          import.meta.env.VITE_API_BASE || "http://localhost:3001/api"
        }/budgets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ category, limit: Number(limit) }),
        }
      );
      toast({
        title: editMode ? "Budget diupdate" : "Budget ditambahkan",
        description: `Kategori: ${category}`,
      });
      setCategory("");
      setLimit("");
      setEditMode(false);
      refreshBudgets();
    } catch {
      toast({ title: "Gagal menyimpan budget", variant: "destructive" });
    }
  };

  const handleDelete = async (cat: string) => {
    if (!window.confirm(`Yakin ingin menghapus budget kategori '${cat}'?`))
      return;
    try {
      await fetch(
        `${
          import.meta.env.VITE_API_BASE || "http://localhost:3001/api"
        }/budgets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ category: cat, limit: null }),
        }
      );
      toast({ title: "Budget dihapus", description: `Kategori: ${cat}` });
      refreshBudgets();
      if (category === cat) {
        setCategory("");
        setLimit("");
        setEditMode(false);
      }
    } catch {
      toast({ title: "Gagal menghapus budget", variant: "destructive" });
    }
  };

  const handleEdit = (b: Budget) => {
    setCategory(b.category);
    setLimit(String(b.budget_limit || b.limit || ""));
    setEditMode(true);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/")}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition"
      >
        <ArrowLeft size={20} /> Kembali ke Dashboard
      </button>
      <h2 className="text-3xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <HelpCircle className="text-blue-400" size={32} /> Budget Management
      </h2>
      <form
        onSubmit={handleSubmit}
        className="mb-8 bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-4 items-end border border-gray-100"
      >
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Kategori
          </label>
          <input
            className="border rounded px-3 py-2 w-48 focus:ring-2 focus:ring-blue-400"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Contoh: Food & Dining"
            required
            disabled={editMode}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Limit (Rp)
          </label>
          <input
            className="border rounded px-3 py-2 w-32 focus:ring-2 focus:ring-blue-400"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="Contoh: 2000000"
            required
            type="number"
            min={0}
          />
        </div>
        <button
          type="submit"
          className={`px-6 py-2 rounded font-semibold transition text-white ${
            editMode
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {editMode ? "Update Budget" : "Simpan Budget"}
        </button>
        {editMode && (
          <button
            type="button"
            className="ml-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
            onClick={() => {
              setCategory("");
              setLimit("");
              setEditMode(false);
            }}
          >
            Batal
          </button>
        )}
      </form>
      {budgets.length === 0 ? (
        <div className="text-gray-500">Tidak ada data budget.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const spent = transactions
              .filter((t) => t.category === b.category && t.type === "expense")
              .reduce((a, t) => a + t.amount, 0);
            const limitVal = b.budget_limit || b.limit || 0;
            const percent =
              limitVal > 0
                ? Math.min(100, Math.round((spent / limitVal) * 100))
                : 0;
            const over = spent > limitVal;
            let statusIcon = (
              <CheckCircle
                className="text-blue-500"
                size={20}
                aria-label="Aman"
              />
            );
            if (over)
              statusIcon = (
                <XCircle
                  className="text-red-500"
                  size={20}
                  aria-label="Melebihi limit"
                />
              );
            else if (percent >= 80)
              statusIcon = (
                <AlertTriangle
                  className="text-yellow-400"
                  size={20}
                  aria-label="Mendekati limit"
                />
              );
            const icon = categoryIcons[b.category] || (
              <HelpCircle
                className="text-gray-400"
                size={24}
                aria-label="Kategori"
              />
            );
            return (
              <div
                key={b.category}
                className="relative group bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{icon}</span>
                  <span className="font-semibold text-lg text-gray-700">
                    {b.category}
                  </span>
                  <span className="ml-auto">{statusIcon}</span>
                </div>
                <BudgetCard
                  title={`Budget: ${b.category}`}
                  amount={limitVal}
                  change={0}
                  type="expense"
                  category={b.category}
                  limit={limitVal}
                  spent={spent}
                />
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${
                        over
                          ? "bg-red-500"
                          : percent >= 80
                          ? "bg-yellow-400"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {percent}% dari limit terpakai
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(b)}
                    className="bg-green-500 text-white rounded px-2 py-1 text-xs hover:bg-green-700 flex items-center gap-1"
                    title="Edit budget"
                  >
                    <Edit2 size={14} aria-label="Edit" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(b.category)}
                    className="bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-700 flex items-center gap-1"
                    title="Hapus budget"
                  >
                    <Trash2 size={14} aria-label="Hapus" /> Hapus
                  </button>
                </div>
                {over && (
                  <div className="absolute bottom-2 right-2 text-xs text-red-600 font-bold flex items-center gap-1">
                    <XCircle size={14} aria-label="Melebihi limit" /> Melebihi
                    limit!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Budget;
