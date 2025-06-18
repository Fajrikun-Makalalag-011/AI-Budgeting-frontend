import React from "react";
import TransactionList from "../components/TransactionList";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Transactions: React.FC = () => {
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <button
        onClick={() => navigate("/")}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition"
      >
        <ArrowLeft size={20} /> Kembali ke Dashboard
      </button>
      <h2 className="text-2xl font-bold mb-4">All Transactions</h2>
      <TransactionList token={token} />
    </div>
  );
};

export default Transactions;
