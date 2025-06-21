import React, { useState } from "react";
import { registerUser } from "../lib/api";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Home,
  Briefcase,
  Car,
  Phone,
  DollarSign,
  Heart,
  Users,
  Building,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

// Tipe data untuk form
interface FormData {
  email: string;
  password: string;
  nama: string;
  umur: number | "";
  tempat_tinggal: string;
  status_pernikahan: string;
  tipe_tempat_tinggal: string;
  biaya_tanggungan: string;
  punya_kendaraan: boolean;
  nomor_wa: string;
  gaji_per_bulan: number | "";
}

const formatRupiah = (angka: number | string | undefined) => {
  if (angka === undefined || angka === null || angka === "") return "";
  const number_string = String(angka).replace(/[^,\d]/g, "");
  const split = number_string.split(",");
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
  return "Rp " + rupiah;
};

const parseRupiah = (rupiah: string) => {
  return Number(String(rupiah).replace(/[^0-9]/g, ""));
};

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    nama: "",
    umur: "",
    tempat_tinggal: "",
    status_pernikahan: "Sendiri",
    tipe_tempat_tinggal: "Punya Rumah",
    biaya_tanggungan: "Sendiri",
    punya_kendaraan: false,
    nomor_wa: "",
    gaji_per_bulan: "",
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "gaji_per_bulan") {
      setFormData((prev) => ({ ...prev, [name]: parseRupiah(value) }));
      return;
    }

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerUser(formData);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Registrasi gagal. Coba lagi.");
      setStep(1); // Kembali ke step 1 jika ada error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-300 p-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent tracking-wide drop-shadow">
            AI Budget Tracker
          </span>
          <h2 className="text-xl font-bold mt-2 text-center text-blue-800">
            Registrasi Akun Baru (Langkah {step}/3)
          </h2>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 rounded-lg px-4 py-2 text-center animate-shake">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 border border-green-300 text-green-700 rounded-lg px-4 py-2 text-center animate-fade-in">
            Registrasi berhasil! Anda akan dialihkan ke halaman login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Akun & Personal Dasar */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 className="font-semibold text-lg mb-3 text-gray-600">
                Informasi Akun
              </h3>
              {/* Email */}
              <div className="mb-4 relative">
                <label className="block mb-1 font-medium text-gray-700">
                  Email
                </label>
                <Mail
                  size={18}
                  className="absolute left-3 top-9 text-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-300 transition outline-none bg-gray-50"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* Password */}
              <div className="mb-4 relative">
                <label className="block mb-1 font-medium text-gray-700">
                  Password
                </label>
                <Lock
                  size={18}
                  className="absolute left-3 top-9 text-gray-400"
                />
                <input
                  type="password"
                  name="password"
                  className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-300 transition outline-none bg-gray-50"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              <h3 className="font-semibold text-lg mt-6 mb-3 text-gray-600">
                Data Diri
              </h3>
              {/* Nama */}
              <div className="mb-4 relative">
                <label className="block mb-1 font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <User
                  size={18}
                  className="absolute left-3 top-9 text-gray-400"
                />
                <input
                  type="text"
                  name="nama"
                  className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-300 transition outline-none bg-gray-50"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* Umur */}
              <div className="mb-4 relative">
                <label className="block mb-1 font-medium text-gray-700">
                  Umur
                </label>
                <input
                  type="number"
                  name="umur"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition outline-none bg-gray-50"
                  value={formData.umur}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold text-lg shadow-md hover:bg-blue-700 transition-all duration-200"
              >
                Selanjutnya <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* Step 2: Status & Kondisi */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h3 className="font-semibold text-lg mb-3 text-gray-600">
                Status & Kondisi
              </h3>
              {/* Status Pernikahan */}
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status_pernikahan"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition outline-none bg-gray-50"
                  value={formData.status_pernikahan}
                  onChange={handleChange}
                >
                  <option value="Sendiri">Sendiri</option>
                  <option value="Berkeluarga">Berkeluarga</option>
                </select>
              </div>
              {/* Tipe Tempat Tinggal */}
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">
                  Tipe Tempat Tinggal
                </label>
                <select
                  name="tipe_tempat_tinggal"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition outline-none bg-gray-50"
                  value={formData.tipe_tempat_tinggal}
                  onChange={handleChange}
                >
                  <option value="Punya Rumah">Punya Rumah</option>
                  <option value="Kost">Kost</option>
                  <option value="Kontrak">Kontrak</option>
                </select>
              </div>
              {/* Biaya Tanggungan */}
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">
                  Biaya Tanggungan
                </label>
                <select
                  name="biaya_tanggungan"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition outline-none bg-gray-50"
                  value={formData.biaya_tanggungan}
                  onChange={handleChange}
                >
                  <option value="Sendiri">Sendiri</option>
                  <option value="Keluarga">Keluarga</option>
                  <option value="Orang Tua">Orang Tua</option>
                </select>
              </div>
              {/* Punya Kendaraan */}
              <div className="mb-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  name="punya_kendaraan"
                  id="punya_kendaraan"
                  className="h-5 w-5 rounded"
                  checked={formData.punya_kendaraan}
                  onChange={handleChange}
                />
                <label
                  htmlFor="punya_kendaraan"
                  className="font-medium text-gray-700"
                >
                  Punya Kendaraan Pribadi
                </label>
              </div>
              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-full flex justify-center items-center gap-2 bg-gray-500 text-white py-3 rounded-lg font-bold text-lg shadow-md hover:bg-gray-600 transition-all duration-200"
                >
                  <ArrowLeft size={20} /> Kembali
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold text-lg shadow-md hover:bg-blue-700 transition-all duration-200"
                >
                  Selanjutnya <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Finansial & Kontak */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 className="font-semibold text-lg mb-3 text-gray-600">
                Finansial & Kontak
              </h3>
              {/* Gaji Per Bulan */}
              <div className="mb-4 relative">
                <label className="block mb-1 font-medium text-gray-700">
                  Gaji per Bulan
                </label>
                <DollarSign
                  size={18}
                  className="absolute left-3 top-9 text-gray-400"
                />
                <input
                  type="text"
                  name="gaji_per_bulan"
                  className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-300 transition outline-none bg-gray-50"
                  value={formatRupiah(formData.gaji_per_bulan)}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* Nomor WhatsApp */}
              <div className="mb-6 relative">
                <label className="block mb-1 font-medium text-gray-700">
                  Nomor WhatsApp Aktif
                </label>
                <Phone
                  size={18}
                  className="absolute left-3 top-9 text-gray-400"
                />
                <input
                  type="text"
                  name="nomor_wa"
                  placeholder="Contoh: 08123456789"
                  className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-300 transition outline-none bg-gray-50"
                  value={formData.nomor_wa}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-full flex justify-center items-center gap-2 bg-gray-500 text-white py-3 rounded-lg font-bold text-lg shadow-md hover:bg-gray-600 transition-all duration-200"
                >
                  <ArrowLeft size={20} /> Kembali
                </button>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-bold text-lg shadow-md hover:scale-[1.03] hover:shadow-xl transition-all duration-200 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-blue-700 hover:underline font-medium transition"
            >
              Sudah punya akun? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
