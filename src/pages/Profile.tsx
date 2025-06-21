import React, { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Edit, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchProfileDetails,
  updateProfileDetails,
  getPaymentSources,
  addPaymentSource,
  deletePaymentSource,
  updatePaymentSource,
  PaymentSource,
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
  email?: string; // Jadikan opsional agar cocok dengan tipe di api.ts
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

  // State untuk Payment Sources
  const [sources, setSources] = useState<PaymentSource[]>([]);
  const [sourceLoading, setSourceLoading] = useState<boolean>(true);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSource, setEditingSource] = useState<PaymentSource | null>(
    null
  );
  const [newSourceName, setNewSourceName] = useState<string>("");
  const [newSourceType, setNewSourceType] = useState<string>("");

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        setSourceLoading(false);
        return;
      }
      try {
        setLoading(true);
        setSourceLoading(true);
        const [profileData, sourcesData] = await Promise.all([
          fetchProfileDetails(token),
          getPaymentSources(token),
        ]);
        setFormData(profileData);
        setSources(sourcesData);
      } catch (err) {
        setError((err as Error).message);
        setSourceError((err as Error).message);
      } finally {
        setLoading(false);
        setSourceLoading(false);
      }
    };

    loadData();
  }, [token]);

  const handleOpenModal = (source: PaymentSource | null = null) => {
    setEditingSource(source);
    setNewSourceName(source ? source.name : "");
    setNewSourceType(source ? source.type || "" : "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSource(null);
    setNewSourceName("");
    setNewSourceType("");
  };

  const handleSaveSource = async () => {
    if (!newSourceName) return;
    setSourceLoading(true);

    const sourceData = { name: newSourceName, type: newSourceType };

    try {
      if (editingSource) {
        // Update
        const updatedSource = await updatePaymentSource(
          token,
          editingSource.id,
          sourceData
        );
        setSources(
          sources.map((s) => (s.id === editingSource.id ? updatedSource : s))
        );
      } else {
        // Create
        const newSource = await addPaymentSource(token, sourceData);
        setSources([...sources, newSource]);
      }
      handleCloseModal();
    } catch (err) {
      setSourceError((err as Error).message);
    } finally {
      setSourceLoading(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus sumber dana ini?")) {
      return;
    }
    setSourceLoading(true);
    try {
      await deletePaymentSource(token, id);
      setSources(sources.filter((s) => s.id !== id));
    } catch (err) {
      setSourceError((err as Error).message);
    } finally {
      setSourceLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Pastikan gaji adalah angka sebelum mengirim
      const dataToSend = {
        ...formData,
        gaji_per_bulan:
          typeof formData.gaji_per_bulan === "string"
            ? parseRupiah(formData.gaji_per_bulan)
            : formData.gaji_per_bulan,
      };
      await updateProfileDetails(token, dataToSend);
      setSuccess("Profil berhasil diperbarui!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/dashboard")}
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
              type="text"
              name="gaji_per_bulan"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
              value={formatRupiah(formData.gaji_per_bulan)}
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
            className="w-full md:w-auto bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>

      {/* Bagian Kelola Sumber Dana */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-800">
            Kelola Sumber Dana
          </h3>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition"
          >
            <PlusCircle size={20} /> Tambah Baru
          </button>
        </div>

        {sourceLoading && <div className="text-center">Loading sources...</div>}
        {sourceError && (
          <div className="text-red-500 bg-red-100 p-3 rounded-lg">
            Error: {sourceError}
          </div>
        )}
        {!sourceLoading && !sourceError && (
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-4">Nama</th>
                    <th className="p-4">Tipe</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source) => (
                    <tr key={source.id} className="border-b">
                      <td className="p-4 font-medium">{source.name}</td>
                      <td className="p-4 text-gray-600">{source.type}</td>
                      <td className="p-4 flex justify-end items-center gap-4">
                        <button
                          onClick={() => handleOpenModal(source)}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteSource(source.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sources.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500">
                        Anda belum menambahkan sumber dana.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal untuk Add/Edit Sumber Dana */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSource ? "Edit Sumber Dana" : "Tambah Sumber Dana Baru"}
            </DialogTitle>
            <DialogDescription>
              Masukkan nama dan tipe sumber dana Anda, misalnya "Bank BCA"
              dengan tipe "Bank".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="sourceName" className="block mb-1 font-medium">
                Nama Sumber Dana
              </label>
              <input
                id="sourceName"
                type="text"
                className="w-full border rounded-lg px-4 py-2"
                placeholder="cth: Gaji BNI, Dompet OVO"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="sourceType" className="block mb-1 font-medium">
                Tipe (Opsional)
              </label>
              <input
                id="sourceType"
                type="text"
                className="w-full border rounded-lg px-4 py-2"
                placeholder="cth: Bank, E-Wallet, Tunai"
                value={newSourceType}
                onChange={(e) => setNewSourceType(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button
                type="button"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Batal
              </button>
            </DialogClose>
            <button
              onClick={handleSaveSource}
              disabled={sourceLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {sourceLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
