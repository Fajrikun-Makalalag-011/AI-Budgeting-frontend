import React from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface BudgetCardProps {
  title: string;
  amount: number;
  change: number;
  type: "income" | "expense" | "balance";
  category?: string;
  limit?: number;
  spent?: number;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  title,
  amount,
  change,
  type,
  category,
  limit,
  spent,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getIcon = () => {
    switch (type) {
      case "income":
        return <TrendingUp className="text-green-500" size={24} />;
      case "expense":
        return <TrendingDown className="text-red-500" size={24} />;
      default:
        return <DollarSign className="text-blue-500" size={24} />;
    }
  };

  const getChangeColor = () => {
    if (type === "expense") {
      return change > 0 ? "text-red-500" : "text-green-500";
    }
    return change > 0 ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        {getIcon()}
      </div>

      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-800">
          {formatCurrency(amount)}
        </p>
        <div className="flex items-center space-x-1">
          <span className={`text-sm font-medium ${getChangeColor()}`}>
            {change > 0 ? "+" : ""}
            {change}%
          </span>
          <span className="text-gray-500 text-sm">vs last month</span>
        </div>
        {/* Tampilkan detail budget jika ada */}
        {category && limit !== undefined && spent !== undefined && (
          <div className="mt-2 text-sm text-gray-600">
            <div>
              Kategori: <span className="font-semibold">{category}</span>
            </div>
            <div>
              Limit:{" "}
              <span className="font-semibold">{formatCurrency(limit)}</span>
            </div>
            <div>
              Terpakai:{" "}
              <span className="font-semibold">{formatCurrency(spent)}</span>
            </div>
            <div>
              Sisa:{" "}
              <span className="font-semibold">
                {formatCurrency(limit - spent)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;
