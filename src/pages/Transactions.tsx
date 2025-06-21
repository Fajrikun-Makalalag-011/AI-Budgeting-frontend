import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Tipe data untuk form profil, cocokkan dengan yang di backend/database
interface ProfileData {
  nama: string;
  umur: number | "";
  tempat_tinggal: string;
  status_pernikahan: string;
  tipe_tempat_tinggal: string;
  biaya_tanggungan: string;
  punya_kendaraan: boolean;
  nomor_wa: string;
  gaji_per_bulan: number | "";
  email: string; // Email tidak bisa diubah
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileData>({
    nama: "",
    umur: "",
    tempat_tinggal: "",
    status_pernikahan: "Sendiri",
    tipe_tempat_tinggal: "Punya Rumah",
    biaya_tanggungan: "Sendiri",
    punya_kendaraan: false,
    nomor_wa: "",
    gaji_per_bulan: "",
    email: "",
  });

  const token = localStorage.getItem("token") || "";

  // useEffect(() => {
  //   // TODO: Panggil API untuk mengambil data profil
  //   // fetchProfileDetails(token).then(data => {
  //   //   setFormData(data);
  //   //   setLoading(false);
  //   // }).catch(err => {
  //   //   setError(err.message);
  //   //   setLoading(false);
  //   // });
  //   console.log("Fetching profile data...");
  //   setLoading(false); // Hapus ini setelah API siap
  // }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    // TODO: Panggil API untuk update data profil
    // updateProfileDetails(token, formData).then(() => {
    //   setSuccess("Profil berhasil diperbarui!");
    //   setLoading(false);
    // }).catch(err => {
    //   setError(err.message);
    //   setLoading(false);
    // });
    console.log("Updating profile with data:", formData);
    setTimeout(() => {
      setSuccess("Profil berhasil diperbarui! (Simulasi)");
      setLoading(false);
    }, 1500); // Simulasi
  };

  if (loading) {
    return <div className="p-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/")}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition"
      >
        <ArrowLeft size={20} /> Kembali ke Dashboard
      </button>

      <h2 className="text-3xl font-bold mb-6 text-blue-800">Profil Saya</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-8 border border-gray-100 space-y-6"
      >
        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg px-4 py-3">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email (Read-only) */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
              value={formData.email}
              disabled
            />
          </div>

          {/* Nama */}
          <div>
            <label
              htmlFor="nama"
              className="block mb-1 font-medium text-gray-700"
            >
              Nama Lengkap
            </label>
            <input
              id="nama"
              type="text"
              name="nama"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
              value={formData.nama}
              onChange={handleChange}
              required
            />
          </div>

          {/* Umur */}
          <div>
            <label
              htmlFor="umur"
              className="block mb-1 font-medium text-gray-700"
            >
              Umur
            </label>
            <input
              id="umur"
              type="number"
              name="umur"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
              value={formData.umur}
              onChange={handleChange}
              required
            />
          </div>

          {/* Gaji */}
          <div>
            <label
              htmlFor="gaji_per_bulan"
              className="block mb-1 font-medium text-gray-700"
            >
              Gaji per Bulan (Rp)
            </label>
            <input
              id="gaji_per_bulan"
              type="number"
              name="gaji_per_bulan"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
              value={formData.gaji_per_bulan}
              onChange={handleChange}
              required
            />
          </div>

          {/* Status Pernikahan */}
          <div>
            <label
              htmlFor="status_pernikahan"
              className="block mb-1 font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status_pernikahan"
              name="status_pernikahan"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
              value={formData.status_pernikahan}
              onChange={handleChange}
            >
              <option value="Sendiri">Sendiri</option>
              <option value="Berkeluarga">Berkeluarga</option>
            </select>
          </div>

          {/* Tipe Tempat Tinggal */}
          <div>
            <label
              htmlFor="tipe_tempat_tinggal"
              className="block mb-1 font-medium text-gray-700"
            >
              Tipe Tempat Tinggal
            </label>
            <select
              id="tipe_tempat_tinggal"
              name="tipe_tempat_tinggal"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
              value={formData.tipe_tempat_tinggal}
              onChange={handleChange}
            >
              <option value="Punya Rumah">Punya Rumah</option>
              <option value="Kost">Kost</option>
              <option value="Kontrak">Kontrak</option>
            </select>
          </div>

          {/* Biaya Tanggungan */}
          <div>
            <label
              htmlFor="biaya_tanggungan"
              className="block mb-1 font-medium text-gray-700"
            >
              Biaya Tanggungan
            </label>
            <select
              id="biaya_tanggungan"
              name="biaya_tanggungan"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
              value={formData.biaya_tanggungan}
              onChange={handleChange}
            >
              <option value="Sendiri">Sendiri</option>
              <option value="Keluarga">Keluarga</option>
              <option value="Orang Tua">Orang Tua</option>
            </select>
          </div>

          {/* Nomor WA */}
          <div>
            <label
              htmlFor="nomor_wa"
              className="block mb-1 font-medium text-gray-700"
            >
              Nomor WhatsApp
            </label>
            <input
              id="nomor_wa"
              type="text"
              name="nomor_wa"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
              value={formData.nomor_wa}
              onChange={handleChange}
              required
            />
          </div>
          {/* Kendaraan */}
          <div className="flex items-center gap-3 md:col-span-2">
            <input
              id="punya_kendaraan"
              type="checkbox"
              name="punya_kendaraan"
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
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
