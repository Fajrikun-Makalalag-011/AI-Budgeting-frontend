import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import BudgetCard from "../components/BudgetCard";
import TransactionList from "../components/TransactionList";
import CategoryChart, { Transaction } from "../components/CategoryChart";
import TrendChart from "../components/TrendChart";
import {
  getTransactions,
  fetchBudgets,
  fetchBudgetAlerts,
  fetchAIInsights,
  fetchProfile,
  fetchGeminiBudgetAnalysis,
  createTransaction,
  createBudget,
} from "../lib/api";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";
import ReactMarkdown from "react-markdown";

interface Budget {
  category: string;
  budget_limit?: number;
  limit?: number;
}
interface Alert {
  category: string;
  alert?: boolean;
  warning?: boolean;
  spent?: number;
  limit?: number;
}
interface Insight {
  message: string;
}

interface TransactionResponse {
  id: string | number;
  note?: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token") || "";
  const [email, setEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({
    amount: "",
    category: "",
    date: "",
    description: "",
    source: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [customBudgetCategory, setCustomBudgetCategory] = useState("");
  const [customTxCategory, setCustomTxCategory] = useState("");
  const [geminiInsight, setGeminiInsight] = useState<string>("");

  const incomeKeywords = ["income"];
  const isIncomeCategory = (cat: string) =>
    incomeKeywords.some((k) => cat.trim().toLowerCase() === k);

  const transactionSources = [
    "Bank BRI",
    "Kartu Kredit BCA",
    "Kartu Kredit Mandiri",
  ];

  useEffect(() => {
    setLoading(true);
    getTransactions(token)
      .then((data) => {
        const mapped = (data as TransactionResponse[]).map(
          (t): Transaction => ({
            id: t.id?.toString() ?? "",
            description: t.note || t.description || "-",
            amount: t.amount,
            category: t.category,
            date: t.date,
            type: t.category === "Income" ? "income" : "expense",
          })
        );
        setTransactions(mapped);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    // Fetch budgets
    fetchBudgets(token)
      .then((data) => setBudgets(data as Budget[]))
      .catch(() => setBudgets([]));
    // Fetch alerts
    fetchBudgetAlerts(token)
      .then((data) => setAlerts(data as Alert[]))
      .catch(() => setAlerts([]));
    // Fetch AI insights
    fetchAIInsights(token)
      .then((data) => setInsights(data as Insight[]))
      .catch(() => setInsights([]));
    fetchProfile(token)
      .then((data) => setEmail(data.email))
      .catch(() => setEmail(""));
  }, [token]);

  // Hitung summary
  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => isIncomeCategory(t.category))
        .reduce((a, t) => a + t.amount, 0),
    [transactions]
  );
  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => !isIncomeCategory(t.category))
        .reduce((a, t) => a + t.amount, 0),
    [transactions]
  );
  const balance = totalIncome - totalExpense;

  // Dummy perubahan persentase (bisa dihitung dari data bulan lalu jika ada)
  const incomeChange = 0;
  const expenseChange = 0;
  const balanceChange = 0;

  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [transactions, searchQuery]
  );

  // Ambil kategori unik dari transaksi dan budget
  const presetIncomeCategories = ["Income"];
  const allCategories = Array.from(
    new Set([
      ...presetIncomeCategories,
      ...transactions.map((t) => t.category),
      ...budgets.map((b) => b.category),
    ])
  ).filter(Boolean);

