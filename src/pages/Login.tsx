import React, { useState } from "react";
import { loginUser } from "../lib/api";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await loginUser(email, password);
      localStorage.setItem("token", token);
      setError(null);
      // Redirect to dashboard on successful login
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-300 transition-all duration-500">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in"
      >
        <div className="flex flex-col items-center mb-8">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent tracking-wide drop-shadow">
            AI Budget Tracker
          </span>
          <span className="text-blue-700 text-sm mt-1 font-medium">
            Smart Financial Management
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
          Login
        </h2>
        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 rounded-lg px-4 py-2 text-center animate-shake">
            {error}
          </div>
        )}
        <div className="mb-4 relative">
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <span className="absolute left-3 top-9 text-gray-400">
            <Mail size={18} />
          </span>
          <input
            type="email"
            className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-blue-300 transition outline-none bg-gray-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="mb-6 relative">
          <label className="block mb-1 font-medium text-gray-700">
            Password
          </label>
          <span className="absolute left-3 top-9 text-gray-400">
            <Lock size={18} />
          </span>
          <input
            type="password"
            className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-blue-300 transition outline-none bg-gray-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg shadow-md hover:scale-[1.03] hover:shadow-xl transition-all duration-200 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="mt-6 text-center">
          <Link
            to="/register"
            className="text-blue-700 hover:underline font-medium transition"
          >
            Belum punya akun? Register
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
