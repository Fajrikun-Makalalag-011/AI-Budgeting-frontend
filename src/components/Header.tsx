import React, { useEffect, useState } from "react";
import { Bell, Search, User } from "lucide-react";
import { fetchBudgetAlerts } from "../lib/api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

interface HeaderProps {
  email: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

interface AlertItem {
  category: string;
  alert?: boolean;
  warning?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  email,
  searchQuery,
  onSearchChange,
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token") || "";
    setToken(t);
    if (t) {
      fetchBudgetAlerts(t)
        .then((data) => setAlerts(data))
        .catch(() => setAlerts([]));
    }
  }, []);

  const unreadCount = alerts.length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {alerts.length === 0 ? (
                <DropdownMenuItem>Tidak ada notifikasi.</DropdownMenuItem>
              ) : (
                alerts.map((a, idx) => (
                  <DropdownMenuItem
                    key={idx}
                    className="whitespace-normal break-words"
                  >
                    <span className="font-semibold">{a.category}</span>:{" "}
                    {a.alert
                      ? `Pengeluaran melebihi limit!`
                      : a.warning
                      ? `Pengeluaran hampir limit.`
                      : `Aman.`}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center focus:outline-none">
                <User size={16} className="text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Profil</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="text-gray-700 font-medium">
                  {email || "User"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
