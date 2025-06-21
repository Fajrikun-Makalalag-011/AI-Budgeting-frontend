import React, { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { getTransactions } from "../lib/api";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

interface TransactionResponse {
  id: string | number;
  note?: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
}

interface TransactionListProps {
  token: string;
  transactions?: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({
  token,
  transactions: propTransactions,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propTransactions) {
      setTransactions(propTransactions);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    getTransactions(token)
      .then((data) => {
        // Map data backend ke format Transaction jika perlu
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
  }, [token, propTransactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Transactions
      </h3>
      <div className="space-y-3">
        {transactions.length === 0 && (
          <div className="text-gray-500">No transactions found.</div>
        )}
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${
                  transaction.type === "income"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {transaction.type === "income" ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {transaction.description}
                </p>
                <p className="text-sm text-gray-500">
                  {transaction.category} • {formatDate(transaction.date)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold ${
                  transaction.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 transition-colors">
          View All Transactions
        </button>
      </div>
    </div>
  );
};

export default TransactionList;
