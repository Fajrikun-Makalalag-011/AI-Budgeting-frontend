import React from "react";
import { Home, CreditCard, PieChart, Settings, LogOut } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: CreditCard, label: "Transactions", path: "/transactions" },
    { icon: PieChart, label: "Budget", path: "/budget" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-blue-900 to-purple-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
          AI Budget Tracker
        </h1>
        <p className="text-blue-200 text-sm mt-1">Smart Financial Management</p>
      </div>

      <nav className="flex-1 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white bg-opacity-20 text-white shadow-lg"
                  : "text-blue-200 hover:bg-white hover:bg-opacity-10 hover:text-white"
              }`}
            >
              <Icon size={20} className="mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white border-opacity-20">
        <button
          className="flex items-center px-4 py-3 text-blue-200 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 w-full"
          onClick={handleLogout}
        >
          <LogOut size={20} className="mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