  const exportToCSV = async () => {
    setExportLoading(true);
    try {
      const data = await getTransactions(token);
      const mapped = (data as TransactionResponse[]).map(
        (t): Transaction => ({
          id: t.id?.toString() ?? "",
          description: t.note || t.description || "-",
          amount: t.amount,
          category: t.category,
          date: t.date,
          type: t.category === "Income" ? "income" : "expense",
        })
      );
      setTransactions(mapped);
      // Export setelah data update
      const header = "Date,Category,Amount,Description";
      const rows = mapped.map((t) =>
        [t.date, t.category, t.amount, '"' + (t.description || "") + '"'].join(
          ","
        )
      );
      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions_report.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  };

  const handleOpenAiModal = async () => {
    setAiLoading(true);
    setGeminiInsight("");
    try {
      // Kirim data transaksi mentah ke Gemini
      const res = await fetchGeminiBudgetAnalysis(
        token,
        transactions.map((t) => ({
          id: t.id,
          note: undefined,
          description: t.description,
          amount: t.amount,
          category: t.category,
          date: t.date,
        }))
      );
      setGeminiInsight(res.insight || "Tidak ada insight dari Gemini.");
      setAiModalOpen(true);
    } catch (err) {
      setGeminiInsight("Gagal mengambil insight dari Gemini.");
      setAiModalOpen(true);
    } finally {
      setAiLoading(false);
    }
  };

  // Helper format Rupiah
  function formatRupiahInput(value: string) {
    const num = value.replace(/[^\d]/g, "");
    if (!num) return "";
    return "Rp " + num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function parseRupiahInput(value: string) {
    return value.replace(/[^\d]/g, "");
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          email={email}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="flex-1 overflow-auto p-8 w-full max-w-none">
          {/* Budget Cards */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <BudgetCard
              title="Total Income"
              amount={totalIncome}
              change={incomeChange}
              type="income"
            />
            <BudgetCard
              title="Total Expenses"
              amount={totalExpense}
              change={expenseChange}
              type="expense"
            />
            <BudgetCard
              title="Balance"
              amount={balance}
              change={balanceChange}
              type="balance"
            />
          </div>
          {/* Budget Detail Cards */}
          {budgets.length > 0 && (
            <div className="grid grid-cols-3 gap-6 mb-6">
              {budgets.map((b) => {
                const spent = transactions
                  .filter(
                    (t) => t.category === b.category && t.type === "expense"
                  )
                  .reduce((a, t) => a + t.amount, 0);
                return (
                  <BudgetCard
                    key={b.category}
                    title={`Budget: ${b.category}`}
                    amount={b.budget_limit || b.limit}
                    change={0}
                    type="expense"
                    category={b.category}
                    limit={b.budget_limit || b.limit}
                    spent={spent}
                  />
                );
              })}
            </div>
          )}
          {/* Charts Section */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <TrendChart transactions={transactions} />
            <CategoryChart transactions={transactions} />
          </div>
          {/* AI Insights & Alerts */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Alert dari backend */}
            {alerts.length > 0 ? (
              alerts.map((a) => (
                <div
                  key={a.category}
                  className={`rounded-xl p-6 text-white ${
                    a.alert
                      ? "bg-gradient-to-r from-orange-500 to-red-600"
                      : a.warning
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                      : "bg-gradient-to-r from-green-500 to-teal-600"
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {a.alert
                      ? "⚠️ Limit Exceeded"
                      : a.warning
                      ? "⚠️ Warning"
                      : "✅ Safe"}
                  </h3>
                  <p className="mb-3">
                    Kategori <b>{a.category}</b>:
                    {a.alert
                      ? ` Pengeluaran bulan ini (${a.spent}) sudah melebihi limit (${a.limit})!`
                      : a.warning
                      ? ` Pengeluaran bulan ini (${a.spent}) sudah mencapai 80% dari limit (${a.limit}).`
                      : ` Pengeluaran masih aman.`}
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">
                  ✅ All Budgets Safe
                </h3>
                <p className="mb-3">
                  Tidak ada kategori yang melebihi atau mendekati limit bulan
                  ini.
                </p>
              </div>
            )}
          </div>
          {/* Recent Transactions */}
          <div className="grid grid-cols-3 gap-6">
            <TransactionList
              token={token}
              transactions={filteredTransactions}
            />
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
                      onClick={() => setAddModalOpen(true)}
                    >
                      Add New Transaction
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Transaction</DialogTitle>
                      <DialogDescription>
                        Masukkan detail transaksi baru.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      className="space-y-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setAddLoading(true);
                        setAddError("");
                        // Validasi
                        if (
                          !newTx.amount ||
                          isNaN(Number(newTx.amount)) ||
                          Number(newTx.amount) <= 0
                        ) {
                          setAddError("Amount harus diisi dan lebih dari 0");
                          setAddLoading(false);
                          return;
                        }
                        const categoryVal = newTx.category.startsWith(
                          "__custom:"
                        )
                          ? customTxCategory
                          : newTx.category;
                        if (!categoryVal) {
                          setAddError("Kategori harus diisi");
                          setAddLoading(false);
                          return;
                        }
                        if (!newTx.date) {
                          setAddError("Tanggal harus diisi");
                          setAddLoading(false);
                          return;
                        }
                        if (!newTx.source) {
                          setAddError("Sumber dana harus dipilih");
                          setAddLoading(false);
                          return;
                        }
                        try {
                          const res = await createTransaction(token, {
                            amount: Number(newTx.amount),
                            category: categoryVal,
                            date: newTx.date,
                            description: newTx.description,
                            source: newTx.source,
                          });
                          setAddModalOpen(false);
                          setNewTx({
                            amount: "",
                            category: "",
                            date: "",
                            description: "",
                            source: "",
                          });
                          // Refresh transaksi
                          getTransactions(token).then((data) => {
                            const mapped = (data as TransactionResponse[]).map(
                              (t): Transaction => ({
                                id: t.id?.toString() ?? "",
                                description: t.note || t.description || "-",
                                amount: t.amount,
                                category: t.category,
                                date: t.date,
                                type:
                                  t.category === "Income"
                                    ? "income"
                                    : "expense",
                              })
                            );
                            setTransactions(mapped);
                          });
                        } catch (err: unknown) {
                          if (err instanceof Error) {
                            setAddError(
                              err.message || "Gagal menambah transaksi"
                            );
                          } else {
                            setAddError("Gagal menambah transaksi");
                          }
                        } finally {
                          setAddLoading(false);
                        }
                      }}
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Amount"
                        value={
                          newTx.amount ? formatRupiahInput(newTx.amount) : ""
                        }
                        onChange={(e) => {
                          const raw = parseRupiahInput(e.target.value);
                          setNewTx({ ...newTx, amount: raw });
                        }}
                        required
                      />
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={
                          newTx.category.startsWith("__custom:")
                            ? "__custom"
                            : newTx.category
                        }
                        onChange={(e) => {
                          if (e.target.value === "__custom") {
                            setNewTx({
                              ...newTx,
                              category: "__custom:" + customTxCategory,
                            });
                          } else {
                            setNewTx({ ...newTx, category: e.target.value });
                            setCustomTxCategory("");
                          }
                        }}
                        required
                      >
                        <option value="">Pilih kategori</option>
                        {presetIncomeCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        {allCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__custom">+ Kategori Baru</option>
                      </select>
                      {newTx.category.startsWith("__custom:") ||
                      newTx.category === "__custom" ? (
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 mt-2"
                          placeholder="Kategori baru"
                          value={customTxCategory}
                          onChange={(e) => {
                            setCustomTxCategory(e.target.value);
                            setNewTx({
                              ...newTx,
                              category: "__custom:" + e.target.value,
                            });
                          }}
                          required
                        />
                      ) : null}
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={newTx.source}
                        onChange={(e) =>
                          setNewTx({ ...newTx, source: e.target.value })
                        }
                        required
                      >
                        <option value="">Pilih Sumber Dana</option>
                        {transactionSources.map((source) => (
                          <option key={source} value={source}>
                            {source}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        className="w-full border rounded px-3 py-2"
                        value={newTx.date}
                        onChange={(e) =>
                          setNewTx({ ...newTx, date: e.target.value })
                        }
                        required
                      />
                      <textarea
                        className="w-full border rounded px-3 py-2"
                        placeholder="Description"
                        value={newTx.description}
                        onChange={(e) =>
                          setNewTx({ ...newTx, description: e.target.value })
                        }
                      />
                      {addError && (
                        <div className="text-red-500 text-sm">{addError}</div>
                      )}
                      <DialogFooter>
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                          disabled={addLoading}
                        >
                          {addLoading ? "Menyimpan..." : "Simpan"}
                        </button>
                        <DialogClose asChild>
                          <button
                            type="button"
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                            disabled={addLoading}
                          >
                            Batal
                          </button>
                        </DialogClose>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={budgetModalOpen}
                  onOpenChange={setBudgetModalOpen}
                >
                  <DialogTrigger asChild>
                    <button
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                      onClick={() => setBudgetModalOpen(true)}
                    >
                      Set Budget Goals
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Budget Goals</DialogTitle>
                      <DialogDescription>
                        Atur limit budget per kategori.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      className="space-y-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setBudgetLoading(true);
                        setBudgetError("");
                        try {
                          const budgetData = {
                            category: budgetCategory.startsWith("__custom:")
                              ? customBudgetCategory
                              : budgetCategory,
                            limit: Number(budgetLimit),
                          };
                          await createBudget(token, budgetData);
                          setBudgetModalOpen(false);
                          setBudgetCategory("");
                          setBudgetLimit("");
                          // Refresh budgets
                          fetchBudgets(token).then((data) =>
                            setBudgets(data as Budget[])
                          );
                        } catch (err: unknown) {
                          if (err instanceof Error) {
                            setBudgetError(
                              err.message || "Gagal menyimpan budget"
                            );
                          } else {
                            setBudgetError("Gagal menyimpan budget");
                          }
                        } finally {
                          setBudgetLoading(false);
                        }
                      }}
                    >
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={
                          budgetCategory.startsWith("__custom:")
                            ? "__custom"
                            : budgetCategory
                        }
                        onChange={(e) => {
                          if (e.target.value === "__custom") {
                            setBudgetCategory(
                              "__custom:" + customBudgetCategory
                            );
                          } else {
                            setBudgetCategory(e.target.value);
                            setCustomBudgetCategory("");
                          }
                        }}
                        required
                      >
                        <option value="">Pilih kategori</option>
                        {presetIncomeCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        {allCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__custom">+ Kategori Baru</option>
                      </select>
                      {budgetCategory.startsWith("__custom:") ||
                      budgetCategory === "__custom" ? (
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 mt-2"
                          placeholder="Kategori baru"
                          value={customBudgetCategory}
                          onChange={(e) => {
                            setCustomBudgetCategory(e.target.value);
                            setBudgetCategory("__custom:" + e.target.value);
                          }}
                          required
                        />
                      ) : null}
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Limit"
                        value={
                          budgetLimit ? formatRupiahInput(budgetLimit) : ""
                        }
                        onChange={(e) => {
                          const raw = parseRupiahInput(e.target.value);
                          setBudgetLimit(raw);
                        }}
                        required
                      />
                      {budgetError && (
                        <div className="text-red-500 text-sm">
                          {budgetError}
                        </div>
                      )}
                      <DialogFooter>
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                          disabled={budgetLoading}
                        >
                          {budgetLoading ? "Menyimpan..." : "Simpan"}
                        </button>
                        <DialogClose asChild>
                          <button
                            type="button"
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                            disabled={budgetLoading}
                          >
                            Batal
                          </button>
                        </DialogClose>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={exportDialogOpen}
                  onOpenChange={setExportDialogOpen}
                >
                  <DialogTrigger asChild>
                    <button
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                      onClick={exportToCSV}
                      disabled={exportLoading}
                    >
                      Export Report
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Export Report</DialogTitle>
                      <DialogDescription>
                        Ekspor seluruh transaksi ke file CSV. Lanjutkan?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        onClick={exportToCSV}
                        disabled={exportLoading}
                      >
                        {exportLoading ? "Loading..." : "Download CSV"}
                      </button>
                      <DialogClose asChild>
                        <button
                          type="button"
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                        >
                          Batal
                        </button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200 font-medium"
                      onClick={handleOpenAiModal}
                    >
                      AI Budget Analysis (Gemini)
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-full">
                    <DialogHeader>
                      <DialogTitle>AI Budget Analysis (Gemini)</DialogTitle>
                      <DialogDescription>
                        Insight dan analisis AI Gemini berdasarkan data
                        transaksi Anda.
                      </DialogDescription>
                    </DialogHeader>
                    {aiLoading ? (
                      <div className="text-center py-8">Loading...</div>
                    ) : (
                      <div className="space-y-4 max-h-80 overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 min-h-[350px] text-white prose prose-invert max-w-none whitespace-pre-line">
                          <ReactMarkdown>{geminiInsight}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <DialogClose asChild>
                        <button
                          type="button"
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded mt-4"
                        >
                          Tutup
                        </button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
