import React, { useState, useEffect } from "react";
import { fetchProfile, deleteAllUserData } from "../lib/api";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { useToast } from "../components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Settings: React.FC = () => {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notif, setNotif] = useState<string | null>(null);
  const [notifType, setNotifType] = useState<"success" | "error">("success");
  const [isDeleting, setIsDeleting] = useState(false);
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();
  const { toast } = useToast();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    fetchProfile(token)
      .then((data) => setEmail(data.email))
      .catch(() => setEmail("Gagal mengambil email"));
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setNotif(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setNotifType("error");
      setNotif("Semua field harus diisi.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotifType("error");
      setNotif("Password baru dan konfirmasi tidak sama.");
      return;
    }
    if (newPassword.length < 6) {
      setNotifType("error");
      setNotif("Password baru minimal 6 karakter.");
      return;
    }
    // Simulasi sukses (karena backend endpoint belum ada)
    setNotifType("success");
    setNotif("Password berhasil diubah (simulasi, backend belum tersedia).");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAllData = async () => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus semua data transaksi dan budget? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "Otentikasi tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        });
        setIsDeleting(false);
        return;
      }

      const data = await deleteAllUserData(token);

      console.log("Backend response:", data);
      toast({
        title: "Sukses",
        description: data.message || "Semua data Anda telah berhasil dihapus.",
      });
      // Refresh halaman atau reset state aplikasi jika perlu
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete user data:", error);
      toast({
        title: "Gagal Menghapus Data",
        description:
          (error as Error).message || "Terjadi kesalahan pada server.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/")}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition"
      >
        <ArrowLeft size={20} /> Kembali ke Dashboard
      </button>
      <h2 className="text-3xl font-bold mb-6 text-blue-800">Settings</h2>
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold mb-4">Akun</h3>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            className="border rounded px-3 py-2 w-full bg-gray-100"
            value={email}
            disabled
          />
        </div>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition font-semibold"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Ganti Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password Lama
            </label>
            <input
              type="password"
              className="border rounded px-3 py-2 w-full"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password Baru
            </label>
            <input
              type="password"
              className="border rounded px-3 py-2 w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              className="border rounded px-3 py-2 w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
          >
            Ganti Password
          </button>
          {notif && (
            <div
              className={`mt-2 text-sm font-medium ${
                notifType === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {notif}
            </div>
          )}
        </form>
      </div>
      {/* Danger Zone */}
      <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
        <p className="text-red-700 mt-2 mb-4">
          Tindakan berikut tidak dapat dibatalkan. Pastikan Anda benar-benar
          yakin.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 transition font-semibold">
              Delete All Transactions
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Apakah Anda benar-benar yakin?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus seluruh data transaksi Anda secara
                permanen dan tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAllData}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Semua"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {/* Tambahkan pengaturan lain di sini */}
    </div>
  );
};

export default Settings;
